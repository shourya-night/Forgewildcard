"use client";

import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

async function resolveRoleRedirect() {
  for (let i = 0; i < 5; i += 1) {
    const session = await getSession();
    const role = session?.user?.role;
    if (role === "PARENT") return "/forge/parent";
    if (role === "CASHIER" || role === "ADMIN") return "/forge/cashier";
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return "/forge/cashier";
}

export function LoginForm() {
  const [email, setEmail] = useState("cashier@wildcard.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", { redirect: false, email, password });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const destination = await resolveRoleRedirect();
    router.replace(destination);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-busy={loading}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          className="w-full rounded-xl border border-forge-blue/30 bg-white/80 px-4 py-3 outline-none ring-forge-blue/30 transition focus:ring"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-forge-blue/30 bg-white/80 px-4 py-3 outline-none ring-forge-blue/30 transition focus:ring"
          required
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-forge-orange to-forge-rose py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
