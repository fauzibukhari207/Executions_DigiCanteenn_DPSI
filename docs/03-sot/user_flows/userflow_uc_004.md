# User Flow Specification

Document Version: v1.0

Use Case ID: UC-004
Use Case Name: Check-in/Check-out Meja & Poin

Status: As-Built
Last Updated: 2026-07-11
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Setelah pesanan siap diambil, siswa check-in di meja (mencatat waktu mulai), lalu check-out setelah selesai makan. Jika check-out dilakukan dalam ≤15 menit, siswa mendapat 10 poin. Poin dapat ditukar menjadi voucher diskon Rp5.000 per 100 poin.

## 1.2 Goal

Siswa ingin mengambil dan menikmati pesanannya di meja kantin dengan proses tercatat, sekaligus mendapat insentif untuk tidak berlama-lama menempati meja saat jam istirahat sibuk.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F006|Check-in/Check-out Meja & Poin|
|F007|Poin & Voucher|

## 1.4 Primary Actor

Siswa

## 1.5 Supporting Actors

Sistem (timer, kalkulasi poin)

---

# 2. TRIGGER

Pesanan siswa berstatus `siap-diambil`, atau siswa membuka `/meja/checkin` secara langsung.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Siswa memiliki pesanan berstatus `siap-diambil`|
|PRE-002|Siswa belum melakukan check-in untuk pesanan tersebut|

---

# 4. MAIN FLOW

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa membuka `/meja/checkin` (dari notifikasi atau halaman checkout/riwayat)|Sistem menampilkan form input nomor meja|
|2|Siswa memasukkan nomor meja, klik "Check-in"|`createCheckIn(orderId, studentId, tableNumber)` INSERT `table_checkins` dengan `check_in_at = now()`|
|3||Sistem redirect ke `/meja/checkout?checkinId=...`, **halaman check-out inilah yang menampilkan timer berjalan** (bukan halaman check-in itu sendiri) — angka menit:detik ter-update tiap detik dan berubah warna (merah) begitu melewati 15 menit|
|4|Siswa selesai makan, membuka `/meja/checkout`, klik "Check-out"|`completeCheckIn(id)` menghitung `elapsedMinutes`|
|5||Jika `elapsedMinutes <= 15`: `isOnTime = true`, `pointsEarned = 10`. Jika tidak: `isOnTime = false`, `pointsEarned = 0`|
|6||Sistem UPDATE `table_checkins` (check_out_at, is_on_time, points_earned) dan menandai `orders.status = 'selesai-disajikan'`|
|7||Jika `pointsEarned > 0`: sistem menambah `profiles.points` siswa (`addPoints`)|
|8||Sistem menampilkan halaman sukses check-out dengan tombol langsung ke halaman Beri Rating|

---

# 4B. MAIN FLOW (Poin & Voucher)

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa membuka `/poin`|Sistem menampilkan saldo poin saat ini, riwayat (`getPointHistory`), dan daftar voucher (`getVouchers`)|
|2|Siswa klik "Tukar 100 Poin → Voucher"|`redeemVoucher(studentId, currentPoints)` — jika poin cukup, INSERT `vouchers` + INSERT `point_history` (nilai negatif)|
|3||Sistem mengurangi `profiles.points` siswa sebesar 100 dan menampilkan voucher baru di daftar|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Check-out Melebihi Batas Waktu

### Condition

Siswa check-out lebih dari 15 menit sejak check-in.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa klik "Check-out"|Sistem menghitung `elapsedMinutes > 15`|
|2||Sistem tetap menutup sesi (`checkOutAt` terisi) tapi `pointsEarned = 0`, tanpa poin ditambahkan|

---

# 6. EXCEPTION FLOWS

## EF-001: Check-out Dipanggil Dua Kali

### Condition

`completeCheckIn(id)` dipanggil untuk sesi yang sudah memiliki `checkOutAt`.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Sistem mendeteksi `existing.checkOutAt` sudah terisi|Sistem mengembalikan data sesi apa adanya tanpa menghitung ulang poin (mencegah poin ganda)|

---

## EF-002: Poin Tidak Cukup untuk Voucher

### Condition

`currentPoints < POINTS_TO_VOUCHER_RATIO` (100).

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa klik "Tukar Poin"|`redeemVoucher` mengembalikan `null`|
|2||Sistem menampilkan pesan poin belum cukup, tombol tetap nonaktif hingga poin cukup|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Sesi `table_checkins` tercatat lengkap (check-in & check-out)|
|POST-002|`orders.status` berubah menjadi `selesai-disajikan` setelah check-out|
|POST-003|`profiles.points` bertambah jika check-out tepat waktu|
|POST-004|Voucher baru tercipta dan poin berkurang setelah penukaran|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-001|Batas waktu tepat waktu: 15 menit (`CHECKOUT_TIME_LIMIT_MINUTES`)|
|BR-002|Poin per check-out tepat waktu: 10 (`POINTS_PER_ON_TIME_CHECKOUT`)|
|BR-003|Rasio tukar: 100 poin = 1 voucher (`POINTS_TO_VOUCHER_RATIO`)|
|BR-004|Nilai voucher: Rp5.000 (`VOUCHER_DISCOUNT_AMOUNT`)|
|BR-005|Check-out yang sudah pernah dilakukan tidak dapat dihitung ulang poinnya|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-012|Check-in Meja|
|PAGE-013|Check-out Meja|
|PAGE-016|Poin & Voucher|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|table_checkins|Cek sesi aktif sebelum check-out|
|profiles|Saldo poin siswa saat ini|

## 10.2 Data Created

|Entity|Description|
|---|---|
|table_checkins|Sesi baru saat check-in|
|point_history|Entri mutasi poin (didapat atau ditukar)|
|vouchers|Voucher baru hasil penukaran|

## 10.3 Data Updated

|Entity|Description|
|---|---|
|table_checkins|check_out_at, is_on_time, points_earned|
|orders.status|→ `selesai-disajikan`|
|profiles.points|Bertambah/berkurang|

## 10.4 Data Deleted

|Entity|Description|
|---|---|
|None|Tidak ada penghapusan data pada alur ini|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|Siswa|AKSI (ALLOWED)|
|Penjual|DITOLAK — bukan bagian alur penjual|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Siswa dapat check-in dengan mencatat nomor meja, lalu diarahkan ke halaman check-out yang menampilkan timer berjalan real-time|
|AC-002|Siswa dapat check-out dan mendapat poin jika ≤15 menit|
|AC-003|Pesanan otomatis berstatus "Selesai Disajikan" setelah check-out|
|AC-004|Siswa dapat menukar 100 poin menjadi voucher Rp5.000|
|AC-005|Penukaran ditolak dengan pesan jelas jika poin belum cukup|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F006|
|F007|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-012|
|PAGE-013|
|PAGE-016|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|1.0|2026-07-11|System Analyst AI|Initial as-built draft|
