import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { UserRole } from "../../../../packages/types/src/user";

export const updateSession = async (request: NextRequest) => {
  try {
    const pathname = request.nextUrl.pathname;

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use ANON_KEY for middleware
      {
        auth: {
          storageKey: 'nexus-org.auth.token',
          autoRefreshToken: true,
          persistSession: true,
        },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user }, // Destructure user directly
      error: authError, // Capture auth error
    } = await supabase.auth.getUser();


    // Handle unauthenticated users
    if (authError || !user) {
      // Protect specific routes for unauthenticated users
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/analyst") ||
        pathname.startsWith("/reset-password") // Protect reset-password page too
      ) {
        // No need to sign out if already unauthenticated or error occurred
        return NextResponse.redirect(new URL("/login", request.url));
      }
      // Allow access to public pages like /login or the root page
      return response;
    }
    // Fetch user profile including role and password_last_changed
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('role, password_last_changed')
      .eq('id', user.id)
      .single<{ role: UserRole; password_last_changed: string | null }>(); // Type the profile data

    if (userError) {
      console.error(`Error fetching user profile for ${user.id}:`, userError.message);
      await supabase.auth.signOut(); // Sign out if profile fetch fails
      return NextResponse.redirect(new URL("/login?error=profile_fetch_failed", request.url));
    }

    if (!userProfile) {
        console.error(`User profile not found for authenticated user: ${user.id}`);
        await supabase.auth.signOut(); // Sign out if profile doesn't exist
        return NextResponse.redirect(new URL("/login?error=profile_not_found", request.url));
    }

    const role = userProfile.role || "guest"; // Default role
    const needsPasswordReset = userProfile.password_last_changed === null;

  
    // --- Password Reset Logic ---
    // If password reset is needed and user is NOT on the reset page or auth callback, redirect them.
    if (needsPasswordReset && pathname !== '/reset-password' && !pathname.startsWith('/auth/callback')) {
        return NextResponse.redirect(new URL('/reset-password', request.url));
    }

    // --- Protect /reset-password Page ---
    // If user is on reset page but DOES NOT need a reset, redirect them away.
    if (pathname === '/reset-password' && !needsPasswordReset) {
        let redirectUrl = '/dashboard'; // Default redirect
        if (role === "admin") redirectUrl = "/admin";
        else if (role === "analyst") redirectUrl = "/analyst";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // --- Login Page Redirect for Authenticated Users ---
    // Redirect authenticated users away from /login, *unless* they need a password reset.
    if (pathname.startsWith("/login") && !needsPasswordReset) {
    let redirectUrl = '/dashboard'; // Default redirect
      if (role === "admin") redirectUrl = "/admin";
      else if (role === "analyst") redirectUrl = "/analyst";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // --- Role-Based Access Control (Only if password reset is NOT needed) ---
    if (!needsPasswordReset) {
        // Protect /admin route
        if (pathname.startsWith("/admin") && role !== "admin") {
          return NextResponse.rewrite(new URL('/404', request.url)); // Show 404 for unauthorized access
        }

        // Protect /analyst route
        if (pathname.startsWith("/analyst") && role !== "analyst") {
          return NextResponse.rewrite(new URL('/404', request.url)); // Show 404
        }
    }

    // Allow access if none of the above conditions triggered a redirect/rewrite
    return response;

  } catch (e) {
    // Fallback: Allow request processing to avoid blocking the site entirely
    // Consider redirecting to a generic error page in production
    return NextResponse.next();
  }
};

// Removed the duplicate/unused createClient function definition
