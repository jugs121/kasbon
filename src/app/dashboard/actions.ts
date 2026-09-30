"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupabaseDebtRepository } from "@/modules/debts/debt.repository";
import { DebtService } from "@/modules/debts/debt.service";
import { createDebtSchema, updateDebtSchema } from "@/modules/debts/debt.schema";

// Controller tipis: validasi input user doang, logika di service.
async function getService() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Login dulu gih");
  return { user, service: new DebtService(new SupabaseDebtRepository(supabase)) };
}

export async function createDebtAction(form: {
  type: unknown;
  counterpart_name: unknown;
  amount: unknown;
  due_date?: unknown;
  note?: unknown;
}) {
  if (typeof form.counterpart_name !== "string") throw new Error("Nama harus teks dong");
  const parsed = createDebtSchema.safeParse({
    type: form.type,
    counterpart_name: form.counterpart_name,
    amount: typeof form.amount === "string" ? Number(form.amount) : form.amount,
    due_date: form.due_date ?? null,
    note: form.note ?? null,
  });
  if (!parsed.success) throw new Error(parsed.issues[0]?.message ?? "Inputnya belum bener nih");
  const { user, service } = await getService();
  const debt = await service.create(user.id, parsed.data);
  revalidatePath("/");
  return debt;
}

export async function updateDebtAction(id: unknown, form: Record<string, unknown>) {
  if (typeof id !== "string" || id.length < 10) throw new Error("ID-nya aneh nih");
  const parsed = updateDebtSchema.safeParse({
    ...form,
    amount:
      typeof form.amount === "string" && form.amount !== ""
        ? Number(form.amount)
        : form.amount,
  });
  if (!parsed.success) throw new Error(parsed.issues[0]?.message ?? "Inputnya belum bener nih");
  const { user, service } = await getService();
  const debt = await service.update(user.id, id, parsed.data);
  revalidatePath("/");
  return debt;
}

export async function deleteDebtAction(id: unknown) {
  if (typeof id !== "string" || id.length < 10) throw new Error("ID-nya aneh nih");
  const { user, service } = await getService();
  await service.remove(user.id, id);
  revalidatePath("/");
}
