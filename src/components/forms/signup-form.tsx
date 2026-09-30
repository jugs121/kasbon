"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input } from "@/components/ui/primitives";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError("Email wajib isi, password minimal 6 karakter ya");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(`Gagal daftar: ${err.message}`);
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
      <h1 className="text-2xl font-bold">Bikin akun dulu</h1>
      <p className="mt-1 text-sm text-zinc-500">Gratis, langsung bisa catat kasbon.</p>
      <Card className="mt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-medium">
            Email
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" autoComplete="email" />
          </label>
          <label className="text-sm font-medium">
            Password
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 6 karakter" autoComplete="new-password" />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Lagi daftar..." : "Daftar"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Udah punya akun?{" "}
        <Link href="/login" className="font-semibold text-zinc-900 underline dark:text-zinc-100">
          Masuk aja
        </Link>
      </p>
    </main>
  );
}
