import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock user state stored in localStorage for persistence
const STORAGE_KEY = "magic_mock_user";

export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    username?: string;
  };
}

class MockSupabaseAuth {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      // Sync mock session on load
      const user = this.getUserSync();
      if (user) {
        this.writeCookie(user);
      }
    }
  }

  private getUserSync(): MockUser | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  private writeCookie(user: MockUser | null) {
    if (typeof window === "undefined") return;
    if (user) {
      document.cookie = `magic_mock_session=${encodeURIComponent(
        JSON.stringify(user),
      )}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      document.cookie = "magic_mock_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  async signUp({ email, password, options }: any) {
    await new Promise((r) => setTimeout(r, 1200)); // Simulate delay
    const newUser: MockUser = {
      id: Math.random().toString(36).substring(2, 15),
      email,
      user_metadata: {
        full_name: options?.data?.full_name,
        username: options?.data?.username,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    this.writeCookie(newUser);
    this.trigger("SIGNED_IN", { user: newUser });
    return { data: { user: newUser, session: { user: newUser } }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    await new Promise((r) => setTimeout(r, 1200));
    // Accept any password for mock purposes
    const user: MockUser = {
      id: "mock-user-id-12345",
      email,
      user_metadata: {
        full_name: email.split("@")[0],
        username: email.split("@")[0],
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.writeCookie(user);
    this.trigger("SIGNED_IN", { user });
    return { data: { user, session: { user } }, error: null };
  }

  async signInWithOtp({ email }: any) {
    await new Promise((r) => setTimeout(r, 1200));
    return { data: { user: null, session: null }, error: null };
  }

  async signOut() {
    await new Promise((r) => setTimeout(r, 500));
    localStorage.removeItem(STORAGE_KEY);
    this.writeCookie(null);
    this.trigger("SIGNED_OUT", null);
    return { error: null };
  }

  async resetPasswordForEmail(email: string, options?: any) {
    await new Promise((r) => setTimeout(r, 1000));
    return { data: {}, error: null };
  }

  async updateUser({ password }: any) {
    await new Promise((r) => setTimeout(r, 1000));
    return { data: {}, error: null };
  }

  async getUser() {
    const user = this.getUserSync();
    return { data: { user }, error: null };
  }

  async getSession() {
    const user = this.getUserSync();
    return { data: { session: user ? { user } : null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const user = this.getUserSync();
    // Fire initial state
    callback(user ? "SIGNED_IN" : "INITIAL_SESSION", user ? { user } : null);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
          },
        },
      },
    };
  }

  private trigger(event: string, session: any) {
    this.listeners.forEach((l) => l(event, session));
  }
}

// Instantiate client
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : (new Proxy(
        {},
        {
          get(target, prop) {
            if (prop === "auth") {
              return new MockSupabaseAuth();
            }
            return () => {
              console.warn(
                `Supabase client properties like '${String(
                  prop,
                )}' are mocked. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.`,
              );
              return Promise.resolve({ data: null, error: null });
            };
          },
        },
      ) as any);
