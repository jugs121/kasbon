-- Fix "permission denied for table debts" saat insert/update/delete.
-- Penyebab: tabel dibuat tanpa GRANT ke role authenticated,
-- jadi RLS policy bener pun tetap ditolak Postgres (error 42501).
-- Cara jalanin: Dashboard > SQL Editor > paste file ini > Run.

grant select, insert, update, delete on public.debts to authenticated;
revoke all on public.debts from anon;
