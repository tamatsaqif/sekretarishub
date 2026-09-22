# Setup Kas Kelas — Science2Hub

Dashboard dan sistem kas kelas telah ditambahkan ke project `science2hub`.

## ✅ File yang Dibuat

### Pages
- `home.html` — Dashboard utama (`/home`)
- `kas-kelas.html` — Halaman kas kelas (`/kas-kelas`)
- `index.html` — Tetap sebagai `/info` (tidak diubah)

### JavaScript Modules
- `kas.js` — Fungsi Supabase untuk kas kelas
- `kas-app.js` — Aplikasi kas kelas (UI logic)
- `router.js` — Client-side router (opsional, tidak digunakan karena menggunakan Vercel routes)

### Database
- `supabase-kas.sql` — SQL migration untuk tabel kas

## 📦 File yang Diubah

- `vercel.json` — Routing untuk `/home`, `/info`, `/kas-kelas`

## 🗄️ Database Setup

### 1. Jalankan Migration SQL

Buka Supabase Dashboard → SQL Editor → New Query, lalu paste dan jalankan isi file `supabase-kas.sql`.

Migration ini akan membuat:

**Tabel:**
- `students` — Daftar siswa (33 siswa 9 SCP 2)
- `kas_weeks` — Minggu pembayaran (September & Oktober 2026)
- `kas_payments` — Riwayat pembayaran siswa
- `kas_expenses` — Pengeluaran kas
- `kas_roles` — Role bendahara (permission)

**RLS Policies:**
- Semua user (termasuk yang belum login) bisa **READ** semua data kas
- Hanya user dengan role `bendahara` bisa **INSERT/UPDATE/DELETE** data kas

### 2. Buat User Bendahara

#### A. Buat akun di Supabase Auth

Supabase Dashboard → Authentication → Users → **Add user**

Contoh:
- Email: `bendahara@sekretaris.local`
- Password: `password123` (ganti dengan password yang aman)
- ✅ **Centang "Auto Confirm"** (agar tidak perlu verifikasi email)

#### B. Berikan role bendahara

Setelah user dibuat, jalankan query SQL berikut untuk memberikan role bendahara:

```sql
insert into kas_roles (user_email, role) values
  ('bendahara@sekretaris.local', 'bendahara')
on conflict (user_email) do update set role = excluded.role;
```

**Ganti `bendahara@sekretaris.local`** dengan email user yang sudah dibuat.

### 3. Environment Variables

Pastikan environment variables di Vercel sudah diset:

- `SUPABASE_URL` → `https://xxxxxx.supabase.co`
- `SUPABASE_ANON_KEY` → `eyJhbG...` (anon/public key)

Jika sudah ada untuk `/info`, tidak perlu diubah. Kas kelas menggunakan Supabase yang sama.

## 🎯 Struktur Navigasi

```
/home (atau /)
└── Dashboard
    ├── Card "Sekretaris" → /info
    └── Card "Kas Kelas" → /kas-kelas
```

**URL:**
- `science2hub.vercel.app/` → Dashboard
- `science2hub.vercel.app/home` → Dashboard
- `science2hub.vercel.app/info` → Sekretaris / Daily Class Info
- `science2hub.vercel.app/kas-kelas` → Kas Kelas

## 🧪 Testing Lokal

### 1. Install Dependencies (jika belum)

Project ini tidak memerlukan `npm install` karena menggunakan vanilla JS + CDN Supabase.

### 2. Build

```bash
npm run build
```

### 3. Serve Lokal

Gunakan web server sederhana, contoh:

```bash
# Python 3
python -m http.server 8000

# Node.js (jika ada http-server)
npx http-server -p 8000
```

Buka browser: `http://localhost:8000/home`

### 4. Test Flow

#### User Biasa (tanpa login):
1. Buka `/kas-kelas`
2. Lihat saldo, pemasukan, pengeluaran (READ-ONLY)
3. Cari nama siswa
4. Klik nama siswa → lihat detail pembayaran & riwayat
5. **Tidak bisa** menambah pembayaran atau pengeluaran (tombol tersembunyi)

#### Bendahara (setelah login):
1. Klik tombol `•••` di pojok kanan atas → Login
2. Username: `bendahara` (atau `bendahara@sekretaris.local`)
3. Password: password yang dibuat di Supabase
4. Setelah login, muncul tombol:
   - `+ Catat Bayar`
   - `+ Pengeluaran`
5. Klik `+ Catat Bayar`:
   - Pilih siswa
   - Pilih minggu pembayaran (nominal otomatis terisi)
   - Klik "Tandai Sudah Bayar"
   - ✅ Saldo kas otomatis bertambah
   - ✅ Total pembayaran siswa otomatis update
6. Klik `+ Pengeluaran`:
   - Masukkan nominal (contoh: 50000)
   - Keterangan: "Beli dekorasi kelas"
   - Tanggal
   - Simpan
   - ✅ Saldo kas otomatis berkurang

## 🔐 Role & Permission

### User Biasa
- ✅ Lihat saldo kas
- ✅ Lihat daftar pembayaran siswa
- ✅ Lihat detail pembayaran per siswa
- ✅ Lihat riwayat minggu-minggu pembayaran
- ❌ Tidak bisa menambah/edit/hapus data

### Bendahara
- ✅ Semua akses user biasa
- ✅ Catat pembayaran siswa
- ✅ Koreksi/hapus pembayaran (jika diperlukan)
- ✅ Catat pengeluaran kas
- ✅ Edit/hapus pengeluaran

**Permission diatur via Supabase RLS**, bukan hanya menyembunyikan tombol di frontend.

## 📊 Data Siswa

Sistem kas menggunakan **tabel `students` yang sama** dengan sistem sekretaris.

Jika `/info` sudah menyimpan data siswa di tabel berbeda, sesuaikan di:
- `supabase-kas.sql` → hapus bagian create table `students` dan sesuaikan foreign key
- `kas.js` → sesuaikan query `fetchStudents()`

Saat ini, 33 siswa 9 SCP 2 sudah di-seed otomatis saat migration.

## 🧮 Perhitungan Kas

### Saldo Kas
```
Saldo = Total Pemasukan - Total Pengeluaran
```

### Total Pemasukan
Jumlah dari semua `kas_payments.amount` (pembayaran siswa)

### Total Pengeluaran
Jumlah dari semua `kas_expenses.amount`

### Kekurangan Siswa
```
Kekurangan = (Jumlah minggu yang sudah lewat × Rp5.000) - Total Dibayar
```

Contoh:
- Hari ini: 21 September 2026 (Minggu ke-4 sedang berjalan)
- Minggu yang sudah lewat: Minggu 1, 2, 3 (3 minggu)
- Total yang harus dibayar: 3 × Rp5.000 = Rp15.000
- Siswa A sudah bayar: Rp10.000
- Kekurangan: Rp15.000 - Rp10.000 = **Rp5.000**

## 🎨 Design

Halaman `/home` dan `/kas-kelas` menggunakan:
- **Visual language yang sama** dengan `/info`
- **SF Pro Display** untuk heading
- **SF Pro Text** untuk body
- **Warna, spacing, radius** yang konsisten
- **Grid Pulse Canvas** background animation (sama seperti `/info`)
- **iOS-style bottom sheet modal** untuk detail siswa dan form

Tidak ada komponen yang diduplikasi. Semua menggunakan `styles.css` yang sudah ada.

## 🚀 Deploy ke Vercel

Setelah file-file baru dibuat:

```bash
git add .
git commit -m "feat: tambah dashboard /home dan kas kelas /kas-kelas"
git push origin main
```

Vercel akan otomatis build dan deploy.

Cek:
- `science2hub.vercel.app/home` → Dashboard
- `science2hub.vercel.app/kas-kelas` → Kas Kelas
- `science2hub.vercel.app/info` → Sekretaris (tidak berubah)

## 🐛 Troubleshooting

### 1. "Table 'students' does not exist"
Jalankan `supabase-kas.sql` di Supabase SQL Editor.

### 2. "Permission denied for table kas_payments"
User belum diberi role bendahara. Jalankan:
```sql
insert into kas_roles (user_email, role) values
  ('email@user.com', 'bendahara');
```

### 3. Tombol bendahara tidak muncul setelah login
- Cek apakah email user sudah ada di tabel `kas_roles`
- Cek apakah `role = 'bendahara'` (bukan 'admin' atau lainnya)
- Refresh halaman setelah login

### 4. Saldo kas tidak update
- Cek console browser (F12) untuk error
- Pastikan RLS policy sudah dibuat untuk `kas_payments` dan `kas_expenses`
- Cek apakah `SUPABASE_ANON_KEY` valid

### 5. Routing tidak bekerja di lokal
Pastikan menggunakan web server yang support routing (bukan `file://`).
Gunakan `python -m http.server` atau `npx http-server`.

## 📝 Next Steps

### Menambah Minggu Pembayaran Baru

Setiap bulan, jalankan query SQL untuk menambah minggu baru:

```sql
insert into kas_weeks (month, week_number, start_date, end_date, amount) values
  ('November 2026', 1, '2026-10-26', '2026-11-01', 5000),
  ('November 2026', 2, '2026-11-02', '2026-11-08', 5000),
  ('November 2026', 3, '2026-11-09', '2026-11-15', 5000),
  ('November 2026', 4, '2026-11-16', '2026-11-22', 5000)
on conflict (month, week_number) do nothing;
```

### Menambah Bendahara Lain

```sql
insert into kas_roles (user_email, role) values
  ('bendahara2@sekretaris.local', 'bendahara');
```

### Export Data Kas

Untuk backup atau laporan:

```sql
-- Export semua pembayaran
select 
  s.name as siswa,
  w.month,
  w.week_number,
  p.amount,
  p.paid_at,
  p.recorded_by
from kas_payments p
join students s on p.student_id = s.id
join kas_weeks w on p.week_id = w.id
order by p.paid_at desc;

-- Export semua pengeluaran
select * from kas_expenses order by expense_date desc;
```

## ✨ Fitur yang Sudah Dibuat

✅ Dashboard `/home` dengan menu Sekretaris & Kas Kelas  
✅ Sistem kas kelas dengan saldo real-time  
✅ Pembayaran per siswa per minggu  
✅ Riwayat pembayaran per siswa (bulan & minggu)  
✅ Pengeluaran kas  
✅ Role bendahara dengan RLS Supabase  
✅ Mobile-responsive  
✅ Design konsisten dengan `/info`  
✅ User biasa hanya bisa READ  
✅ Authentication dengan Supabase Auth  

---

**Dibuat untuk:** Kelas 9 SCP 2 — Science2Hub  
**Tanggal:** 21 September 2026
