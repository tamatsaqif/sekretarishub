-- ============================================================
-- INSERT SNAPSHOT DATA KAS KELAS — 9 SCP 2
-- Data snapshot pembayaran kas siswa (Total Target s/d Sept W4 = 10 Minggu = Rp 50.000)
-- Total Saldo Kas Fisik: Rp 840.000
-- ============================================================

-- 1. Pastikan data minggu kas (kas_weeks) sudah ada
INSERT INTO kas_weeks (month, week_number, start_date, end_date, amount)
VALUES
  ('Juli 2026', 3, '2026-07-13', '2026-07-19', 5000),
  ('Juli 2026', 4, '2026-07-20', '2026-07-26', 5000),
  ('Agustus 2026', 1, '2026-08-03', '2026-08-09', 5000),
  ('Agustus 2026', 2, '2026-08-10', '2026-08-16', 5000),
  ('Agustus 2026', 3, '2026-08-17', '2026-08-23', 5000),
  ('Agustus 2026', 4, '2026-08-24', '2026-08-30', 5000),
  ('September 2026', 1, '2026-08-31', '2026-09-06', 5000),
  ('September 2026', 2, '2026-09-07', '2026-09-13', 5000),
  ('September 2026', 3, '2026-09-14', '2026-09-20', 5000),
  ('September 2026', 4, '2026-09-21', '2026-09-27', 5000),
  ('Oktober 2026', 1, '2026-09-28', '2026-10-04', 5000),
  ('Oktober 2026', 2, '2026-10-05', '2026-10-11', 5000),
  ('Oktober 2026', 3, '2026-10-12', '2026-10-18', 5000),
  ('Oktober 2026', 4, '2026-10-19', '2026-10-25', 5000)
ON CONFLICT (month, week_number) DO NOTHING;

-- 2. CTE Helper untuk ID Siswa
WITH students_cte AS (
    SELECT id, name FROM students
)

-- 3. INSERT PEMBAYARAN KAS PER SISWA (Total 33 Siswa)

-- 1. Adzkiya (Tunggakan 5K -> Bayar 9 minggu: Jul W3-4, Agu W1-4, Sep W1-3 = Rp 45.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3))
) w WHERE s.name = 'ADZKIYA SAFWA ANAKA' ON CONFLICT DO NOTHING;

-- 2. Aliya (Tunggakan 10K -> Bayar 8 minggu: Jul W3-4, Agu W1-4, Sep W1-2 = Rp 40.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2))
) w WHERE s.name = 'ALIYAH NUR LATHIFAH' ON CONFLICT DO NOTHING;

-- 3. Althaf (Tunggakan 50K -> Belum bayar = Rp 0)

-- 4. Andi (Tunggakan 50K -> Belum bayar = Rp 0)

-- 5. Ashfa (Tunggakan 25K -> Bayar 5 minggu: Jul W3-4, Agu W1-3 = Rp 25.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3))
) w WHERE s.name = 'ASHFA HADZIQ H' ON CONFLICT DO NOTHING;

-- 6. Asyifa (Tunggakan 10K -> Bayar 8 minggu: Jul W3-4, Agu W1-4, Sep W1-2 = Rp 40.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2))
) w WHERE s.name = 'ASYIFA NAISILA JELITA' ON CONFLICT DO NOTHING;

-- 7. Bethari (Lunas s/d September W4 -> Bayar 10 minggu: Jul W3-4, Agu W1-4, Sep W1-4 = Rp 50.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3, 4))
) w WHERE s.name = 'BETHARI JANITRA IW' ON CONFLICT DO NOTHING;

-- 8. Billie (Tunggakan 50K -> Belum bayar = Rp 0)

-- 9. Daffa Ridho (Tunggakan 50K -> Belum bayar = Rp 0)

-- 10. Delisa (Lunas -> Bayar 10 minggu: Jul W3-4, Agu W1-4, Sep W1-4 = Rp 50.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3, 4))
) w WHERE s.name = 'DELISA ASZAHRA P' ON CONFLICT DO NOTHING;

-- 11. Dhafin (Lunas s/d Oktober W2 -> Bayar 12 minggu: Jul W3-4, Agu W1-4, Sep W1-4, Okt W1-2 = Rp 60.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'Oktober 2026' AND week_number IN (1, 2))
) w WHERE s.name = 'DHAFIN DZIMAR' ON CONFLICT DO NOTHING;

-- 12. Dimas (Tunggakan 50K -> Belum bayar = Rp 0)

-- 13. Dira (Tunggakan 5K -> Bayar 9 minggu: Jul W3-4, Agu W1-4, Sep W1-3 = Rp 45.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3))
) w WHERE s.name = 'DIRA SHASMIRA RIANTI' ON CONFLICT DO NOTHING;

-- 14. Eddlyn (Tunggakan 50K -> Belum bayar = Rp 0)

-- 15. Fadipta (Tunggakan 5K -> Bayar 9 minggu: Jul W3-4, Agu W1-4, Sep W1-3 = Rp 45.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3))
) w WHERE s.name = 'FADIPTA JAVAS A' ON CONFLICT DO NOTHING;

-- 16. Kei Ezhar (Tunggakan 50K -> Belum bayar = Rp 0)

-- 17. Kenzo (Tunggakan 10K -> Bayar 8 minggu: Jul W3-4, Agu W1-4, Sep W1-2 = Rp 40.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2))
) w WHERE s.name = 'KENZO JABBAR LEBCCA' ON CONFLICT DO NOTHING;

-- 18. Malvino (Tunggakan 10K -> Bayar 8 minggu: Jul W3-4, Agu W1-4, Sep W1-2 = Rp 40.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2))
) w WHERE s.name = 'MALVINO APRILIO PI' ON CONFLICT DO NOTHING;

-- 19. Maritza (Tunggakan 10K -> Bayar 8 minggu: Jul W3-4, Agu W1-4, Sep W1-2 = Rp 40.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2))
) w WHERE s.name = 'MARITZA ADILIA S' ON CONFLICT DO NOTHING;

-- 20. Daffa R.P (Tunggakan 50K -> Belum bayar = Rp 0)

-- 21. Nabil (Tunggakan 25K -> Bayar 5 minggu: Jul W3-4, Agu W1-3 = Rp 25.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3))
) w WHERE s.name = 'MOCH NABIL DAVIAN N' ON CONFLICT DO NOTHING;

-- 22. Ghaisan (Tunggakan 50K -> Belum bayar = Rp 0)

-- 23. Rafa (Tunggakan 50K -> Belum bayar = Rp 0)

-- 24. Rafi (Tunggakan 35K -> Bayar 3 minggu: Jul W3-4, Agu W1 = Rp 15.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1))
) w WHERE s.name = 'MUH RAFI SYAHPUTRA A' ON CONFLICT DO NOTHING;

-- 25. Naura (Tunggakan 10K -> Bayar 8 minggu: Jul W3-4, Agu W1-4, Sep W1-2 = Rp 40.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2))
) w WHERE s.name = 'NAURA KARENZA A Z' ON CONFLICT DO NOTHING;

-- 26. Nayottama (Tunggakan 50K -> Belum bayar = Rp 0)

-- 27. Sabrina (Lunas -> Bayar 10 minggu: Jul W3-4, Agu W1-4, Sep W1-4 = Rp 50.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3, 4))
) w WHERE s.name = 'SABRINA VIDI ARETHA' ON CONFLICT DO NOTHING;

-- 28. Velika (Tunggakan 15K -> Bayar 7 minggu: Jul W3-4, Agu W1-4, Sep W1 = Rp 35.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1))
) w WHERE s.name = 'VELIKA JASMIN CK' ON CONFLICT DO NOTHING;

-- 29. Vinno (Tunggakan 50K -> Belum bayar = Rp 0)

-- 30. Widyatamaka (Tunggakan 5K -> Bayar 9 minggu: Jul W3-4, Agu W1-4, Sep W1-3 = Rp 45.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3))
) w WHERE s.name = 'WIDYATAMAKA ZAYYAN' ON CONFLICT DO NOTHING;

-- 31. Yudhistira (Tunggakan 50K -> Belum bayar = Rp 0)

-- 32. Zahra (Lunas s/d Oktober W1 -> Bayar 11 minggu: Jul W3-4, Agu W1-4, Sep W1-4, Okt W1 = Rp 55.000)
INSERT INTO kas_payments (student_id, week_id, amount, paid_at, recorded_by)
SELECT s.id, w.id, 5000, '2026-09-21', 'initial_snapshot'
FROM students_cte s
CROSS JOIN (
    SELECT id FROM kas_weeks WHERE (month = 'Juli 2026' AND week_number IN (3, 4))
    OR (month = 'Agustus 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'September 2026' AND week_number IN (1, 2, 3, 4))
    OR (month = 'Oktober 2026' AND week_number IN (1))
) w WHERE s.name = 'ZAHRA LAILIA R' ON CONFLICT DO NOTHING;

-- 33. Zuhal (Tunggakan 50K -> Belum bayar = Rp 0)

-- Verifikasi data:
-- SELECT
--   COUNT(DISTINCT student_id) as total_siswa_bayar,
--   SUM(amount) as total_pembayaran_terkumpul
-- FROM kas_payments;
