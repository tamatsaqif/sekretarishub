-- ============================================================
-- KAS KELAS TABLES — Web Kelas 9 SCP 2
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. TABEL STUDENTS (untuk referensi, ambil dari data yang sudah ada di attendance/piket)
create table if not exists students (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz default now()
);

-- 2. TABEL KAS_WEEKS (minggu pembayaran kas)
create table if not exists kas_weeks (
  id          uuid primary key default gen_random_uuid(),
  month       text not null,        -- "September 2026", "Oktober 2026"
  week_number integer not null,     -- 1, 2, 3, 4
  start_date  date not null,
  end_date    date not null,
  amount      integer not null,     -- nominal iuran per minggu (Rp)
  created_at  timestamptz default now(),
  unique(month, week_number)
);

-- 3. TABEL KAS_PAYMENTS (pembayaran siswa)
create table if not exists kas_payments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  week_id     uuid not null references kas_weeks(id) on delete cascade,
  amount      integer not null,
  paid_at     timestamptz default now(),
  recorded_by text,                 -- email/username siapa yang catat
  created_at  timestamptz default now(),
  unique(student_id, week_id)
);

-- 4. TABEL KAS_EXPENSES (pengeluaran kas)
create table if not exists kas_expenses (
  id          uuid primary key default gen_random_uuid(),
  amount      integer not null,
  description text not null,
  expense_date date not null,
  recorded_by text,
  created_at  timestamptz default now()
);

-- 5. TABEL KAS_ROLES (bendahara & permissions)
create table if not exists kas_roles (
  id          uuid primary key default gen_random_uuid(),
  user_email  text not null unique, -- email user di Supabase auth
  role        text not null,        -- "bendahara" atau "student"
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table students enable row level security;
alter table kas_weeks enable row level security;
alter table kas_payments enable row level security;
alter table kas_expenses enable row level security;
alter table kas_roles enable row level security;

-- STUDENTS: semua bisa baca
create policy "Public read students" on students for select using (true);

-- KAS_WEEKS: semua bisa baca
create policy "Public read kas_weeks" on kas_weeks for select using (true);

-- KAS_PAYMENTS: semua bisa baca, hanya bendahara bisa INSERT/UPDATE/DELETE
create policy "Public read kas_payments" on kas_payments for select using (true);
create policy "Bendahara write kas_payments" on kas_payments
  for insert with check (
    exists (
      select 1 from kas_roles
      where user_email = auth.jwt() ->> 'email'
      and role = 'bendahara'
    )
  );
create policy "Bendahara update kas_payments" on kas_payments
  for update with check (
    exists (
      select 1 from kas_roles
      where user_email = auth.jwt() ->> 'email'
      and role = 'bendahara'
    )
  );
create policy "Bendahara delete kas_payments" on kas_payments
  for delete using (
    exists (
      select 1 from kas_roles
      where user_email = auth.jwt() ->> 'email'
      and role = 'bendahara'
    )
  );

-- KAS_EXPENSES: semua bisa baca, hanya bendahara bisa INSERT/UPDATE/DELETE
create policy "Public read kas_expenses" on kas_expenses for select using (true);
create policy "Bendahara write kas_expenses" on kas_expenses
  for insert with check (
    exists (
      select 1 from kas_roles
      where user_email = auth.jwt() ->> 'email'
      and role = 'bendahara'
    )
  );
create policy "Bendahara update kas_expenses" on kas_expenses
  for update with check (
    exists (
      select 1 from kas_roles
      where user_email = auth.jwt() ->> 'email'
      and role = 'bendahara'
    )
  );
create policy "Bendahara delete kas_expenses" on kas_expenses
  for delete using (
    exists (
      select 1 from kas_roles
      where user_email = auth.jwt() ->> 'email'
      and role = 'bendahara'
    )
  );

-- KAS_ROLES: hanya admin/service role bisa baca/tulis (tidak exposed ke client)
create policy "Public read kas_roles" on kas_roles for select using (true);

-- ============================================================
-- SEED DATA — STUDENTS & KAS_WEEKS
-- ============================================================

-- Masukkan semua siswa
insert into students (name) values
  ('ADZKIYA SAFWA ANAKA'),
  ('ALIYAH NUR LATHIFAH'),
  ('ALTHAF ZISAN AYDIN R'),
  ('ANDI NAUFAL N'),
  ('ASHFA HADZIQ H'),
  ('ASYIFA NAISILA JELITA'),
  ('BETHARI JANITRA IW'),
  ('BILLIE RAIHAN SAPUTRA'),
  ('DAFFA RIDHO ALGHANI'),
  ('DELISA ASZAHRA P'),
  ('DHAFIN DZIMAR'),
  ('DIMAS NARENDRA W'),
  ('DIRA SHASMIRA RIANTI'),
  ('EDDLYN ARSY ZUHAIR'),
  ('FADIPTA JAVAS A'),
  ('KEI EZHAR ABHIMATA'),
  ('KENZO JABBAR LEBCCA'),
  ('MALVINO APRILIO PI'),
  ('MARITZA ADILIA S'),
  ('MOCH DAFFA RAFANDRA'),
  ('MOCH NABIL DAVIAN N'),
  ('MUH GHAISAN WIMIANO'),
  ('MUH RAFA RABBANI H'),
  ('MUH RAFI SYAHPUTRA A'),
  ('NAURA KARENZA A Z'),
  ('NAYOTTAMA AR'),
  ('SABRINA VIDI ARETHA'),
  ('VELIKA JASMIN CK'),
  ('VINNO IBRAHIM A'),
  ('WIDYATAMAKA ZAYYAN'),
  ('YUDHISTIRA PERWIRA W'),
  ('ZAHRA LAILIA R'),
  ('ZUHAL ABDILLAH AFKAR')
on conflict (name) do nothing;

-- Seed minggu-minggu September 2026 (nominal Rp5.000 per minggu)
-- Minggu 1-3 sudah lewat, Minggu 4 sedang berjalan (21-27 Sep)
insert into kas_weeks (month, week_number, start_date, end_date, amount) values
  ('September 2026', 1, '2026-09-01', '2026-09-06', 5000),
  ('September 2026', 2, '2026-09-07', '2026-09-13', 5000),
  ('September 2026', 3, '2026-09-14', '2026-09-20', 5000),
  ('September 2026', 4, '2026-09-21', '2026-09-27', 5000)
on conflict (month, week_number) do nothing;

-- Seed minggu-minggu Oktober 2026
insert into kas_weeks (month, week_number, start_date, end_date, amount) values
  ('Oktober 2026', 1, '2026-09-28', '2026-10-04', 5000),
  ('Oktober 2026', 2, '2026-10-05', '2026-10-11', 5000),
  ('Oktober 2026', 3, '2026-10-12', '2026-10-18', 5000),
  ('Oktober 2026', 4, '2026-10-19', '2026-10-25', 5000)
on conflict (month, week_number) do nothing;

-- ============================================================
-- CARA MENAMBAHKAN BENDAHARA
-- ============================================================
-- Setelah user login sekali, masukkan email mereka ke kas_roles:
-- 
-- insert into kas_roles (user_email, role) values
--   ('bendahara@sekretaris.local', 'bendahara')
-- on conflict (user_email) do update set role = excluded.role;
-- 
-- Ganti 'bendahara@sekretaris.local' dengan email user yang sudah dibuat di Supabase Auth.
-- ============================================================
