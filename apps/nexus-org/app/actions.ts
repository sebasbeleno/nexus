"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserRole } from "@workspace/types"; 


export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/", error.message);
  }

  // Check user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single<{ role: UserRole }>() // Use the UserRole type

  if (userError || !userData) {
    // Sign out the user if role check fails
    await supabase.auth.signOut()
    return encodedRedirect("error", "/", "Could not retrieve user role.");
  }

  // Redirect based on role
  switch (userData.role) {
    // super_admin should likely use a different app/login, deny access here
    case 'super_admin':
      await supabase.auth.signOut()
      return encodedRedirect("error", "/", "Access denied for this application.");
    case 'admin':
      console.log("Redirecting admin user to /admin");
      return redirect("/admin");
    case 'analyst':
      return redirect("/analyst");
    default:
      // Sign out users with other roles (e.g., 'surveyor') or if role is unexpected
      await supabase.auth.signOut()
      return encodedRedirect("error", "/", "Access denied for this application.");
  }
};


export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};
