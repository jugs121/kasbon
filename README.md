# Kasbon 💸 — Catat Utang Piutang Santai

Web app sederhana buat track siapa hutang berapa ke siapa. Bisa tandai lunas, ada summary total, filter + search + sort.

## Setup

```bash
bun install
cp .env.example .env.local
# isi dari Supabase Dashboard > Project Settings > API:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Migrate DB (pilih salah satu):
```bash
# via CLI (butuh supabase login + link dulu)
npx supabase db push
# atau manual: Dashboard > SQL Editor > paste isi
# supabase/migrations/20260930000000_create_debts.sql > Run
```

Jalanin local:
```bash
bun dev
# buka http://localhost:3000, daftar akun, langsung catat kasbon
```

Env yang dibutuhin cuma 2 itu. Jangan tambah `SERVICE_ROLE`/`SECRET` — app ini sengaja gak pake biar RLS gak ke-bypass.

## Demo

- Vercel: (isi setelah deploy) https://kasbon-xxx.vercel.app
- Supabase: project sendiri, demo jalan tanpa setup ulang

## Approach

Yang paling gue banggain: strict layering `app/` (routing doang) → `modules/debts/` (service pegang logika, repo cuma data access via interface) → Supabase + RLS. Jadi `Tandai lunas` itu idempotent di `debt.repository.ts` (cek `settled_at` dulu, gak asal overwrite), persist di DB bukan di client, dan semua endpoint return envelope `{Message, Data}` Bahasa Indonesia casual. Rupiah pake `Intl.NumberFormat('id-ID')` biar `Rp 1.234.000` bener, bukan `IDR 1,234,000`.

Library tambahan: `zod` (validasi client + server satu schema), `@supabase/ssr` (cookie handling App Router, `supabase-js` doang gak cukup), `lucide-react` (icons, wajib PRD).

## Trade-off (kalo ada 1 hari lagi)

Polish grouping "Budi: 3 entry, total Rp X" + bar chart compare dihutang vs hutang, terus optimis UI biar `Tandai lunas` kerasa instan. Sekarang masih fetch ulang simpel — bener tapi belum se-halus itu micro-interaction-nya.

## Time spent

~4 jam: scaffolding + RLS (1.5j), auth + API (1.5j), dashboard + form + polish (1j). Jujur, mayoritas waktu habis di RLS + idempotent settle biar gak auto-reject.
