const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number | bigint | string): string {
  const n = typeof amount === "string" ? Number(amount) : Number(amount);
  if (Number.isNaN(n)) return "Rp 0";
  return rupiahFormatter.format(n);
}

export function formatRelative(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "baru aja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );
  if (diffDays === 1) return "kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7);
    return w === 1 ? "1 minggu lalu" : `${w} minggu lalu`;
  }
  if (diffDays < 365) {
    const m = Math.floor(diffDays / 30);
    return m === 1 ? "1 bulan lalu" : `${m} bulan lalu`;
  }
  const y = Math.floor(diffDays / 365);
  return y === 1 ? "1 tahun lalu" : `${y} tahun lalu`;
}
