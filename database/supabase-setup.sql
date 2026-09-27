-- ============================================================
-- SUPABASE SQL SETUP — Web Kelas 9 SCP 2
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. TABEL ATTENDANCE (absensi per hari)
create table if not exists attendance (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  student_name text not null,
  status      text not null default 'Masuk',
  updated_at  timestamptz default now(),
  unique(date, student_name)
);

-- 2. TABEL TASKS (tugas)
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null,
  description text not null,
  deadline    text,
  created_at  timestamptz default now()
);

-- 3. TABEL NOTES (catatan)
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  content     text not null default '',
  updated_at  timestamptz default now()
);

-- 4. TABEL SCHEDULE (jadwal per hari)
create table if not exists schedule (
  day      text primary key,  -- 'Monday', 'Tuesday', dst.
  subjects text[] not null default '{}'
);

-- 5. TABEL PIKET (piket per hari)
create table if not exists piket (
  day      text primary key,  -- 'Monday', 'Tuesday', dst.
  students text[] not null default '{}'
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table attendance enable row level security;
alter table tasks      enable row level security;
alter table notes      enable row level security;
alter table schedule   enable row level security;
alter table piket      enable row level security;

-- Semua orang (termasuk pengunjung) bisa BACA
create policy "Public read attendance" on attendance for select using (true);
create policy "Public read tasks"      on tasks      for select using (true);
create policy "Public read notes"      on notes      for select using (true);
create policy "Public read schedule"   on schedule   for select using (true);
create policy "Public read piket"      on piket      for select using (true);

-- Hanya user yang sudah LOGIN bisa INSERT / UPDATE / DELETE
create policy "Auth write attendance" on attendance for all using (auth.role() = 'authenticated');
create policy "Auth write tasks"      on tasks      for all using (auth.role() = 'authenticated');
create policy "Auth write notes"      on notes      for all using (auth.role() = 'authenticated');
create policy "Auth write schedule"   on schedule   for all using (auth.role() = 'authenticated');
create policy "Auth write piket"      on piket      for all using (auth.role() = 'authenticated');

-- ============================================================
-- BUAT USER SEKRETARIS
-- ============================================================
-- Caranya di Dashboard: Authentication → Users → Add user
-- Masukkan email & password sekretaris kelas.
-- JANGAN pakai SQL untuk buat user (kurang aman).

-- ============================================================
-- SEED DATA AWAL (OPSIONAL) — jadwal & piket default
-- Jalankan kalau mau isi data awal langsung dari sini.
-- ============================================================

insert into schedule (day, subjects) values
  ('Monday',    array['B.ING','IPA','BTQ Kelas 9','B.ARAB','Program Peminatan']),
  ('Tuesday',   array['PJOK','AL ISLAM','BTQ Kelas 9','PEND. PANCASILA','B.INDO']),
  ('Wednesday', array['BK','IPS','BTQ Kelas 9','INFORMATIKA','IPA']),
  ('Thursday',  array['MATH','KMD','BTQ Kelas 9','B.INDO','SENI RUPA']),
  ('Friday',    array['B.ING','PJOK','IPA','B.INDO','SENI RUPA','PEND. PANCASILA'])
on conflict (day) do update set subjects = excluded.subjects;

insert into piket (day, students) values
  ('Monday',    array['ADZKIYA SAFWA ANAKA','ALIYAH NUR LATHIFAH','ALTHAF ZISAN AYDIN R','ANDI NAUFAL N','ASHFA HADZIQ H','ASYIFA NAISILA JELITA','BETHARI JANITRA IW']),
  ('Tuesday',   array['BILLIE RAIHAN SAPUTRA','DAFFA RIDHO ALGHANI','DELISA ASZAHRA P','DHAFIN DZIMAR','DIMAS NARENDRA W','DIRA SHASMIRA RIANTI','EDDLYN ARSY ZUHAIR']),
  ('Wednesday', array['FADIPTA JAVAS A','KEI EZHAR ABHIMATA','KENZO JABBAR LEBCCA','MALVINO APRILIO PI','MARITZA ADILIA S','MOCH DAFFA RAFANDRA','MOCH NABIL DAVIAN N']),
  ('Thursday',  array['MUH GHAISAN WIMIANO','MUH RAFA RABBANI H','MUH RAFI SYAHPUTRA A','NAURA KARENZA A Z','NAYOTTAMA AR','SABRINA VIDI ARETHA']),
  ('Friday',    array['VELIKA JASMIN CK','VINNO IBRAHIM A','WIDYATAMAKA ZAYYAN','YUDHISTIRA PERWIRA W','ZAHRA LAILIA R','ZUHAL ABDILLAH AFKAR'])
on conflict (day) do update set students = excluded.students;

insert into notes (content) values
  ('Kalau ada yang kurang atau salah bisa dikoreksi dan ditambahin yaa!');
