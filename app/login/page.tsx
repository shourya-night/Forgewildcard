import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LoginForm } from "@/components/auth/login-form";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "PARENT") redirect("/forge/parent");
  if (session?.user?.role === "CASHIER" || session?.user?.role === "ADMIN") redirect("/forge/cashier");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-forge-blue/30 via-white to-forge-rose/30 px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/50 bg-white/85 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-bold text-slate-900">Forge Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to access your Wild Card role dashboard.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
