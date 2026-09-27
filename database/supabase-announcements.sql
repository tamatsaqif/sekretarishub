-- ============================================================
-- TABEL ANNOUNCEMENTS (Pengumuman Kelas) — Web Kelas 9 SCP 2
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null,
  tag         text default 'Info',
  created_at  timestamptz default now()
);

alter table announcements enable row level security;

-- Semua orang bisa membaca pengumuman
create policy "Public read announcements" on announcements for select using (true);

-- Hanya user terautentikasi (Sekretaris/Pengurus) yang dapat menambah atau menghapus
create policy "Auth write announcements" on announcements for all using (auth.role() = 'authenticated');
