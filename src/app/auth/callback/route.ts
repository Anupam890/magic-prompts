import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/profile";

    if (code) {
      const supabase = await createClient();
      if (typeof supabase.auth?.exchangeCodeForSession === "function") {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          const forwardedHost = request.headers.get("x-forwarded-host");
          const isLocalEnv = process.env.NODE_ENV === "development";
          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${next}`);
          } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${next}`);
          } else {
            return NextResponse.redirect(`${origin}${next}`);
          }
        }
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=Could not exchange code`);
  } catch (err: any) {
    console.error("Auth callback exception:", err);
    const url = new URL(request.url);
    return NextResponse.redirect(`${url.origin}/auth/login?error=Internal server error during auth callback`);
  }
}

