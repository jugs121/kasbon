"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input } from "@/components/ui/primitives";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email sama password wajib diisi dong");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(
          err.message.includes("Invalid login")
            ? "Email/password salah nih, coba lagi ya"
            : `Gagal masuk: ${err.message}`,
        );
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="text-2xl font-bold">Balik lagi</h1>
      <p className="mt-1 text-sm text-zinc-500">Masuk buat liat siapa aja yang kasbon ke kamu.</p>
      <Card className="mt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-medium">
            Email
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" autoComplete="email" />
          </label>
          <label className="text-sm font-medium">
            Password
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading}>
            <LogIn size={16} />
            {loading ? "Lagi masuk..." : "Masuk"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Belum punya akun?{" "}
        <Link href="/signup" className="font-semibold text-zinc-900 underline dark:text-zinc-100">
          Daftar dulu gih
        </Link>
      </p>
    </main>
  );
}
