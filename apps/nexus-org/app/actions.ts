"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { UserRole } from "../../../packages/types/src/user";

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/login", error.message);
  }

  // Check user role
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single<{ role: UserRole }>(); // Use the UserRole type

  if (userError || !userData) {
    // Sign out the user if role check fails
    await supabase.auth.signOut();
    return encodedRedirect("error", "/login", "Could not retrieve user role.");
  }

  // Redirect based on role
  switch (userData.role) {
    // super_admin should likely use a different app/login, deny access here
    case "super_admin":
      await supabase.auth.signOut();
      return encodedRedirect("error", "/login", "Access denied for this application.");
    case "admin":
      console.log("Redirecting admin user to /admin");
      return redirect("/admin");
    case "analyst":
      return redirect("/analyst");
    default:
      // Sign out users with other roles (e.g., 'surveyor') or if role is unexpected
      await supabase.auth.signOut();
      return encodedRedirect("error", "/login", "Access denied for this application.");
  }
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
};

export async function updatePassword(newPassword: string): Promise<{ error?: string } | void> { // Return type can be void on redirect
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Error getting user or user not found:', authError?.message)
    // Redirect to login if user session is somehow lost during the process
    return redirect('/login?error=session_expired_during_reset')
  }

  // 1. Update the user's password in Supabase Auth
  const { error: updateAuthError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateAuthError) {
    console.error('Error updating auth password:', updateAuthError.message)
    // Provide a more user-friendly error message if possible
    return { error: `Failed to update password: ${updateAuthError.message}` }
  }

  // 2. Update the password_last_changed field in the users table to prevent reset loop
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({ password_last_changed: new Date().toISOString() }) // Set to current time
    .eq('id', user.id)

  if (updateProfileError) {
      console.error('Error updating password_last_changed in profile:', updateProfileError.message);
      // This is problematic. Password is changed in Auth, but profile isn't updated.
      // The user might get stuck. Return an error instructing them to contact support or retry.
      return { error: `Password updated, but failed to update profile status. Please try logging in again or contact support. Error: ${updateProfileError.message}` };
  }

  // 3. Fetch the user's role again to ensure correct redirection post-update.
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: UserRole }>()

  if (profileError || !userProfile) {
      console.error('Error fetching user profile after password update:', profileError?.message);
      // Password and profile status were updated, but role fetch failed.
      // Redirect to a default dashboard as a fallback.
      revalidatePath('/', 'layout')
      return redirect('/dashboard?message=password_updated_profile_fetch_error');
  }

  // 4. Determine redirect path based on role
  let redirectPath = '/dashboard' // Default
  if (userProfile.role === 'admin') {
    redirectPath = '/admin'
  } else if (userProfile.role === 'analyst') {
    redirectPath = '/analyst'
  }
  // Add other roles if necessary

  // 5. Revalidate cache and redirect to the appropriate page
  revalidatePath('/', 'layout') // Revalidate everything after password change
  redirect(`${redirectPath}?message=password_updated_successfully`) // No return needed after redirect
}
