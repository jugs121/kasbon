import { createClient } from "@/lib/supabase/server";
import { fail, json, ok } from "@/lib/api-response";
import { SupabaseDebtRepository } from "@/modules/debts/debt.repository";
import { DebtService } from "@/modules/debts/debt.service";
import { createDebtSchema, debtQuerySchema } from "@/modules/debts/debt.schema";

export const dynamic = "force-dynamic";

async function getService() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, service: null };
  return { user, service: new DebtService(new SupabaseDebtRepository(supabase)) };
}

export async function GET(request: Request) {
  const { user, service } = await getService();
  if (!user || !service) return json(fail("Login dulu gih"), 401);

  const url = new URL(request.url);
  const parsed = debtQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    search: url.searchParams.get("search") ?? url.searchParams.get("q") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    order: url.searchParams.get("order") ?? undefined,
  });
  if (!parsed.success) return json(fail("Filter-nya aneh nih, cek lagi ya"), 400);

  // Map tipe UI (dihutang/hutang) ke enum DB kalau kepake.
  const rawType = url.searchParams.get("type");
  const q = { ...parsed.data };
  if (rawType === "dihutang") q.type = "owed_to_me";
  if (rawType === "hutang") q.type = "i_owe";

  try {
    const debts = await service.list(user.id, q);
    const summary = await service.summaryForUser(user.id);
    return json(ok({ debts, summary }, "Nih daftar kasbon kamu"));
  } catch {
    return json(fail("Gagal ambil data, coba refresh ya"), 500);
  }
}

export async function POST(request: Request) {
  const { user, service } = await getService();
  if (!user || !service) return json(fail("Login dulu gih"), 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(fail("Body-nya harus JSON ya"), 400);
  }
  if (typeof body !== "object" || body === null) return json(fail("Body-nya gak bener nih"), 400);

  const raw = body as Record<string, unknown>;
  // Terima alias dari form UI.
  if (raw.counterpartName !== undefined && raw.counterpart_name === undefined)
    raw.counterpart_name = raw.counterpartName;
  if (raw.dueDate !== undefined && raw.due_date === undefined) raw.due_date = raw.dueDate;
  if (typeof raw.amount === "string") {
    const n = Number(raw.amount);
    if (!Number.isNaN(n)) raw.amount = n;
  }

  const parsed = createDebtSchema.safeParse(raw);
  if (!parsed.success)
    return json(fail(parsed.issues[0]?.message ?? "Inputnya belum bener nih"), 400);

  try {
    const debt = await service.create(user.id, parsed.data);
    return json(ok(debt, "Udah kecatat, jangan lupa nagih ya"), 201);
  } catch (e) {
    return json(fail(e instanceof Error ? e.message : "Gagal nyatet, coba lagi ya"), 400);
  }
}
