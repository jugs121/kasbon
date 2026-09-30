import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseDebtRepository } from "@/modules/debts/debt.repository";
import { DebtService } from "@/modules/debts/debt.service";
import { debtQuerySchema } from "@/modules/debts/debt.schema";
import DebtDashboard from "@/components/debt-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const parsed = debtQuerySchema.safeParse({
    status: get("status") ?? undefined,
    type: get("type") ?? undefined,
    search: get("search") ?? get("q") ?? undefined,
    sort: get("sort") ?? undefined,
    order: get("order") ?? undefined,
  });
  const q = parsed.success
    ? parsed.data
    : { status: "semua" as const, type: "semua" as const, search: "", sort: "tanggal" as const, order: "desc" as const };

  const service = new DebtService(new SupabaseDebtRepository(supabase));
  const [debts, summary] = await Promise.all([
    service.list(user.id, q).catch(() => []),
    service.summaryForUser(user.id).catch(() => ({
      totalOwedToMe: 0,
      totalIOwe: 0,
      net: 0,
    })),
  ]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <DebtDashboard email={user.email ?? ""} initial={{ debts, summary }} />
    </div>
  );
}
