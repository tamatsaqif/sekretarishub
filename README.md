# Web Kelas 9 SCP 2

Sistem informasi dan manajemen kelas 9 SCP 2: Daily Class Info (Sekretaris) & Kas Kelas (Bendahara).

## Struktur Folder & File

```
├── home.html                # Portal Dashboard utama kelas
├── index.html               # Halaman Sekretaris (Daily Class Info, Tugas, Piket, Absensi)
├── kas-kelas.html           # Halaman Kas Kelas (Ringkasan Kas & Status Iuran Siswa)
├── styles.css               # Desain UI/UX utama
├── app.js                   # Logika frontend Sekretaris
├── kas-app.js               # Logika frontend Kas Kelas
├── kas.js                   # API Supabase untuk Kas Kelas
├── supabase.js              # API Supabase untuk Sekretaris
├── router.js                # Client router
├── build.js                 # Script build environment deploy Vercel
├── database/                # Skrip SQL Supabase & Snapshot Data
│   ├── supabase-setup.sql   # Skema tabel Sekretaris (absensi, tugas, piket)
│   ├── supabase-kas.sql     # Skema tabel Kas Kelas
│   └── insert-kas-snapshot.sql # Data snapshot pembayaran 33 siswa
├── docs/                    # Panduan & Dokumentasi
│   ├── KAS-KELAS-SETUP.md   # Panduan setup Supabase Kas Kelas
│   └── KAS-KELAS-README.md  # Dokumentasi fitur Kas Kelas
└── archive/                 # Arsip eksperimen (React template dll.)
```

## Fitur Utama

1. **Dashboard Portal**: Akses cepat ke halaman Sekretaris dan Kas Kelas beserta ringkasan realtime.
2. **Daily Class Info**: Jadwal harian, tugas, piket harian, absensi 33 siswa, dan export WhatsApp.
3. **Kas Kelas**: Ringkasan saldo kas, daftar status iuran 33 siswa dengan filter instan (Semua/Lunas/Tunggakan), detail riwayat pembayaran per bulan, dan pencatatan oleh Bendahara.
