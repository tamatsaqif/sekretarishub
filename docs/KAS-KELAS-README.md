# Kas Kelas — 9 SCP 2

Sistem Kas Kelas terintegrasi untuk website 9 SCP 2.

## Fitur Utama

### Public (Semua Orang)
- ✓ Lihat status pembayaran minggu ini untuk setiap siswa
- ✓ Lihat saldo kas dan total tunggakan
- ✓ Akses halaman detail siswa individual (`/kas-kelas/[nama-siswa]`)
- ✓ Lihat riwayat pembayaran per siswa
- ✓ Tidak perlu login untuk melihat data

### Bendahara (Setelah Login)
- ✓ Catat pembayaran siswa
- ✓ Quick pay dari halaman detail siswa
- ✓ Validasi duplicate payment
- ✓ Tracking siapa yang mencatat pembayaran

## Struktur Navigasi

```
/                → Dashboard (home.html)
├── /info        → Sekretaris / Daily Class Info
└── /kas-kelas   → Kas Kelas
    └── /kas-kelas/[studentId] → Detail siswa (public)
```

## Design Language

Semua halaman menggunakan design system yang sama:
- **Background**: Grid pulse animation + gradient soft background
- **Typography**: SF Pro Display/Text
- **Components**: Panel cards, drawers, modals yang konsisten
- **Colors**: Palette yang sama dengan `/info`
- **Icons**: Feather Icons (SVG inline)
- **Animations**: Spring easing, smooth transitions

## Database Schema

### Tables

#### `students`
```sql
id          uuid primary key
name        text not null unique
created_at  timestamptz
```

#### `kas_weeks`
```sql
id          uuid primary key
month       text not null        -- "September 2026"
week_number integer not null     -- 1, 2, 3, 4
start_date  date not null
end_date    date not null
amount      integer not null     -- Rp5.000
created_at  timestamptz
unique(month, week_number)
```

#### `kas_payments`
```sql
id          uuid primary key
student_id  uuid references students(id)
week_id     uuid references kas_weeks(id)
amount      integer not null
paid_at     timestamptz default now()
recorded_by text                 -- email bendahara
created_at  timestamptz
unique(student_id, week_id)      -- Prevent duplicate payment
```

#### `kas_expenses`
```sql
id          uuid primary key
amount      integer not null
description text not null
expense_date date not null
recorded_by text
created_at  timestamptz
```

#### `kas_roles`
```sql
id          uuid primary key
user_email  text not null unique
role        text not null        -- "bendahara" atau "student"
created_at  timestamptz
```

### RLS Policies

- **Public read**: Semua orang bisa melihat `students`, `kas_weeks`, `kas_payments`, `kas_expenses`
- **Bendahara write**: Hanya user dengan role `bendahara` di `kas_roles` yang bisa INSERT/UPDATE/DELETE payment & expense

## Setup Database

### 1. Jalankan Migration

Buka Supabase Dashboard → SQL Editor → New Query, lalu jalankan:

```bash
supabase-kas.sql
```

File ini akan:
- Membuat semua table yang diperlukan
- Setup RLS policies
- Seed data siswa (33 siswa)
- Seed minggu-minggu kas (Juli minggu 3 - Oktober minggu 4)

### 2. Tambahkan Bendahara

Setelah user login pertama kali, masukkan email mereka ke `kas_roles`:

```sql
insert into kas_roles (user_email, role) values
  ('bendahara@sekretaris.local', 'bendahara')
on conflict (user_email) do update set role = excluded.role;
```

Ganti `bendahara@sekretaris.local` dengan email user yang sudah dibuat di Supabase Auth.

### 3. Initial Snapshot (Opsional)

Jika ingin memasukkan data pembayaran awal berdasarkan snapshot 21 September 2026:

```sql
-- Contoh: Bethari lunas sampai September minggu ke-4
-- Artinya sudah membayar minggu 1, 2, 3, 4 September
insert into kas_payments (student_id, week_id, amount, recorded_by)
select 
  (select id from students where name = 'BETHARI JANITRA IW'),
  id,
  amount,
  'initial_snapshot'
from kas_weeks
where month = 'September 2026' and week_number in (1, 2, 3, 4)
on conflict do nothing;
```

Ulangi untuk siswa lain sesuai data snapshot.

## Periode Kas

- **Mulai**: Juli 2026 minggu ke-3 (14-20 Juli 2026)
- **Iuran**: Rp5.000/minggu
- **Sistem**: Pembayaran per minggu, tidak ada sistem cicilan

### Total Kewajiban

Sampai September minggu ke-4 (21-27 Sep 2026):
- Juli: minggu 3, 4 = 2 minggu
- Agustus: minggu 1, 2, 3, 4 = 4 minggu
- September: minggu 1, 2, 3, 4 = 4 minggu
- **Total**: 10 minggu × Rp5.000 = **Rp50.000**

## Snapshot Data Awal (21 September 2026)

Kondisi kas per Senin, 21 September 2026:

### Saldo Kas Aktual
**Rp840.000** (uang yang sudah terkumpul)

### Total Tunggakan
**Rp880.000** (uang yang belum dibayar siswa)

### Status Per Siswa

| Nama | Tunggakan | Status |
|------|-----------|--------|
| Adzkiya | Rp5.000 | Belum lunas |
| Aliya | Rp10.000 | Belum lunas |
| Althaf | Rp50.000 | Belum bayar sama sekali |
| ... | ... | ... |
| Bethari | Rp0 | Lunas sampai Sep minggu 4 |
| Delisa | Rp0 | Lunas sampai Sep minggu 4 |
| Dhafin | Rp0 | Lunas sampai Okt minggu 2 |
| Sabrina | Rp0 | Lunas sampai Sep minggu 4 |
| Zahra | Rp0 | Lunas sampai Okt minggu 1 |

**Catatan**: Data di atas adalah snapshot kondisi. Sistem TIDAK mengarang history pembayaran yang tidak diketahui.

## API Functions (`kas.js`)

### Students
```javascript
fetchStudents()                           // Get all students
```

### Weeks
```javascript
fetchKasWeeks()                           // Get all weeks
getCurrentWeek()                          // Get current week
```

### Payments
```javascript
fetchPaymentsByStudent(studentId)         // Get student's payments
fetchPaymentsByWeek(weekId)               // Get week's payments
insertPayment({ student_id, week_id, amount, recorded_by })
updatePayment(id, data)
deletePayment(id)
getStudentPaymentStatus(studentId, weekId) // Check if paid
```

### Expenses
```javascript
fetchExpenses()
insertExpense({ amount, description, expense_date, recorded_by })
updateExpense(id, data)
deleteExpense(id)
```

### Summary
```javascript
getKasSummary()                           // { totalIncome, totalExpense, balance }
getTotalOutstanding()                     // Total tunggakan semua siswa
```

### Roles
```javascript
isBendahara()                             // Check if current user is bendahara
```

## UI Components

### Halaman Utama (`/kas-kelas`)

**Komponen**:
1. **Summary Panel**: Saldo, Tunggakan, Total Siswa, Minggu Ini
2. **Search Box**: Cari siswa dengan real-time filter
3. **Student Cards Grid**: Card per siswa dengan:
   - Nama siswa
   - Status minggu ini (Sudah Bayar / Belum Bayar)
   - Tunggakan

### Detail Siswa (`/kas-kelas/[studentId]`)

**Drawer dari kanan** dengan komponen:
1. **Current Week Status**: Card besar menampilkan status minggu ini
2. **Summary Grid**: Total Wajib, Sudah Dibayar, Tunggakan
3. **Payment Actions** (Bendahara only): Quick pay button
4. **Payment History**: Riwayat per bulan dan minggu

### Modal Catat Pembayaran (Bendahara only)

**Form**:
- Select siswa
- Select minggu
- Input nominal (auto-fill dari minggu yang dipilih)
- Validasi duplicate payment

## UX Requirements

### Status Minggu Ini adalah Fokus Utama

Pada list siswa, status minggu ini harus **lebih menonjol** daripada history:
- ✓ Badge warna (hijau = sudah bayar, merah = belum bayar)
- ✓ Typography yang clear
- ✓ Posisi prominent di card

### Same UI untuk Public & Bendahara

Bendahara melihat UI yang sama dengan public, hanya dengan **tambahan action buttons**:
- ✓ Button "Catat Pembayaran" muncul di header
- ✓ Quick pay button di detail siswa
- ✓ Badge "Bendahara" di topbar

**TIDAK** ada dashboard terpisah dengan design berbeda.

### Public Access

Halaman detail siswa (`/kas-kelas/billie`) bisa dibuka oleh siapa saja tanpa login:
- ✓ Tujuan: Teman sekelas bisa ngecek status kas temannya
- ✓ Data yang ditampilkan: Hanya data kas (nama, status, tunggakan, history)
- ✓ Data yang TIDAK ditampilkan: Email, password, nomor HP, alamat

## Workflow Bendahara

### Mencatat Pembayaran

1. Login sebagai bendahara
2. Klik "Catat Bayar" di header ATAU
3. Buka detail siswa → klik "Catat Pembayaran Minggu Ini"
4. Pilih siswa & minggu
5. Nominal auto-fill
6. Klik "Simpan"

### Validasi

System otomatis:
- ✓ Cek duplicate payment (student_id + week_id harus unique)
- ✓ Tampilkan error jika sudah pernah dicatat
- ✓ Record siapa yang mencatat (email bendahara)

## File Structure

```
web-kelas/
├── kas-kelas.html          # Halaman utama Kas Kelas
├── kas-app.js              # JavaScript logic Kas Kelas
├── kas.js                  # Supabase API functions
├── home.html               # Dashboard dengan link ke /info & /kas-kelas
├── index.html              # /info (Sekretaris)
├── app.js                  # /info logic
├── supabase.js             # Shared Supabase functions
├── supabase-kas.sql        # Database migration
├── styles.css              # Shared styles (updated with kas styles)
├── env.js                  # Generated from Vercel env vars
└── router.js               # Client-side routing
```

## Deployment

Project sudah di-deploy di:
**https://science2hub.vercel.app**

### Vercel Environment Variables

Pastikan sudah set:
```
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

Environment variables ini akan di-generate jadi `env.js` saat build.

## Testing Checklist

### Public User
- [ ] Buka `/kas-kelas` tanpa login
- [ ] Lihat summary (saldo, tunggakan, total siswa)
- [ ] Lihat status minggu ini per siswa
- [ ] Search siswa
- [ ] Klik siswa → drawer detail terbuka
- [ ] Lihat status minggu ini di detail
- [ ] Lihat summary (total wajib, sudah dibayar, tunggakan)
- [ ] Lihat riwayat pembayaran per bulan
- [ ] Tidak ada button "Catat Pembayaran"

### Bendahara
- [ ] Login sebagai bendahara
- [ ] Badge "Bendahara" muncul di topbar
- [ ] Button "Catat Bayar" muncul di header
- [ ] Klik "Catat Bayar" → modal terbuka
- [ ] Pilih siswa & minggu → nominal auto-fill
- [ ] Submit → berhasil tersimpan
- [ ] Coba submit ulang siswa & minggu yang sama → error duplicate
- [ ] Buka detail siswa yang belum bayar minggu ini
- [ ] Button "Catat Pembayaran Minggu Ini" muncul
- [ ] Klik quick pay → confirm → berhasil
- [ ] Status minggu ini berubah jadi "Sudah Bayar"
- [ ] Summary & tunggakan update

### Navigation
- [ ] Dari `/` (home) bisa ke `/info` dan `/kas-kelas`
- [ ] Dari `/kas-kelas` bisa back ke `/` (Dashboard button)
- [ ] Dari `/info` bisa ke `/` (Dashboard button)
- [ ] Design konsisten di semua halaman

## Troubleshooting

### "Gagal load siswa"
- Cek apakah tabel `students` sudah diisi
- Cek RLS policy "Public read students" sudah enabled

### "Gagal simpan pembayaran"
- Cek apakah user sudah ada di `kas_roles` dengan role `bendahara`
- Cek RLS policy "Bendahara write kas_payments"
- Cek unique constraint (student_id, week_id)

### "Saldo kas tidak update"
- `getKasSummary()` menghitung dari `kas_payments` dan `kas_expenses`
- Cek apakah data sudah masuk di kedua table tersebut

### "Total tunggakan salah"
- `getTotalOutstanding()` menghitung: (Total siswa × Total minggu yang lewat × Rp5.000) - Total pembayaran
- Cek apakah `kas_weeks.start_date` sesuai dengan hari ini
- Cek apakah semua payment tercatat

## Future Enhancements

- [ ] Export laporan kas (PDF/Excel)
- [ ] Notifikasi reminder pembayaran
- [ ] History pengeluaran kas yang lebih detail
- [ ] Dashboard analytics (chart pembayaran per minggu)
- [ ] Batch payment (catat pembayaran beberapa siswa sekaligus)
- [ ] Print bukti pembayaran

## Credits

Design language & components inspired by:
- SF Pro Font (Apple)
- Linear.app design system
- Vercel design aesthetic

Developed for 9 SCP 2 Class Management System.
