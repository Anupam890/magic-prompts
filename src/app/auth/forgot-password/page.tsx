"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Mail, ShieldCheck, Send, MailCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isEmailValid = email.includes("@") && email.includes(".");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to send reset link.");
    } else {
      toast.success("Reset link sent!");
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top Emblem */}
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm dark:shadow-lg dark:shadow-purple-900/30 transition-colors">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      {!submitted ? (
        <>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reset Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-purple-200/60 mt-1.5">
              Enter your email address to receive password recovery instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleForgotPassword} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading || !isEmailValid}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 text-sm font-semibold shadow-lg shadow-purple-600/30 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-purple-200/60">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 font-semibold text-purple-600 dark:text-purple-400 hover:underline transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Log In
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
            <MailCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Reset Link Dispatched</h2>
          <p className="text-xs text-slate-500 dark:text-purple-200/60 leading-relaxed mt-2">
            We have sent password recovery instructions to <strong className="text-slate-900 dark:text-white">{email}</strong>.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 text-xs font-semibold hover:from-purple-500 hover:to-indigo-500 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Log In
          </Link>
        </div>
      )}
    </div>
  );
}
