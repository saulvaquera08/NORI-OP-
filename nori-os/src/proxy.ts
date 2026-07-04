import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Guardia de sesión: refresca el token de Supabase en cada request y exige
// sesión para toda la app. /login es la única ruta pública.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseResponse = NextResponse.next({ request });
  if (!url || !key) return supabaseResponse; // sin config: deja pasar a <SetupRequired/>

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = request.nextUrl.pathname.startsWith("/login");

  if (!user && !isLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const redirect = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
    return redirect;
  }

  if (user && isLogin) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    dashUrl.search = "";
    const redirect = NextResponse.redirect(dashUrl);
    supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
    return redirect;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
