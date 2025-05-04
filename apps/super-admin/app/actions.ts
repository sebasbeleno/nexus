"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


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

  // Check if user has super_admin role
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (userError || !userData || userData.role !== 'super_admin') {
    // Sign out the user since they don't have appropriate permissions
    await supabase.auth.signOut()
    return encodedRedirect("error", "/", "Invalid email or password");
  }

  return redirect("/dashboard");
};


export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};
