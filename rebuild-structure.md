# Science2Hub — Homepage Redesign

## Context

Homepage Science2Hub saat ini sudah memiliki functionality yang bagus, tetapi terlalu banyak informasi ditampilkan sekaligus.

Saat ini homepage berisi:

* Welcome section
* 6 menu cards
* Sekilas Hari Ini
* Mata pelajaran hari ini
* Piket
* Tugas aktif
* berbagai informasi tambahan

Hasilnya terasa seperti **admin dashboard yang padat**.

Saya ingin mengubah homepage menjadi **modern class workspace / landing page**, terinspirasi dari struktur visual website Canva pada reference image.

### IMPORTANT

Jangan mengubah database, business logic, authentication, atau halaman internal.

Fokus utama task ini adalah:

**REDESIGN HOMEPAGE / DASHBOARD SAJA.**

---

# 1. Masalah Homepage Saat Ini

Homepage sekarang secara visual:

```text
Navbar

Welcome
↓
6 cards
↓
Sekilas Hari Ini
↓
Mata Pelajaran
↓
Piket
↓
Tugas
```

Terlalu banyak informasi ditampilkan pada satu halaman.

Homepage seharusnya bukan tempat untuk menampilkan semua detail.

Homepage harus menjadi:

> **pintu masuk menuju seluruh fitur Science2Hub.**

Detail tetap berada di halaman masing-masing.

---

# 2. New Homepage Structure

Ubah menjadi:

```text
NAVBAR
        ↓
HERO
        ↓
FEATURE / MENU GRID
        ↓
SMALL TODAY SUMMARY
        ↓
FOOTER
```

Jangan tampilkan seluruh detail tugas, piket, mata pelajaran, dan sebagainya di homepage.

---

# 3. Navbar

Pertahankan navbar existing karena sudah bagus secara struktur.

Current:

```text
9 SCP 2  Class Space

Home
Daily Info
Tugas
Piket
Pengumuman
Anggota
Kas Kelas
...
```

Pertahankan konsep tersebut.

Namun sedikit polish:

* sticky
* white / translucent
* backdrop blur
* subtle border
* rounded navigation container
* active state lebih jelas
* jangan membuat navbar terlalu tinggi

Tidak perlu membuat sidebar.

---

# 4. HERO — Jadikan Fokus Utama

Homepage harus dimulai dengan hero yang jauh lebih besar.

Current:

```text
9 SCP 2   SENIN

Selamat Datang di 9 SCP 2

Pusat informasi dan aktivitas kelas...
```

Ubah menjadi:

```text
9 SCP 2 • CLASS SPACE

Semua informasi kelas,
dalam satu tempat.

Jadwal, tugas, piket, pengumuman,
anggota, dan kas kelas.

[ Buka Daily Info ]
```

Hero harus terasa seperti landing page.

---

# 5. Hero Visual

Gunakan visual style yang terinspirasi reference Canva.

Background hero:

```text
purple
→ blue
→ cyan
```

Tetapi tetap sesuai dengan branding Science2Hub.

Contoh:

```css
background:
  linear-gradient(
    135deg,
    #7c3aed 0%,
    #4f46e5 45%,
    #06b6d4 100%
  );
```

Boleh dibuat lebih subtle agar tidak terlalu mencolok.

Hero harus memiliki:

* large typography
* centered content
* generous whitespace
* rounded container
* subtle decorative elements

---

# 6. Hero Typography

Desktop:

Main heading:

```text
font-size: clamp(48px, 6vw, 80px);
font-weight: 650–700;
line-height: 0.95–1.05;
letter-spacing: -0.04em;
```

Contoh visual:

```text
              Semua informasi kelas,
                  dalam satu tempat.
```

Jangan membuat heading terlalu panjang dalam satu baris.

Gunakan max-width sekitar:

```text
800–950px
```

agar wrapping terlihat intentional.

---

# 7. Hero CTA

Primary:

```text
Buka Daily Info →
```

Secondary:

```text
Lihat Kas Kelas
```

Primary button:

* white background
* dark text
* rounded 14–16px
* subtle shadow
* hover lift

Secondary:

* transparent / glass
* white border
* white text

Jangan membuat lebih dari 2 CTA.

---

# 8. Decorative Floating Cards

Untuk membuat homepage terasa seperti reference Canva, tambahkan beberapa floating UI cards.

Contoh:

```text
                         ┌──────────────┐
                         │ 📅           │
                         │ Daily Info   │
                         │ Hari ini     │
                         └──────────────┘


      ┌──────────────┐
      │ 📚 Tugas     │
      │ 3 aktif      │
      └──────────────┘


                           ┌──────────────┐
                           │ 💰 Kas Kelas │
                           │ Terupdate    │
                           └──────────────┘
```

Card harus mengambil data nyata jika memungkinkan.

Jangan membuat fake data.

Jika data tidak tersedia, gunakan dekorasi non-data seperti:

```text
📅
✦
9
SCP
2
```

Floating cards:

```text
border-radius: 20–24px
backdrop-filter: blur(...)
box-shadow: subtle
```

Boleh diberi sedikit rotation:

```text
-3deg
+2deg
```

Animation sangat subtle.

---

# 9. REMOVE THE CURRENT LARGE INFORMATION SECTION

Hapus dari homepage:

```text
Sekilas Hari Ini
```

beserta detail:

```text
Mata Pelajaran Hari Ini
Piket & Tugas Aktif
```

**Jangan hapus functionality atau data dari database.**

Hanya pindahkan detail tersebut dari homepage.

User tetap bisa melihatnya melalui:

```text
Daily Info
Piket
Tugas
```

Homepage tidak perlu menampilkan semuanya.

---

# 10. FEATURE SECTION

Setelah hero:

```text
Apa yang ingin kamu buka?
```

Subtitle:

```text
Semua kebutuhan kelas 9 SCP 2 ada di sini.
```

Kemudian tampilkan menu utama.

Jangan menggunakan 6 card identik seperti sekarang.

Gunakan **bento grid**.

---

# 11. Bento Grid

Target:

```text
┌───────────────────────────────┬──────────────────┐
│                               │                  │
│ 📅 Daily Info                 │ 📚 Tugas         │
│                               │                  │
│ Jadwal dan informasi hari ini │ Deadline & tugas │
│                               │                  │
├───────────────┬───────────────┴──────────────────┤
│ 🧹 Piket      │ 📢 Pengumuman                    │
│               │                                  │
├───────────────┼──────────────────┬───────────────┤
│ 👥 Anggota    │ 💰 Kas Kelas     │               │
│               │                  │               │
└───────────────┴──────────────────┴───────────────┘
```

Daily Info menjadi card terbesar karena merupakan fitur utama.

---

# 12. Card Style

Card jangan terasa seperti:

```text
icon
title
description
number
```

yang sekarang.

Buat lebih editorial.

Contoh:

```text
┌──────────────────────────────────────┐
│ 📅                             →     │
│                                      │
│ Daily Info                           │
│ Jadwal dan informasi hari ini.       │
│                                      │
└──────────────────────────────────────┘
```

Hover:

```text
translateY(-4px)
```

Arrow:

```text
→
```

bergerak sedikit ke kanan.

Transition:

```text
200–300ms
```

---

# 13. Card Hierarchy

Gunakan ukuran berbeda.

### Daily Info

Large:

```text
2 columns × 2 rows
```

### Tugas

Medium.

### Piket

Medium.

### Pengumuman

Medium.

### Anggota

Small.

### Kas Kelas

Large / medium.

Tujuannya supaya homepage tidak terlihat seperti:

```text
□ □ □
□ □ □
```

seperti sekarang.

---

# 14. Icons

Pertahankan icon system existing jika sudah konsisten.

Jangan mengganti semua icon dengan emoji jika project sekarang menggunakan icon library.

Prefer:

```text
Lucide / existing icon system
```

Emoji boleh digunakan hanya sebagai decorative element jika memang cocok.

---

# 15. Background

Current homepage menggunakan grid background.

Boleh dipertahankan secara sangat subtle, tetapi jangan membuatnya terlalu terlihat.

Alternative:

```text
#FAFAFA
```

dengan:

```text
radial-gradient
```

yang sangat subtle.

Hero boleh menjadi satu-satunya bagian yang memiliki gradient kuat.

---

# 16. Today Section — Jangan Hilangkan Sepenuhnya

Informasi "hari ini" masih berguna.

Tetapi ubah menjadi **small summary strip**, bukan section besar.

Contoh:

```text
Hari ini · Senin, 4 Oktober

4 pelajaran      3 tugas aktif      5 petugas piket
```

atau:

```text
┌─────────────────────────────────────────────────────┐
│ Senin, 4 Oktober                                    │
│                                                     │
│ 4 Pelajaran    3 Tugas Aktif    Piket Hari Ini →   │
└─────────────────────────────────────────────────────┘
```

Klik masing-masing → halaman detail.

Jangan menampilkan seluruh isi tugas/piket di sini.

---

# 17. Information Architecture

Homepage:

```text
Home
│
├── Hero
│
├── Feature Navigation
│   ├── Daily Info
│   ├── Tugas
│   ├── Piket
│   ├── Pengumuman
│   ├── Anggota
│   └── Kas Kelas
│
└── Today Summary
```

Detail:

```text
Daily Info
→ semua jadwal, mapel, absensi, catatan

Tugas
→ semua tugas dan deadline

Piket
→ jadwal piket lengkap

Pengumuman
→ semua announcement

Anggota
→ daftar siswa

Kas Kelas
→ detail pembayaran
```

---

# 18. Do NOT Change Existing Functionality

Tetap pertahankan:

* Supabase
* authentication
* session
* role
* database
* Daily Info
* Tugas
* Piket
* Pengumuman
* Anggota
* Kas Kelas
* CRUD
* permissions
* existing routes

Jangan membuat ulang database.

Jangan membuat dummy data.

Jangan menghapus component yang masih digunakan oleh halaman lain.

---

# 19. Responsive

Mobile harus menjadi prioritas.

Mobile:

```text
Navbar
↓
Hero
↓
CTA
↓
Feature cards
↓
Today summary
```

Hero typography sekitar:

```text
40–48px
```

Cards:

```text
1 column
```

atau 2-column untuk card kecil.

Pastikan tidak ada horizontal overflow.

---

# 20. Overall Feeling

Target akhirnya:

### Current

```text
Admin Dashboard
↓
Banyak informasi
↓
Banyak card
↓
Padat
```

### New

```text
Modern Class Workspace
↓
Hero besar
↓
Visual
↓
Simple navigation
↓
Bento cards
↓
Detail ada di halaman masing-masing
```

Reference feeling:

**Canva landing page**

bukan:

**Canva clone**

dan bukan:

**generic school admin dashboard.**

---

# 21. Final Requirement

Sebelum coding, inspect implementation homepage yang sekarang.

Jangan langsung rewrite.

Identifikasi:

* component homepage
* navbar
* card component
* data fetching
* route
* styling
* responsive behavior

Kemudian lakukan redesign dengan prinsip:

> **Preserve functionality, completely improve visual hierarchy.**

Homepage harus terasa jauh lebih lega dibanding versi sekarang.

Prioritas:

1. Reduce information density
2. Bigger hero
3. Strong visual hierarchy
4. Bento navigation
5. Better whitespace
6. Smooth animation
7. Responsive
8. Preserve all existing functionality

Jangan menambahkan fitur baru hanya demi memenuhi desain.
