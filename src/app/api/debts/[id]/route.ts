import { createClient } from "@/lib/supabase/server";
import { fail, json, ok } from "@/lib/api-response";
import { SupabaseDebtRepository } from "@/modules/debts/debt.repository";
import { DebtService } from "@/modules/debts/debt.service";
import { debtIdSchema, updateDebtSchema } from "@/modules/debts/debt.schema";

export const dynamic = "force-dynamic";

async function getService() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, service: null };
  return { user, service: new DebtService(new SupabaseDebtRepository(supabase)) };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, service } = await getService();
  if (!user || !service) return json(fail("Login dulu gih"), 401);

  const { id } = await params;
  if (debtIdSchema.safeParse(id).success === false)
    return json(fail("ID-nya gak valid nih"), 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(fail("Body-nya harus JSON ya"), 400);
  }
  if (typeof body !== "object" || body === null) return json(fail("Body-nya gak bener nih"), 400);

  const raw = body as Record<string, unknown>;
  if (raw.counterpartName !== undefined && raw.counterpart_name === undefined)
    raw.counterpart_name = raw.counterpartName;
  if (raw.dueDate !== undefined && raw.due_date === undefined) raw.due_date = raw.dueDate;
  if (typeof raw.amount === "string") {
    const n = Number(raw.amount);
    if (!Number.isNaN(n)) raw.amount = n;
  }
  // Alias enak dari UI: { settled: true } atau { action: "settle" }.
  if (raw.action === "settle" && raw.settled === undefined) raw.settled = true;
  if (raw.action === "reopen" && raw.settled === undefined) raw.settled = false;

  const parsed = updateDebtSchema.safeParse(raw);
  if (!parsed.success)
    return json(fail(parsed.error.issues[0]?.message ?? "Inputnya belum bener nih"), 400);
  if (Object.keys(parsed.data).length === 0)
    return json(fail("Gak ada yang diubah nih"), 400);

  try {
    const debt = await service.update(user.id, id, parsed.data);
    const msg = parsed.data.settled === true ? "Mantap, udah lunas!" : "Udah diupdate";
    return json(ok(debt, msg));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update, coba lagi ya";
    const code = msg.includes("gak ketemu") ? 404 : 400;
    return json(fail(msg), code);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, service } = await getService();
  if (!user || !service) return json(fail("Login dulu gih"), 401);

  const { id } = await params;
  if (debtIdSchema.safeParse(id).success === false)
    return json(fail("ID-nya gak valid nih"), 400);

  try {
    await service.remove(user.id, id);
    return json(ok(null, "Udah dihapus, anggap lunas deh"));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal hapus, coba lagi ya";
    const code = msg.includes("gak ketemu") ? 404 : 400;
    return json(fail(msg), code);
  }
}
