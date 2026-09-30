# Kasbon 💸 — Catat Utang Piutang Santai

Web app sederhana buat track siapa hutang berapa ke siapa. Bisa tandai lunas, ada summary total, filter + search + sort.

## Setup

```bash
bun install
```

Copy file .env ke dalam root project

Migrate DB (pilih salah satu):
```bash
# via CLI (butuh supabase login + link dulu)
npx supabase db push
# atau manual: Dashboard > SQL Editor > paste isi
# supabase/migrations/20260930000000_create_debts.sql > Run
```
Namun, apabila menggunakan kredensial Supabase default yang terdapat pada file .env, migration tidak perlu dilakukan. Bisa lanjut ke step selanjutnya.

Jalanin local:
```bash
bun dev
# buka http://localhost:3000, daftar akun, langsung catat kasbon
```

## Demo

- Vercel: https://kasbon-plum.vercel.app/
- Supabase: project sendiri, demo jalan tanpa setup ulang

## Approach

Yang paling dibanggakan: strict layering `app/` (hanya routing routing) → `modules/debts/` (yang berisi service layer dan repository layer. Di sini service layer tidak bergantung langsung dengan implementasi dari repository layer melainkan bergantung dengan interface. Sehingga mudah untuk dilakukan mocking saat membuat unit test tanpa. Sementara repository layer sendiri merupakan sebuah interface dan juga implementasinya) → Supabase + RLS. Dan semua endpoint return envelope `{Message, Data}` sehingga memudahkan frontend untuk membuat response modelnya. Di halaman dashboard, saat memanggil data daftar hutang dan summary, keduanya berjalan secara concurrent sehingga waktu pemrosesan jauh lebih cepat

Library tambahan: `zod` (validasi client + server satu schema), `@supabase/ssr` (cookie handling App Router, `supabase-js` doang gak cukup), `lucide-react` (icons, wajib PRD), `recharts` (bar chart compare dihutang vs hutang, bonus PRD).

## Trade-off (kalo ada 1 hari lagi)

Optimistic UI agar `Tandai lunas` terasa instan. Atau cache dashboard data dengan redis untuk mengurangi beban database. Atau Fitur fuzzy search untuk typo tolerant. Apabila ingin lebih advanced, bisa menggunakan vector embedding untuk menyimpan data hutang sehingga pencarian dapat diperluas dengan mencari nominal juga

## Time spent

~4 jam
