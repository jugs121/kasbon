"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DebtSummary } from "@/modules/debts/debt.types";
import { formatRupiah } from "@/lib/format";
import { Card } from "@/components/ui/primitives";

const compact = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// Chart ini jawab satu pertanyaan: kasbon gue condong ke mana,
// dihutang orang atau gue yang hutang. Makanya cuma dua bar dari
// tagihan aktif, tanpa delta atau tren bohongan.
export default function DebtChart({ summary }: { summary: DebtSummary }) {
  if (summary.totalOwedToMe === 0 && summary.totalIOwe === 0) return null;

  const data = [
    { name: "Dihutang", total: summary.totalOwedToMe },
    { name: "Hutang", total: summary.totalIOwe },
  ];

  return (
    <Card aria-label="Perbandingan dihutang vs hutang">
      <p className="text-sm font-semibold">Dihutang vs hutang</p>
      <p className="text-xs text-zinc-500">Tagihan aktif, biar tau condong ke mana.</p>
      <div className="mt-2 h-40 text-zinc-500">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis
              type="number"
              hide
              domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={70}
              tick={{ fill: "currentColor", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [formatRupiah(Number(value ?? 0)), "Total"]}
              contentStyle={{
                borderRadius: 12,
                fontSize: 12,
                border: "1px solid #e4e4e7",
              }}
            />
            <Bar dataKey="total" radius={[6, 6, 6, 6]} barSize={22}>
              <Cell fill="#059669" />
              <Cell fill="#e11d48" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex justify-between text-xs text-zinc-500">
        <span>{compact.format(summary.totalOwedToMe)}</span>
        <span>{compact.format(summary.totalIOwe)}</span>
      </div>
    </Card>
  );
}
