# Sekretaris 9 SCP 2

Website sederhana untuk membantu sekretaris kelas mengelola jadwal harian, tugas, piket, absensi, dan menyiapkan Daily Class Info yang siap dibagikan ke WhatsApp.

## Fitur utama

- Dashboard hari ini
- Jadwal kelas per hari
- Piket harian
- Daftar tugas dengan tambah, edit, dan hapus
- Absensi 33 siswa dengan status Masuk, Sakit, Izin, dan Alpha
- Catatan harian
- Preview Daily Class Info siap copy/share
- Dukungan tombol WhatsApp dan bagikan

## Cara menjalankan

1. Masuk ke folder project
2. Jalankan server lokal

```bash
python -m http.server 8000
```

3. Buka browser ke:

```text
http://localhost:8000
```

Data tersimpan di browser melalui `localStorage` sehingga tetap tersedia saat membuka halaman yang sama.
