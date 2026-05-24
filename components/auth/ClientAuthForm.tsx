"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Mail, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

type Props = {
  accessCode?: string;
};

async function linkOrderAndRedirect(
  router: ReturnType<typeof useRouter>,
  orderId: string,
): Promise<void> {
  try {
    const res = await fetch("/api/client/link-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      toast.success("VIP node linked to your account.");
      router.replace("/dashboard");
    } else {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      toast.error(body?.error ?? "Could not link this Access Code.", {
        description: "You can still open the instant portal without login.",
      });
      router.replace("/dashboard");
    }
    router.refresh();
  } catch {
    toast.error("Network error while linking your order.");
    router.replace("/dashboard");
    router.refresh();
  }
}

export function ClientAuthForm({ accessCode }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const finishAuth = async () => {
    if (accessCode) {
      await linkOrderAndRedirect(router, accessCode);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Auth unavailable", {
        description: "Configure NEXT_PUBLIC_SUPABASE_URL and ANON_KEY.",
      });
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || password.length < 8) {
      toast.error("Use a valid email and password (min 8 characters).");
      return;
    }

    setPending(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: accessCode
              ? `${window.location.origin}/auth/callback?next=/dashboard&link=${accessCode}`
              : `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (data.session) {
          toast.success("Account created — welcome to IPNOVA.");
          await finishAuth();
          return;
        }
        toast.success("Check your email to confirm your account.", {
          description: accessCode
            ? "After confirming, sign in with your Access Code link again."
            : "Then sign in to access your OPSEC Vault.",
        });
        setMode("signin");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(
        accessCode
          ? "Signed in — linking your VIP node…"
          : "Signed in — loading your vault…",
      );
      await finishAuth();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
          <Shield className="h-7 w-7 text-cyan-400" />
        </div>
        <p className="text-xs font-bold tracking-[0.25em] text-cyan-500/80 uppercase">
          Crypto-native access
        </p>
        <h1 className="mt-2 font-poppins text-2xl font-bold text-white">
          {mode === "signin" ? "Sign in to your vault" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-400">
          {accessCode
            ? "Sign in to link your VIP Access Code and unlock the OPSEC Vault."
            : "Email login unlocks your OPSEC tools, wallet top-ups, and node management."}
        </p>
        {accessCode ? (
          <p className="mt-3 rounded-lg border border-violet-500/30 bg-violet-950/30 px-3 py-2 font-mono text-xs text-violet-300">
            Access Code: {accessCode.slice(0, 8)}…
          </p>
        ) : null}
      </div>

      <div className="mb-6 flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition ${
            mode === "signin"
              ? "bg-cyan-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <KeyRound className="h-4 w-4" />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition ${
            mode === "signup"
              ? "bg-cyan-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Create Account
        </button>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300"
            >
              <Mail className="h-4 w-4 text-slate-500" />
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300"
            >
              <KeyRound className="h-4 w-4 text-slate-500" />
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-500 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs font-medium text-slate-600">
        {accessCode ? (
          <>
            No account yet?{" "}
            <Link
              href={`/portal/${accessCode}`}
              className="text-cyan-500 hover:underline"
            >
              Open instant portal (no login)
            </Link>
          </>
        ) : (
          <>
            Paid via crypto?{" "}
            <Link href="/portal" className="text-cyan-500 hover:underline">
              Legacy Order ID portal
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
