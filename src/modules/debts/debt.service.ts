import type {
  CreateDebtInput,
  DebtQuery,
  UpdateDebtInput,
} from "./debt.schema";
import type { DebtRepository } from "./debt.repository";
import { calcSummary, type DebtSummary } from "./debt.types";

export class DebtService {
  constructor(private repo: DebtRepository) {}

  list(userId: string, q: DebtQuery) {
    if (!userId || typeof userId !== "string") throw new Error("User gak dikenal, login lagi gih");
    return this.repo.list(userId, q);
  }

  summary(debts: { type: "owed_to_me" | "i_owe"; amount: number; settled_at: string | null }[]): DebtSummary {
    return calcSummary(debts);
  }

  async summaryForUser(userId: string): Promise<DebtSummary> {
    const rows = await this.repo.listAllUnsettled(userId);
    return calcSummary(rows);
  }

  create(userId: string, input: CreateDebtInput) {
    if (!userId || typeof userId !== "string") throw new Error("User gak dikenal, login lagi gih");
    if (input.counterpart_name.trim().length === 0) throw new Error("Nama orangnya wajib diisi dong");
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0)
      throw new Error("Jumlah harus bilangan bulat lebih dari 0");
    return this.repo.create(userId, input);
  }

  async update(userId: string, id: string, input: UpdateDebtInput) {
    if (!userId || typeof userId !== "string") throw new Error("User gak dikenal, login lagi gih");
    if (typeof id !== "string" || id.length < 10) throw new Error("ID-nya aneh nih");
    const updated = await this.repo.update(userId, id, input);
    if (!updated) throw new Error("Catatan gak ketemu atau bukan punya kamu");
    return updated;
  }

  async remove(userId: string, id: string) {
    if (!userId || typeof userId !== "string") throw new Error("User gak dikenal, login lagi gih");
    const ok = await this.repo.remove(userId, id);
    if (!ok) throw new Error("Catatan gak ketemu atau bukan punya kamu");
  }
}
