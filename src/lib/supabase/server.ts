import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  const cookieStore = await cookies();

  if (!supabaseUrl || !supabaseAnonKey) {
    // Server-side mock user parser using the cookie set by the browser mock client
    const mockCookie = cookieStore.get("magic_mock_session")?.value;
    const user = mockCookie ? JSON.parse(decodeURIComponent(mockCookie)) : null;

    return {
      auth: {
        getUser: async () => ({ data: { user }, error: null }),
        getSession: async () => ({ data: { session: user ? { user } : null }, error: null }),
        signOut: async () => ({ error: null }),
      },
    } as any;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options));
        } catch {
          // Can be ignored if handled by middleware
        }
      },
    },
  });
}
