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

export type PersonGroup = {
  key: string;
  name: string;
  count: number;
  totalOwedToMe: number;
  totalIOwe: number;
  net: number;
  entries: Debt[];
};

export function groupDebtsByPerson(debts: Debt[]): PersonGroup[] {
  const map = new Map<string, PersonGroup>();
  for (const d of debts) {
    const key = d.counterpart_name.trim().toLowerCase();
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        name: d.counterpart_name.trim(),
        count: 0,
        totalOwedToMe: 0,
        totalIOwe: 0,
        net: 0,
        entries: [],
      };
      map.set(key, g);
    }
    g.count += 1;
    g.entries.push(d);
    if (d.settled_at === null) {
      if (d.type === "owed_to_me") g.totalOwedToMe += Number(d.amount);
      else g.totalIOwe += Number(d.amount);
    }
  }
  const groups = [...map.values()];
  for (const g of groups) g.net = g.totalOwedToMe - g.totalIOwe;
  groups.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  return groups;
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
