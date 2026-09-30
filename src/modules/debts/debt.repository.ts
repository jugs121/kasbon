import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateDebtInput,
  DebtQuery,
  UpdateDebtInput,
} from "./debt.schema";
import type { Debt } from "./debt.types";

export type DebtRow = {
  id: string;
  user_id: string;
  type: "owed_to_me" | "i_owe";
  counterpart_name: string;
  amount: number | string;
  note: string | null;
  due_date: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
};

function toDebt(row: DebtRow): Debt {
  return { ...row, amount: Number(row.amount) };
}

export interface DebtRepository {
  list(userId: string, q: DebtQuery): Promise<Debt[]>;
  listAllUnsettled(userId: string): Promise<Pick<Debt, "type" | "amount" | "settled_at">[]>;
  create(userId: string, input: CreateDebtInput): Promise<Debt>;
  update(userId: string, id: string, input: UpdateDebtInput): Promise<Debt | null>;
  remove(userId: string, id: string): Promise<boolean>;
}

export class SupabaseDebtRepository implements DebtRepository {
  constructor(private db: SupabaseClient) {}

  async list(userId: string, q: DebtQuery): Promise<Debt[]> {
    let query = this.db
      .from("debts")
      .select("*")
      .eq("user_id", userId);

    if (q.status === "belum") query = query.is("settled_at", null);
    if (q.status === "lunas") query = query.not("settled_at", "is", null);
    if (q.type !== "semua") query = query.eq("type", q.type);
    if (q.search.trim()) query = query.ilike("counterpart_name", `%${q.search.trim()}%`);

    query =
      q.sort === "jumlah"
        ? query.order("amount", { ascending: q.order === "asc" })
        : query.order("created_at", { ascending: q.order === "asc" });

    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as DebtRow[]).map(toDebt);
  }

  async listAllUnsettled(
    userId: string,
  ): Promise<Pick<Debt, "type" | "amount" | "settled_at">[]> {
    const { data, error } = await this.db
      .from("debts")
      .select("type, amount, settled_at")
      .eq("user_id", userId)
      .is("settled_at", null);
    if (error) throw error;
    return ((data ?? []) as { type: "owed_to_me" | "i_owe"; amount: number | string; settled_at: string | null }[]).map(
      (r) => ({ ...r, amount: Number(r.amount) }),
    );
  }

  async create(userId: string, input: CreateDebtInput): Promise<Debt> {
    const { data, error } = await this.db
      .from("debts")
      .insert({
        user_id: userId,
        type: input.type,
        counterpart_name: input.counterpart_name,
        amount: input.amount,
        due_date: input.due_date ?? null,
        note: input.note?.trim() ? input.note.trim() : null,
      })
      .select()
      .single();
    if (error) throw error;
    return toDebt(data as DebtRow);
  }

  async update(userId: string, id: string, input: UpdateDebtInput): Promise<Debt | null> {
    // Ambil dulu buat idempotency settled + pastikan milik user (RLS juga jaga).
    const { data: existing, error: findErr } = await this.db
      .from("debts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (findErr || !existing) return null;

    const patch: Record<string, unknown> = {};
    if (input.type !== undefined) patch.type = input.type;
    if (input.counterpart_name !== undefined) patch.counterpart_name = input.counterpart_name;
    if (input.amount !== undefined) patch.amount = input.amount;
    if (input.due_date !== undefined) patch.due_date = input.due_date;
    if (input.note !== undefined)
      patch.note = input.note?.trim() ? input.note.trim() : null;
    if (input.settled !== undefined) {
      const row = existing as DebtRow;
      if (input.settled && row.settled_at === null) patch.settled_at = new Date().toISOString();
      if (!input.settled && row.settled_at !== null) patch.settled_at = null;
    }

    if (Object.keys(patch).length === 0) return toDebt(existing as DebtRow);

    const { data, error } = await this.db
      .from("debts")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return toDebt(data as DebtRow);
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const { error, count } = await this.db
      .from("debts")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
}
