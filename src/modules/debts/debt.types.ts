export const DEBT_TYPES = ["owed_to_me", "i_owe"] as const;
export type DebtType = (typeof DEBT_TYPES)[number];

export type DebtStatus = "belum" | "lunas" | "semua";
export type DebtTypeFilter = "semua" | "owed_to_me" | "i_owe";

export type Debt = {
  id: string;
  user_id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note: string | null;
  due_date: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DebtSummary = {
  totalOwedToMe: number;
  totalIOwe: number;
  net: number;
};

export type DebtFilters = {
  status: DebtStatus;
  type: DebtTypeFilter;
  search: string;
  sort: "tanggal" | "jumlah";
  order: "asc" | "desc";
};

export function isSettled(d: Pick<Debt, "settled_at">): boolean {
  return d.settled_at !== null;
}

export function calcSummary(debts: Pick<Debt, "type" | "amount" | "settled_at">[]): DebtSummary {
  // Total cuma hitung yang belum lunas — yang lunas udah beres, gak ngaruh ke tagihan aktif.
  let totalOwedToMe = 0;
  let totalIOwe = 0;
  for (const d of debts) {
    if (d.settled_at !== null) continue;
    if (d.type === "owed_to_me") totalOwedToMe += Number(d.amount);
    else totalIOwe += Number(d.amount);
  }
  return { totalOwedToMe, totalIOwe, net: totalOwedToMe - totalIOwe };
}
