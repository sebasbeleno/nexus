import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { UserRole } from "../../../../packages/types/src/user";

export const updateSession = async (request: NextRequest) => {
  try {
    const pathname = request.nextUrl.pathname;
    console.log("Request URL:", request.url);

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      data,
      error,
    } = await supabase.auth.getUser();

    console.log("Supabase user data:", data);
    const user = data.user;

    // Handle unauthenticated users
    if (error || !user) {
      console.log("User not authenticated or error fetching user:", error?.message);
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/analyst")
      ) {
        console.log("Redirecting unauthenticated user to /login");
        await supabase.auth.signOut(); // Sign out the user if they are not authenticated
        return NextResponse.redirect(new URL("/login", request.url));
      }
      // Allow access to public pages like /login or the root page if it's public
      return response;
    }

    // Handle authenticated users
    console.log(`User ${user.id} authenticated.`);

    // Role-based access control
    // Ensure app_metadata exists and has the role property
    const role = user.app_metadata?.role as UserRole | undefined;
    console.log(`User role: ${role}`);

    // Protect /admin route
    if (pathname.startsWith("/admin") && role !== "admin") {
      console.log(`Redirecting user ${user.id} from /admin due to insufficient role: ${role}`);
      return NextResponse.redirect(new URL("/", request.url)); // Or a specific unauthorized page
    }

    // Protect /analyst route
    if (pathname.startsWith("/analyst") && role !== "analyst") {
      console.log(`Redirecting user ${user.id} from /analyst due to insufficient role: ${role}`);
      return NextResponse.redirect(new URL("/", request.url)); // Or a specific unauthorized page
    }

    // Allow access for authorized users or to other authenticated routes
    console.log(`Allowing access for user ${user.id} to ${pathname}`);
    return response;

  } catch (e) {
    console.error("Error in middleware:", e);
    // Fallback to allow request processing if middleware fails unexpectedly
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

export const createClient = (request: NextRequest) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
        },
      },
    },
  );

  return { supabase, response: NextResponse.next() };
};
