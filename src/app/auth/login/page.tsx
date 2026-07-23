"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSignInValid = email.includes("@") && email.includes(".") && password.length >= 6;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInValid) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast.error(error.message || "Failed to sign in. Please try again.");
    } else {
      toast.success("Welcome back!");
      router.push("/admin");
      router.refresh();
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} authentication requested`, {
      description: "Social login can be enabled in your Supabase dashboard.",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top Emblem */}
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm dark:shadow-lg dark:shadow-purple-900/30 transition-colors">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Log In
        </h1>
        <p className="text-xs text-slate-500 dark:text-purple-200/60 mt-1.5">
          Welcome back! Sign in with your account credentials.
        </p>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={() => handleSocialLogin("Google")}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-100/80 dark:bg-[#18132e] border border-slate-200 dark:border-purple-900/40 py-2.5 px-3 text-xs font-medium text-slate-700 dark:text-white hover:bg-slate-200/80 dark:hover:bg-[#20193d] dark:hover:border-purple-700/50 transition cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("Facebook")}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-100/80 dark:bg-[#18132e] border border-slate-200 dark:border-purple-900/40 py-2.5 px-3 text-xs font-medium text-slate-700 dark:text-white hover:bg-slate-200/80 dark:hover:bg-[#20193d] dark:hover:border-purple-700/50 transition cursor-pointer"
        >
          <svg className="h-4 w-4 fill-blue-500" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-slate-200 dark:border-purple-900/40 w-full" />
        <span className="bg-white dark:bg-[#0c0919] px-3 text-[11px] text-slate-400 dark:text-purple-300/50 shrink-0">
          Or continue with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-slate-700 dark:text-purple-200/80">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-purple-400/60" />
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#140f2b] border border-slate-200 dark:border-purple-900/40 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/30 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-slate-700 dark:text-purple-200/80">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-purple-400/60" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#140f2b] border border-slate-200 dark:border-purple-900/40 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/30 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400/60 hover:text-slate-700 dark:hover:text-white transition"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isSignInValid}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 text-sm font-semibold shadow-lg shadow-purple-600/30 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-purple-200/60">
        Don't have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-purple-600 dark:text-purple-400 hover:underline transition"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
