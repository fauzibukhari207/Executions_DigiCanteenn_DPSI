# Test Execution Sheet

Document Version: v1.0

Project: DigiCanteen
Product: Aplikasi Pemesanan & Pembayaran Kantin Sekolah Berbasis Web

Status: Draft
Last Updated: 2026-07-11
Author: System Analyst AI

---

# 1. INSTRUCTIONS

1. Cetak atau buka file ini dalam mode editable.
2. Eksekusi test case secara berurutan sesuai tabel di bawah.
3. Pada kolom **Actual Result**, catat hasil aktual yang terjadi saat pengujian.
4. Pada kolom **Status**, isi **PASS** jika actual result sesuai expected, **FAIL** jika tidak sesuai, atau **N/A** jika tidak dapat diuji.
5. Pada kolom **Notes**, tulis keterangan tambahan (contoh: ID defect, link bug report).
6. Gunakan lembar ini sebagai bukti eksekusi pengujian.

---

# 2. FEATURE F001: REGISTRASI & LOGIN

## 2.1 UC-001: Registrasi & Login

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F001-001 | Registrasi Siswa Berhasil | 1. Buka `/register`<br>2. Isi nama, email, password, konfirmasi<br>3. Pilih peran "Siswa"<br>4. Klik "Daftar" | 1. Baris `profiles` baru role='siswa'<br>2. Redirect ke `/beranda` | | | |
| TC-F001-002 | Registrasi Penjual Berhasil | 1. Buka `/register`<br>2. Isi form, pilih peran "Penjual"<br>3. Klik "Daftar" | 1. Baris `profiles` baru role='penjual'<br>2. Redirect ke `/dashboard` | | | |
| TC-F001-003 | Login Berhasil | 1. Buka `/login`<br>2. Isi email & password valid<br>3. Klik "Masuk" | 1. `signInWithPassword` sukses<br>2. Redirect sesuai role | | | |
| TC-F001-004 | Login Gagal - Kredensial Salah | 1. Isi email valid, password salah<br>2. Klik "Masuk" | 1. Pesan error di bawah form<br>2. Tetap di `/login` | | | |
| TC-F001-005 | Registrasi - Email Sudah Terdaftar | 1. Isi form dengan email yang sudah ada<br>2. Klik "Daftar" | 1. Pesan error email sudah terdaftar | | | |
| TC-F001-006 | Akses Halaman Terproteksi Tanpa Login | 1. Buka URL `/beranda` tanpa login | 1. Redirect otomatis ke `/login` | | | |

---

# 3. FEATURE F002: JELAJAH & DETAIL MENU

## 3.1 UC-002: Jelajah, Keranjang & Checkout

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F002-001 | Menampilkan Daftar Menu | 1. Buka `/menu` | 1. Grid `MenuCard` tampil dari `menu_items` | | | |
| TC-F002-002 | Filter Kategori & Diet | 1. Buka `/menu`<br>2. Pilih chip kategori "Snacks"<br>3. Aktifkan filter diet "Healthy" | 1. Hasil hanya menu snacks + badge healthy-choice | | | |
| TC-F002-003 | Pencarian Menu | 1. Buka `/menu`<br>2. Ketik "nasi" di kolom pencarian | 1. Hasil menu mengandung kata "nasi" | | | |
| TC-F002-004 | Melihat Detail Menu & Rating Rata-rata | 1. Klik sebuah menu dari `/menu` | 1. Detail lengkap tampil<br>2. Rating rata-rata akurat | | | |

---

# 4. FEATURE F003: KERANJANG & CHECKOUT

## 4.1 UC-002: Jelajah, Keranjang & Checkout

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F003-001 | Tambah Item ke Keranjang dengan Kustomisasi | 1. Buka `/menu/[id]`<br>2. Pilih opsi kustom, set kuantitas 2<br>3. Klik "Tambah ke Keranjang" | 1. Baris tersimpan di keranjang<br>2. Badge header bertambah 2 | | | |
| TC-F003-002 | Ubah Kuantitas Item di Keranjang | 1. Buka `/keranjang`<br>2. Klik `+`/`-` pada item | 1. Total ter-update real-time<br>2. Kuantitas 0 menghapus baris | | | |
| TC-F003-003 | Hapus Item dari Keranjang | 1. Buka `/keranjang`<br>2. Klik tombol hapus | 1. Baris hilang, total ter-update | | | |
| TC-F003-004 | Keranjang Bertahan Setelah Refresh | 1. Tambah item<br>2. Refresh browser<br>3. Buka `/keranjang` | 1. Item sama masih tampil | | | |
| TC-F003-005 | Pilih Slot Waktu Pengambilan | 1. Buka `/checkout`<br>2. Pilih salah satu slot waktu | 1. Slot terpilih tersorot | | | |

---

# 5. FEATURE F004: PEMBAYARAN QRIS/SALDO

## 5.1 UC-002: Jelajah, Keranjang & Checkout

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F004-001 | Checkout & Bayar dengan QRIS (Mode Sandbox) | 1. Checkout, pilih QRIS<br>2. Klik "Buat Pesanan & Bayar"<br>3. Tunggu ±8 detik | 1. QR tampil, status auto `PAID`<br>2. Status pesanan `menunggu-konfirmasi`, stok berkurang | | | |
| TC-F004-002 | Checkout & Bayar dengan Saldo (Cukup) | 1. Checkout, pilih Saldo<br>2. Klik "Buat Pesanan & Bayar" | 1. Status pesanan `menunggu-konfirmasi`<br>2. `wallet_balance` berkurang | | | |
| TC-F004-003 | Checkout dengan Saldo Tidak Cukup | 1. Checkout, pilih Saldo dengan saldo kurang | 1. Tombol bayar dinonaktifkan/peringatan | | | |
| TC-F004-004 | Simulasi Pembayaran QRIS Berhasil | 1. Checkout QRIS (Xendit asli)<br>2. Klik "Simulasikan Pembayaran Berhasil" | 1. `handlePaymentSuccess` langsung terpanggil | | | |
| TC-F004-005 | Konfirmasi Pembayaran Ganda (Idempoten) | 1. Panggil `confirm-payment` dua kali untuk order sama | 1. Response kedua `alreadyConfirmed: true`<br>2. Stok tidak berkurang dua kali | | | |

---

# 6. FEATURE F005: GROUP ORDER

## 6.1 UC-003: Group Order

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F005-001 | Membuat Group Order | 1. Klik "Buat Group Order"<br>2. Klik "Buat Sekarang" | 1. Kode 6 karakter unik & link tercipta | | | |
| TC-F005-002 | Bergabung ke Group Order dengan Kode Valid | 1. Buka link/kode join<br>2. Klik "Gabung" | 1. `member_ids` bertambah, redirect ke halaman grup | | | |
| TC-F005-003 | Bergabung dengan Kode Tidak Valid | 1. Masukkan kode `ZZZZZZ`, submit | 1. Pesan "Kode tidak ditemukan" | | | |
| TC-F005-004 | Checkout Bareng Group Order | 1. Buka halaman grup<br>2. Klik "Checkout Bareng" | 1. Redirect ke `/checkout` dengan `groupOrderId` | | | |
| TC-F005-005 | Bergabung ke Grup yang Sudah Terkunci | 1. Masukkan kode grup terkunci, klik "Gabung" | 1. Tidak ditambahkan, pesan grup tertutup | | | |

---

# 7. FEATURE F006: CHECK-IN/CHECK-OUT MEJA & POIN

## 7.1 UC-004: Check-in/Check-out Meja & Poin

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F006-001 | Check-in Meja | 1. Buka `/meja/checkin`<br>2. Isi nomor meja, klik "Check-in" | 1. Sesi baru tercatat<br>2. Redirect ke `/meja/checkout`, timer berjalan di halaman tersebut | | | |
| TC-F006-002 | Check-out Tepat Waktu (Dapat Poin) | 1. Check-out dalam ≤15 menit | 1. `points_earned=10`, poin siswa bertambah<br>2. Status pesanan `selesai-disajikan` | | | |
| TC-F006-003 | Check-out Melebihi Batas Waktu (Tanpa Poin) | 1. Check-out setelah >15 menit | 1. `points_earned=0`, tanpa tambahan poin | | | |
| TC-F006-004 | Check-out Dipanggil Dua Kali | 1. Check-out ulang untuk sesi yang sudah selesai | 1. Data dikembalikan tanpa hitung ulang poin | | | |

---

# 8. FEATURE F007: POIN & VOUCHER

## 8.1 UC-004: Check-in/Check-out Meja & Poin

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F007-001 | Tukar Poin Menjadi Voucher Berhasil | 1. Buka `/poin` (poin ≥100)<br>2. Klik "Tukar 100 Poin" | 1. Voucher Rp5.000 tercipta<br>2. Poin berkurang 100 | | | |
| TC-F007-002 | Tukar Poin Gagal - Poin Tidak Cukup | 1. Buka `/poin` (poin <100)<br>2. Klik "Tukar 100 Poin" | 1. Pesan poin belum cukup, tidak ada perubahan data | | | |
| TC-F007-003 | Melihat Riwayat Poin | 1. Buka `/poin` | 1. Riwayat poin tampil terurut terbaru | | | |

---

# 9. FEATURE F008: RATING MAKANAN

## 9.1 UC-005: Rating Makanan & Riwayat Pesanan

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F008-001 | Memberi Rating untuk Pesanan Selesai | 1. Buka `/rating/[orderId]`<br>2. Pilih bintang & komentar<br>3. Klik "Kirim" | 1. Rating tersimpan, tombol "Beri Rating" hilang | | | |
| TC-F008-002 | Mengirim Ulang Rating (Menimpa) | 1. Kirim rating baru untuk kombinasi yang sama | 1. Rating lama ditimpa, tidak duplikat | | | |
| TC-F008-003 | Rating Tidak Tersedia untuk Pesanan Belum Selesai | 1. Buka `/pesanan`, cek pesanan berstatus `diproses` | 1. Tombol "Beri Rating" tidak muncul | | | |
| TC-F008-004 | Rating untuk Menu yang Sudah Dihapus Penjual | 1. Buka halaman rating dengan menu terhapus | 1. Tidak menghalangi penyelesaian rating | | | |

---

# 10. FEATURE F009: RIWAYAT PESANAN

## 10.1 UC-005: Rating Makanan & Riwayat Pesanan

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F009-001 | Melihat Riwayat Pesanan | 1. Buka `/pesanan` | 1. Daftar pesanan terurut terbaru dengan status | | | |
| TC-F009-002 | Tombol Beri Rating Muncul Otomatis | 1. Bandingkan pesanan sudah/belum dirating | 1. Tombol hanya muncul di pesanan belum dirating | | | |

---

# 11. FEATURE F010: DASHBOARD PENJUAL

## 11.1 UC-006: Kelola Menu, Pesanan Masuk & Ulasan

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F010-001 | Menampilkan KPI Dashboard | 1. Login penjual → `/dashboard` | 1. KPI pendapatan, pesanan, menu habis akurat | | | |
| TC-F010-002 | Grafik Pendapatan 7 Hari & 6 Bulan | 1. Buka `/dashboard`, amati grafik | 1. Pesanan belum bayar/dibatalkan tidak dihitung | | | |

---

# 12. FEATURE F011: KELOLA MENU PENJUAL

## 12.1 UC-006: Kelola Menu, Pesanan Masuk & Ulasan

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F011-001 | Tambah Menu Baru Berhasil | 1. Buka `/kelola-menu/baru`<br>2. Isi form + upload foto<br>3. Klik "Simpan" | 1. Menu baru tercipta dengan foto | | | |
| TC-F011-002 | Edit Menu Existing | 1. Buka halaman edit menu<br>2. Ubah harga<br>3. Klik "Simpan" | 1. Harga ter-update di semua tempat | | | |
| TC-F011-003 | Tandai Menu Habis/Ada | 1. Klik "Tandai Habis" | 1. `is_available=false`, tampil "Habis" di sisi siswa | | | |
| TC-F011-004 | Hapus Menu | 1. Klik "Hapus", konfirmasi | 1. Menu terhapus dari katalog | | | |
| TC-F011-005 | Upload Foto Menu Gagal - Bucket Belum Dibuat | 1. Upload foto sebelum bucket dibuat | 1. Pesan error jelas, bukan gagal diam-diam | | | |

---

# 13. FEATURE F012: PESANAN MASUK PENJUAL

## 13.1 UC-006: Kelola Menu, Pesanan Masuk & Ulasan

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F012-001 | Terima Pesanan Masuk | 1. Buka `/pesanan-masuk`<br>2. Klik "Terima Pesanan" | 1. Status berubah `diproses` | | | |
| TC-F012-002 | Tolak Pesanan Masuk | 1. Klik "Tolak" | 1. Status berubah `dibatalkan` | | | |
| TC-F012-003 | Tandai Pesanan Siap Diambil | 1. Klik "Tandai Siap Diambil" | 1. Status berubah `siap-diambil` | | | |
| TC-F012-004 | Filter Status Pesanan Masuk | 1. Pilih filter "Selesai" | 1. Hanya pesanan `selesai-disajikan` tampil | | | |

---

# 14. FEATURE F013: ULASAN PENJUAL

## 14.1 UC-006: Kelola Menu, Pesanan Masuk & Ulasan

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F013-001 | Melihat Seluruh Ulasan Toko | 1. Buka `/ulasan` | 1. Rating & komentar seluruh menu tampil | | | |
| TC-F013-002 | Filter Ulasan per Menu | 1. Pilih filter menu tertentu | 1. Hanya rating menu tersebut tampil | | | |

---

# 15. FEATURE F014: NOTIFIKASI & REALTIME SYNC

## 15.1 Lintas Use Case

| TC ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TC-F014-001 | Notifikasi Realtime untuk Penjual | 1. Siswa checkout di sesi lain<br>2. Amati NotificationBell penjual | 1. Notifikasi muncul tanpa refresh manual | | | |
| TC-F014-002 | Sinkronisasi Otomatis Tanpa Refresh Manual | 1. Ubah status pesanan di sesi lain (Realtime belum aktif)<br>2. Amati halaman Pesanan Masuk | 1. Tidak error, perlu refresh manual | | | |

---

# 16. EXECUTION SUMMARY

| Feature | Total TC | PASS | FAIL | N/A | Pass Rate |
| --- | --- | --- | --- | --- | --- |
| F001: Registrasi & Login | 6 | | | | |
| F002: Jelajah & Detail Menu | 4 | | | | |
| F003: Keranjang & Checkout | 5 | | | | |
| F004: Pembayaran QRIS/Saldo | 5 | | | | |
| F005: Group Order | 5 | | | | |
| F006: Check-in/Check-out Meja & Poin | 4 | | | | |
| F007: Poin & Voucher | 3 | | | | |
| F008: Rating Makanan | 4 | | | | |
| F009: Riwayat Pesanan | 2 | | | | |
| F010: Dashboard Penjual | 2 | | | | |
| F011: Kelola Menu Penjual | 5 | | | | |
| F012: Pesanan Masuk Penjual | 4 | | | | |
| F013: Ulasan Penjual | 2 | | | | |
| F014: Notifikasi & Realtime Sync | 2 | | | | |
| **Total** | **53** | | | | |

**Tester Name:** ____________________

**Execution Date:** ____________________

**Signature:** ____________________

---

# 17. REVISION HISTORY

| Version | Date | Author | Description |
| --- | --- | --- | --- |
| 1.0 | 2026-07-11 | System Analyst AI | Initial as-built draft, diturunkan dari `test_cases.md` v1.0 |
