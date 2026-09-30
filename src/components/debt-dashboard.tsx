"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownUp,
  CheckCheck,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import type { Debt, DebtSummary } from "@/modules/debts/debt.types";
import { formatRelative, formatRupiah } from "@/lib/format";
import { Button, Card } from "@/components/ui/primitives";
import DebtFormModal from "@/components/forms/debt-form-modal";
import LogoutButton from "@/components/forms/logout-button";

type ApiData = { debts: Debt[]; summary: DebtSummary };

export default function DebtDashboard({ email, initial }: { email: string; initial: ApiData }) {
  const [data, setData] = useState<ApiData>(initial);
  const [status, setStatus] = useState("semua");
  const [type, setType] = useState("semua");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"tanggal" | "jumlah">("tanggal");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function refresh(params?: { s?: string; t?: string; q?: string; sort?: string; order?: string }) {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams({
        status: params?.s ?? status,
        type: params?.t ?? type,
        search: params?.q ?? search,
        sort: params?.sort ?? sort,
        order: params?.order ?? order,
      });
      const res = await fetch(`/api/debts?${sp.toString()}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.Message ?? "Gagal ambil data");
      setData(body.Data as ApiData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal ambil data, coba refresh ya");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => refresh(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, search, sort, order]);

  async function submitForm(input: {
    type: "owed_to_me" | "i_owe";
    counterpart_name: string;
    amount: number;
    due_date: string | null;
    note: string | null;
  }) {
    setSaving(true);
    setFormError(null);
    try {
      const url = editing ? `/api/debts/${editing.id}` : "/api/debts";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.Message ?? "Gagal nyimpen");
      setModalOpen(false);
      setEditing(null);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Gagal nyimpen, coba lagi ya");
    } finally {
      setSaving(false);
    }
  }

  async function toggleSettled(d: Debt) {
    const settled = d.settled_at === null;
    try {
      const res = await fetch(`/api/debts/${d.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settled }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.Message ?? "Gagal update");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal update, coba lagi ya");
    }
  }

  async function removeDebt(d: Debt) {
    if (!confirm(`Hapus catatan ${d.counterpart_name} ${formatRupiah(d.amount)}?`)) return;
    try {
      const res = await fetch(`/api/debts/${d.id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.Message ?? "Gagal hapus");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal hapus, coba lagi ya");
    }
  }

  const { summary, debts } = data;
  const netPositive = summary.net >= 0;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Kasbon</h1>
          <p className="text-xs text-zinc-500">{email}</p>
        </div>
        <LogoutButton />
      </header>

      <section aria-label="Ringkasan" className="grid grid-cols-3 gap-2">
        <Card className="bg-zinc-50/60 dark:bg-zinc-900/40">
          <p className="text-[11px] font-medium text-zinc-500">Dihutang ke saya</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatRupiah(summary.totalOwedToMe)}</p>
        </Card>
        <Card className="bg-zinc-50/60 dark:bg-zinc-900/40">
          <p className="text-[11px] font-medium text-zinc-500">Saya hutang</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatRupiah(summary.totalIOwe)}</p>
        </Card>
        <Card className={netPositive ? "border-emerald-300 bg-emerald-50 shadow-sm dark:bg-emerald-950/30" : "border-rose-300 bg-rose-50 shadow-sm dark:bg-rose-950/30"}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Net</p>
          <p className={`mt-1 text-base font-extrabold tracking-tight sm:text-lg ${netPositive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
            {formatRupiah(summary.net)}
          </p>
        </Card>
      </section>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <Button onClick={() => { setEditing(null); setFormError(null); setModalOpen(true); }}>
            <Plus size={16} /> Catat baru
          </Button>
        </div>
        <div className="flex gap-2 text-sm">
          <select value={status} onChange={(e) => { setStatus(e.target.value); }} className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
            <option value="semua">Semua status</option>
            <option value="belum">Belum lunas</option>
            <option value="lunas">Lunas</option>
          </select>
          <select value={type} onChange={(e) => { setType(e.target.value); }} className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
            <option value="semua">Semua tipe</option>
            <option value="owed_to_me">Dihutang</option>
            <option value="i_owe">Hutang</option>
          </select>
          <button
            onClick={() => {
              const ns = sort === "tanggal" ? "jumlah" : "tanggal";
              setSort(ns);
              refresh({ sort: ns });
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1.5 dark:border-zinc-800"
            title="Ganti sort"
          >
            <ArrowDownUp size={14} />
            {sort === "tanggal" ? "Tanggal" : "Jumlah"}
          </button>
          <button onClick={() => { const no = order === "desc" ? "asc" : "desc"; setOrder(no); refresh({ order: no }); }} className="rounded-xl border border-zinc-200 px-3 py-1.5 dark:border-zinc-800">
            {order === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-sm text-zinc-400">Lagi ngeload...</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>}

      {!loading && debts.length === 0 && (
        <Card className="py-10 text-center">
          <Wallet size={28} className="mx-auto text-zinc-300" />
          <p className="mt-2 font-semibold">Masih kosong nih</p>
          <p className="text-sm text-zinc-500">Belum ada catatan kasbon. Yuk catat yang pertama!</p>
        </Card>
      )}

      <ul className="flex flex-col gap-2">
        {debts.map((d) => {
          const settled = d.settled_at !== null;
          return (
            <li key={d.id}>
              <Card className={settled ? "bg-zinc-50/60 opacity-75 dark:bg-zinc-900/40" : "border-zinc-300 shadow-sm"}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`truncate ${settled ? "font-medium text-zinc-500" : "font-semibold text-zinc-900 dark:text-zinc-100"}`}>{d.counterpart_name}</p>
                    <p className="text-xs text-zinc-500">
                      <span className={`mr-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${d.type === "owed_to_me" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"}`}>
                        {d.type === "owed_to_me" ? "dihutang" : "hutang"}
                      </span>
                      {formatRelative(d.created_at)}
                      {d.note ? ` • ${d.note}` : ""}
                    </p>
                    <p className={settled ? "mt-1 text-sm font-semibold text-zinc-500" : "mt-1 text-base font-extrabold tracking-tight"}>{formatRupiah(d.amount)}</p>
                    <p className={`text-xs font-semibold ${settled ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                      {settled ? "Lunas" : "Belum lunas"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!settled && (
                      <button onClick={() => toggleSettled(d)} title="Tandai lunas" className="rounded-full bg-emerald-600 p-2 text-white hover:bg-emerald-500">
                        <CheckCheck size={15} />
                      </button>
                    )}
                    <button onClick={() => { setEditing(d); setFormError(null); setModalOpen(true); }} title="Edit" className="rounded-full border border-zinc-200 p-2 hover:bg-zinc-100 dark:border-zinc-800">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => removeDebt(d)} title="Hapus" className="rounded-full border border-zinc-200 p-2 text-red-600 hover:bg-red-50 dark:border-zinc-800">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <DebtFormModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        initial={editing}
        saving={saving}
        error={formError}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={submitForm}
      />
    </main>
  );
}
