# CLAUDE.md — Web Kelas 9 SCP 2

Dokumen konteks untuk sesi Claude Code. Berdasarkan audit penuh terhadap source code, bukan asumsi.

---

## 1. Project Overview

Platform manajemen informasi kelas SMP kelas 9 SCP 2. Mengelola jadwal pelajaran, tugas, jadwal piket, pengumuman, daftar anggota, dan kas kelas. Dibuat untuk diakses oleh siswa (read-only) dan pengurus kelas (Sekretaris & Bendahara) yang login via Supabase Auth.

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Vanilla JS ES Modules, HTML5, CSS3 |
| Backend / DB | Supabase (PostgreSQL + Auth) via CDN UMD |
| Font | SF Pro Display (cdnfonts.com) |
| Deploy | Vercel (`vercel.json`) + Netlify (`netlify.toml`) |
| Build | `node build.js` (custom script, bukan bundler) |
| Package deps | `lucide ^1.69.0`, `motion ^14.9.1` (belum dipakai di halaman utama) |

Tidak ada framework JS (React/Vue/Svelte). Tidak ada bundler (Webpack/Vite). Ini **Multi-Page Application (MPA)** murni.

---

## 3. Struktur Folder

```
web kelas/
├── index.html            ← Entry point (halaman Home)
├── daily-info.html       ← Modul 01: Daily Info, Absensi, WA Generator
├── tugas.html            ← Modul 02: Tugas & Deadline
├── piket.html            ← Modul 03: Jadwal Piket
├── pengumuman.html       ← Modul 04: Papan Pengumuman
├── anggota.html          ← Modul 05: Daftar 33 Siswa
├── kas-kelas.html        ← Modul 06: Kas Kelas
├── home.html             ← Instant redirect ke `/` via meta refresh + JS (bukan halaman nyata)
├── styles.css            ← Satu-satunya stylesheet global (~1700+ baris)
├── shared.js             ← Utilities, navigasi, auth modal, animasi canvas
├── supabase.js           ← Supabase client + semua fungsi DB
├── kas.js                ← Data store kas kelas (localStorage-first)
├── kas-app.js            ← UI logic untuk kas-kelas.html
├── env.js                ← Env vars (di-generate saat build)
├── router.js             ← DEV-ONLY client router (tidak aktif di produksi)
├── app.js                ← DEAD FILE — tidak diimport siapapun, aman dihapus
├── build.js              ← Baca process.env.SUPABASE_URL/KEY → generate env.js
├── _headers              ← Security headers (CSP, HSTS) untuk Netlify/Vercel — KRITIS
├── vercel.json           ← Routing/rewrites Vercel
├── netlify.toml          ← Build config Netlify (tidak ada redirect rules)
├── package.json          ← npm config, type: "module"
├── README.md             ← OUTDATED — masih deskripsi arsitektur lama (app.js era), jangan dipercaya
├── rebuild-structure.md  ← Dokumen task redesign homepage lama, tidak relevan
├── design-direction.md   ← Panduan desain (tidak relevan untuk logika)
├── database/             ← SQL setup scripts Supabase
│   ├── supabase-setup.sql
│   ├── supabase-kas.sql
│   ├── supabase-announcements.sql
│   └── insert-kas-snapshot.sql
├── docs/                 ← Dokumentasi kas kelas
└── archive/              ← Eksperimen React lama (tidak digunakan)
```

**Abaikan saat coding:** `node_modules/`, `archive/`, `app.js` (dead file), `router.js` (dev-only tidak aktif), `README.md` (outdated), `rebuild-structure.md` (task lama).

---

## 4. Entry Points & Routing

**Produksi (Vercel):** `vercel.json` me-rewrite clean URL ke file `.html`:

| URL | File |
|---|---|
| `/` atau `/home` | `index.html` |
| `/daily-info` atau `/info` | `daily-info.html` |
| `/tugas` | `tugas.html` |
| `/piket` | `piket.html` |
| `/pengumuman` | `pengumuman.html` |
| `/anggota` | `anggota.html` |
| `/kas-kelas` | `kas-kelas.html` |

**Dev lokal:** `setupNavigation()` di `shared.js` mendeteksi `localhost` dan redirect `/path` → `/path.html` via click interceptor.

**Tidak ada SPA router aktif.** `router.js` ada di repo tapi tidak diimport oleh halaman manapun.

**Netlify:** `netlify.toml` tidak memiliki redirect rules. Deploy ke Netlify akan menyebabkan clean URL (`/tugas`, `/piket`, dll.) tidak berfungsi — hanya Vercel yang sudah dikonfigurasi untuk ini.

---

## 5. Daftar Fitur & Lokasi Implementasi

| Fitur | Halaman | Logika |
|---|---|---|
| Jadwal Mata Pelajaran | `daily-info.html`, `index.html` (card) | Inline script di `daily-info.html` |
| Absensi Harian | `daily-info.html` | Inline script di `daily-info.html` |
| Catatan Harian | `daily-info.html` | Inline script di `daily-info.html` |
| Generator Pesan WA | `daily-info.html` | Inline script di `daily-info.html` |
| Tugas & Deadline | `tugas.html`, `index.html` (card), `daily-info.html` (preview) | Inline script di `tugas.html` |
| Jadwal Piket | `piket.html`, `daily-info.html` (preview), `index.html` (card) | Inline script di `piket.html` |
| Papan Pengumuman | `pengumuman.html` | Inline script di `pengumuman.html` |
| Daftar Anggota | `anggota.html` | Inline script di `anggota.html` |
| Kas Kelas | `kas-kelas.html` | `kas-app.js` (UI) + `kas.js` (data) |
| Navigasi & Header | Semua halaman | `setupNavigation()` di `shared.js` |
| Auth Login/Logout | Semua halaman | `setupNavigation()` di `shared.js` |
| Canvas Grid Animation | Semua halaman | `initGridPulse()` di `shared.js` |

---

## 6. Arsitektur Frontend & Backend

### Boot Sequence (tiap halaman)
1. HTML dimuat (via clean URL dari Vercel)
2. CDN Supabase UMD script dieksekusi → `window.supabase` tersedia
3. `<script type="module">` dieksekusi
4. `initGridPulse()` → mulai animasi canvas background
5. `setupNavigation("key")` → inject header + mobile drawer + auth modal ke DOM, cek session Supabase
6. Fungsi load data (`fetchXxx()`) dipanggil async

### Pola Halaman
Semua halaman (kecuali `kas-kelas.html`) menggunakan **inline `<script type="module">`**. `kas-kelas.html` menggunakan external `<script type="module" src="kas-app.js">`.

### Admin Access Pattern
Semua tombol/elemen untuk Sekretaris/Bendahara pakai class `.admin-only hidden`. `syncAuthState(session)` di `shared.js` men-toggle class ini. **Tidak ada logika auth di halaman individual.**

---

## 7. Alur Data & Database

### Pola per Modul

| Modul | Read | Write | Storage |
|---|---|---|---|
| Jadwal / Piket | Supabase SELECT | Supabase UPSERT | Supabase only |
| Absensi | Supabase SELECT | Supabase UPSERT | Supabase only |
| Tugas | Supabase SELECT → cache localStorage | Supabase INSERT/UPDATE/DELETE | Supabase + localStorage cache |
| Completion tugas | localStorage only | localStorage only | **Tidak pernah ke Supabase** |
| Catatan | Supabase SELECT (1 row) | Supabase UPDATE/INSERT | Supabase only |
| Pengumuman | Supabase SELECT → fallback localStorage | Supabase INSERT → fallback localStorage | Supabase + localStorage fallback |
| Kas Kelas | localStorage (source of truth) | localStorage + Supabase fire-and-forget | localStorage primary |

### Database Tables (Supabase)

| Tabel | Kolom penting | Constraint |
|---|---|---|
| `attendance` | date, student_name, status, updated_at | UNIQUE(date, student_name) |
| `tasks` | subject, description, deadline, created_at | — |
| `notes` | content, updated_at | Single row design |
| `schedule` | day (PK), subjects[] | PK = day name |
| `piket` | day (PK), students[] | PK = day name |
| `announcements` | title, content, tag, created_at | — |
| `students` | id, name | kas module |
| `kas_weeks` | id, month, week_number, start_date, end_date, amount | UNIQUE(month, week_number) |
| `kas_payments` | student_id (FK), week_id (FK), amount, paid_at, recorded_by | UNIQUE(student_id, week_id) |
| `kas_expenses` | — | kas module |

### localStorage Keys

| Key | Pemilik | Dibaca oleh |
|---|---|---|
| `sekretaris9scp2-completed-tasks` | `shared.js` | `tugas.html`, `daily-info.html`, `index.html` |
| `sekretaris9scp2-tasks-list` | `tugas.html` | `tugas.html` |
| `sekretaris9scp2-kas-unified-store-v2` | `kas.js` | `kas.js`, `kas-app.js`, `anggota.html` |
| `sekretaris9scp2-announcements-local` | `pengumuman.html` | `pengumuman.html` |

### Cross-Page Communication
`window.storage` event: `index.html` dan `daily-info.html` listen pada key `sekretaris9scp2-completed-tasks` untuk re-render ketika tugas.html menandai tugas selesai di tab lain.

---

## 8. Peta Dependensi

```
env.js
  ← supabase.js (SUPABASE_URL, SUPABASE_ANON_KEY)
  ← kas.js      (SUPABASE_URL, SUPABASE_ANON_KEY — client terpisah!)

supabase.js
  ← shared.js        (signIn, signOut, getSession, onAuthChange)
  ← index.html       (fetchSchedule, fetchPiket, fetchTasks)
  ← daily-info.html  (fetchSchedule, saveSchedule, fetchPiket, fetchTasks,
                       fetchNotes, saveNotes, fetchAttendance, upsertAttendance, upsertAllAttendance)
  ← tugas.html       (fetchTasks, insertTask, updateTask, deleteTask)
  ← piket.html       (fetchPiket, savePiket)
  ← pengumuman.html  (fetchAnnouncements, insertAnnouncement, deleteAnnouncement)
  ← anggota.html     (fetchPiket, fetchAttendance)

kas.js
  ← kas-app.js   (fetchStudents, fetchKasWeeks, getCurrentWeek, fetchAllPayments,
                   fetchPaymentsByStudent, insertPayment, toggleWeekPayment,
                   getStudentPaymentStatus, getKasSummary, getTotalOutstanding)
  ← anggota.html (fetchAllPayments, fetchKasWeeks)

shared.js
  ← index.html, daily-info.html, tugas.html, piket.html,
    pengumuman.html, anggota.html, kas-app.js  (semua halaman)

**Catatan:** `kas-app.js` mendefinisikan `formatDateRange()` secara lokal — fungsi ini tidak diekspor dari `shared.js`.
```

**Dampak jika file diubah:**

| File diubah | Yang terdampak |
|---|---|
| `shared.js` — `setupNavigation()` signature | Semua 7 halaman (boot berhenti) |
| `shared.js` — `STUDENTS` array | `daily-info.html`, `anggota.html`, `piket.html` |
| `shared.js` — `COMPLETED_TASKS_KEY` / `TASKS_STORAGE_KEY` | `tugas.html`, `index.html`, `daily-info.html` |
| `supabase.js` — interface fungsi export | 5 halaman yang import darinya |
| `env.js` — URL/key | `supabase.js` DAN `kas.js` (dua client, keduanya putus) |
| `kas.js` — `KAS_STORAGE_KEY` | `kas-app.js`, `anggota.html` (data kas hilang) |
| `styles.css` — CSS variables (`--ink-*`, `--surface-*`, dll.) | Semua halaman |

---

## 9. Design System & Aturan Styling

Satu file: `styles.css`. Tidak ada CSS preprocessor atau utility framework.

### CSS Custom Properties (Design Tokens)
Didefinisikan di `:root`:
- **Tipografi:** `--font-display` (SF Pro Display), `--font-text` (SF Pro Text), `--font-mono`
- **Warna:** Monochrome grayscale ketat — `--bg-base`, `--bg-subtle`, `--surface-*`, `--ink-primary/secondary/muted/tertiary/inverted`
- **Border:** `--line-subtle/neutral/strong/border`
- **Radius:** `--radius-xs` (6px) sampai `--radius-pill` (9999px)
- **Shadow:** Semua `none` (flat design) kecuali `--shadow-drawer`
- **Animasi:** `--duration-fast/normal/slow`, `--ease-apple` (**CATATAN: nilai CSS invalid — lihat seksi Known Issues**)
- **Layout:** `--max-width: 1000px`

### Pola Komponen CSS
- `.app-shell` — container utama, max-width 1000px, centered
- `.card-panel` — unit kartu konten utama
- `.grid-2` — 2-column responsive grid
- `.drawer-backdrop` / `.drawer-panel` — modal/side drawer
- `.filter-pills` / `.filter-pill` — filter tab bar
- `.admin-only.hidden` — elemen admin, dikontrol oleh `syncAuthState()`
- `.toast-container` / `.toast` — notifikasi

### Aturan Styling
- Jangan tambahkan file CSS baru — semua styling masuk ke `styles.css`
- Gunakan CSS variables yang sudah ada, jangan hardcode warna atau radius
- Jangan introduce framework CSS baru (Tailwind, Bootstrap, dll.)
- Ikuti pola monochrome — tidak ada warna aksen selain hitam/putih/abu

---

## 10. API & Integrasi Eksternal

### Supabase
- SDK dimuat via CDN sebelum script modul: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js`
- Client diakses via `window.supabase` → `createClient(url, key)`
- **Dua client independen:** satu di `supabase.js`, satu di `kas.js` — keduanya pakai `env.js` yang sama
- Semua fungsi di `supabase.js` null-safe: `if (!db) return fallback` — tidak ada crash jika env tidak dikonfigurasi

### Supabase Auth
- Metode: email/password (`signInWithPassword`)
- Format email internal: jika input tidak ada `@`, suffix `@sekretaris.local` ditambahkan otomatis
- Role pengurus: Sekretaris & Bendahara
- Session di-manage oleh `getSession()` dan `onAuthChange()` di `shared.js`

### Font
- SF Pro Display via `https://fonts.cdnfonts.com/css/sf-pro-display` (di-load di tiap halaman)

### Content Security Policy (`_headers`)
File `_headers` mendefinisikan CSP ketat yang berlaku di Netlify/Vercel. Sumber yang diizinkan:
- **Script:** `'self'`, `'unsafe-inline'`, `https://cdn.jsdelivr.net`
- **Style:** `'self'`, `'unsafe-inline'`, `https://fonts.cdnfonts.com`
- **Font:** `'self'`, `https://fonts.cdnfonts.com`
- **Connect:** `'self'`, `https://*.supabase.co`, `wss://*.supabase.co`

**Jika menambahkan CDN atau resource eksternal baru, `_headers` harus diupdate terlebih dahulu** — jika tidak, browser akan memblokir request tersebut.

### Row Level Security (RLS) Supabase
Hanya dapat diverifikasi sebagian dari SQL scripts lokal:
- **`announcements`** (dari `supabase-announcements.sql`): RLS aktif. Public `SELECT` tanpa auth. `ALL` operations (termasuk DELETE) untuk `auth.role() = 'authenticated'`.
- **Tabel lain** (`attendance`, `tasks`, `notes`, `schedule`, `piket`, `kas_*`): SQL scripts ada di `database/supabase-setup.sql` dan `supabase-kas.sql` — belum dibaca. Status RLS tidak dapat dikonfirmasi dari kode saja.

---

## 11. Environment Variables

Hanya dua, keduanya di `env.js`:
- `SUPABASE_URL` — URL project Supabase
- `SUPABASE_ANON_KEY` — Anon public key Supabase

`env.js` di repo berisi **placeholder**. Nilai asli diinject oleh `build.js` saat deploy dengan membaca `process.env.SUPABASE_URL` dan `process.env.SUPABASE_ANON_KEY`. Env vars ini harus dikonfigurasi di dashboard Vercel/Netlify (Environment Variables), bukan di file. Jika tidak di-set, `build.js` mempertahankan `env.js` yang sudah ada. Jangan edit `env.js` manual dan jangan commit nilai asli ke repo.

---

## 12. Commands

```bash
# Build (inject env vars ke env.js)
# Butuh SUPABASE_URL dan SUPABASE_ANON_KEY di environment (set di Vercel/Netlify dashboard)
node build.js

# Tidak ada dev server bawaan
# Gunakan live server extension atau:
npx serve .
```

**Tidak ada:** lint script, test suite, type checking, format script. Pure JS tanpa tooling tambahan.

---

## 13. Aturan Penting Sebelum Mengubah Kode

### Sebelum edit file apapun
1. Cek dependency map di Bagian 8. Perubahan pada `shared.js`, `supabase.js`, atau `env.js` berdampak ke banyak halaman sekaligus.
2. `shared.js` adalah file paling kritis — dependen langsung: 7 file. Perubahan signature fungsi apapun di sini akan memecahkan semua halaman.

### Pola yang harus dipertahankan
- Semua halaman adalah MPA standalone — tidak ada SPA router
- Gunakan ES modules (`import`/`export`), bukan CommonJS
- Semua utility baru harus masuk ke `shared.js` dan diekspor
- Semua fungsi DB baru harus masuk ke `supabase.js` (kecuali kas: masuk ke `kas.js`)
- Jangan introduce dependency NPM baru tanpa kebutuhan yang jelas
- Jangan tambahkan framework JS atau bundler

### Jika menambahkan resource eksternal baru
Update `_headers` untuk izinkan domain baru di CSP yang sesuai (`script-src`, `style-src`, `connect-src`, dll.) — tanpa ini browser akan memblokir resource tersebut.

### Pola auth yang sudah ada
- Jangan tambahkan logika auth di halaman individual
- Gunakan class `.admin-only hidden` pada elemen yang hanya boleh dilihat pengurus
- `syncAuthState()` di `shared.js` sudah handle toggle secara otomatis

### Kas kelas
- Data kas adalah **localStorage-first** — jangan ubah ke Supabase-primary tanpa migrasi data
- Jangan ganti `KAS_STORAGE_KEY` tanpa migrasi data localStorage lama
- `isBendahara()` saat ini selalu `return true` — belum ada role check nyata untuk fitur kas

### Duplikasi yang diketahui (jangan tambah lagi)
`DEFAULT_PIKET` hardcoded identik di 3 file: `piket.html`, `anggota.html`, `daily-info.html`. Jika jadwal default perlu diubah, update ketiga file.

---

## 14. Known Issues & Bagian Belum Diverifikasi

### Known Issues (dari audit)

| # | Issue | Lokasi | Dampak |
|---|---|---|---|
| 1 | ~~`--ease-apple: cubic-bezier(0.221, 0.361)` — hanya 2 argumen, butuh 4~~ — **FIXED**: diperbarui ke `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `styles.css` | — |
| 2 | `isBendahara()` selalu `return true` — tidak ada role check nyata | `kas.js:376` | Semua user yang login bisa modifikasi data kas |
| 3 | Completion state tugas hanya localStorage — tidak sync ke Supabase | `tugas.html`, `shared.js` | Ganti browser / hapus storage = semua centang tugas hilang |
| 4 | `CustomEvent("app:auth-changed")` di-dispatch tapi tidak ada listener | `shared.js:520` | Dead dispatch, tidak ada efek |
| 5 | Kas Supabase write adalah fire-and-forget tanpa error reporting | `kas.js:261–270` | Kegagalan sync ke Supabase tidak terdeteksi |
| 6 | `getCurrentWeek()` fallback hardcoded ke `"w-sep-4"` | `kas.js:198` | Setelah minggu terdaftar habis (Oktober 2026), fallback ke minggu spesifik September |
| 7 | `DEFAULT_PIKET` duplikat di 3 file | `piket.html`, `anggota.html`, `daily-info.html` | Maintenance burden |
| 8 | `tugas.html` fallback insert error buat id `t-${Date.now()}` — bukan UUID | `tugas.html` sekitar baris 353 | Task dengan id format berbeda tidak akan match dengan data Supabase setelah reload |
| 9 | `recorded_by` hardcoded sebagai string `"bendahara"` di semua operasi payment | `kas-app.js` (payment drawer, pay-all) | Tidak mencerminkan user yang sebenarnya login |
| 10 | `lucide` dan `motion` ada di `package.json` tapi tidak digunakan di manapun | `package.json` | Dead dependencies — aman dihapus dari package.json |

### Dead Files (aman dihapus)
- `app.js` — tidak diimport oleh siapapun. Berisi duplikasi `shared.js` utilities dari versi lama
- `router.js` — tidak aktif di produksi, tidak diimport halaman manapun

### Belum Diverifikasi
- RLS tabel selain `announcements` (`attendance`, `tasks`, `notes`, `schedule`, `piket`, `kas_*`) — perlu cek langsung di Supabase Dashboard atau baca `supabase-setup.sql` / `supabase-kas.sql`
- Isi `database/supabase-setup.sql` dan `supabase-kas.sql`
