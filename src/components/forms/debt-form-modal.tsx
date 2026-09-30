"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Debt, DebtType } from "@/modules/debts/debt.types";
import { Button, Input } from "@/components/ui/primitives";

type Props = {
  open: boolean;
  initial?: Debt | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: {
    type: DebtType;
    counterpart_name: string;
    amount: number;
    due_date: string | null;
    note: string | null;
  }) => void;
};

export default function DebtFormModal({ open, initial, saving, error, onClose, onSubmit }: Props) {
  const [type, setType] = useState<DebtType>(initial?.type ?? "owed_to_me");
  const [name, setName] = useState(initial?.counterpart_name ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!name.trim()) {
      setLocalError("Nama orangnya siapa? Wajib diisi dong");
      return;
    }
    const n = Number(amount);
    if (!Number.isSafeInteger(n) || n <= 0) {
      setLocalError("Jumlah harus angka bulat lebih dari 0 dong");
      return;
    }
    if (note.length > 200) {
      setLocalError("Catatannya max 200 karakter aja ya");
      return;
    }
    onSubmit({
      type,
      counterpart_name: name.trim(),
      amount: n,
      due_date: dueDate || null,
      note: note.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-5" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 dark:bg-zinc-950 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? "Edit catatan" : "Catat baru"}</h2>
          <button onClick={onClose} aria-label="Tutup" className="rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setType("owed_to_me")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${type === "owed_to_me" ? "bg-white shadow dark:bg-zinc-950" : "text-zinc-500"}`}
            >
              Saya dihutang
            </button>
            <button
              type="button"
              onClick={() => setType("i_owe")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${type === "i_owe" ? "bg-white shadow dark:bg-zinc-950" : "text-zinc-500"}`}
            >
              Saya hutang
            </button>
          </div>
          <label className="text-sm font-medium">
            Nama orang
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Budi" maxLength={100} />
          </label>
          <label className="text-sm font-medium">
            Jumlah (Rp)
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="cth. 50000" inputMode="numeric" />
          </label>
          <label className="text-sm font-medium">
            Tanggal
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          <label className="text-sm font-medium">
            Catatan <span className="font-normal text-zinc-400">(opsional, max 200)</span>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="cth. pinjem buat bensin" maxLength={200} />
          </label>
          {(localError ?? error) && <p className="text-sm text-red-600">{localError ?? error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Lagi nyimpen..." : initial ? "Simpen perubahan" : "Catat"}
          </Button>
        </form>
      </div>
    </div>
  );
}
