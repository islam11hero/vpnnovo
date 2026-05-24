"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Lock, Shield } from "lucide-react";

import { resolveAdminRedirectPath } from "@/lib/admin-access";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Access denied");
        return;
      }
      const destination = resolveAdminRedirectPath(searchParams.get("from"));
      router.push(destination);
      router.refresh();
    } catch {
      setError("Connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/20">
            <Shield className="h-8 w-8 text-[#3B82F6]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Command Center
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Authorized personnel only
          </p>
          <p className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-[11px] text-slate-500">
            /admin/login → Command Center
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300"
            >
              <Lock className="h-4 w-4 text-slate-500" />
              Admin password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter your admin password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-sm text-white transition-all placeholder:text-slate-500 focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/20 focus:outline-none"
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "Enter Command Center"}
          </button>
        </form>
      </div>
    </div>
  );
}
