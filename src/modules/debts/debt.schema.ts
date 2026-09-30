import { z } from "zod";

export const debtTypeSchema = z.enum(["owed_to_me", "i_owe"], {
  message: "Tipe harus dihutang atau hutang",
});

export const createDebtSchema = z.object({
  type: debtTypeSchema,
  counterpart_name: z
    .string({ message: "Nama harus teks dong" })
    .trim()
    .min(1, "Nama orangnya siapa? Wajib diisi dong")
    .max(100, "Namanya kepanjangan, max 100 karakter ya"),
  amount: z
    .number({ message: "Jumlah harus angka dong" })
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0 dong")
    .max(9_999_999_999_999, "Kebanyakan nolnya, kurangin dikit"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggalnya format YYYY-MM-DD ya")
    .optional()
    .nullable(),
  note: z
    .string()
    .max(200, "Catatannya max 200 karakter aja ya")
    .optional()
    .nullable(),
});

export const updateDebtSchema = createDebtSchema.partial().extend({
  settled: z.boolean().optional(),
});

export const debtQuerySchema = z.object({
  status: z.enum(["semua", "belum", "lunas"]).default("semua"),
  type: z.enum(["semua", "owed_to_me", "i_owe"]).default("semua"),
  search: z.string().max(100).default(""),
  sort: z.enum(["tanggal", "jumlah"]).default("tanggal"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const debtIdSchema = z.uuid("ID-nya gak valid nih");

export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
export type DebtQuery = z.infer<typeof debtQuerySchema>;
