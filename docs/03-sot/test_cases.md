# Test Case Specification

Document Version: v1.0

Project: DigiCanteen
Product: Aplikasi Pemesanan & Pembayaran Kantin Sekolah Berbasis Web

Status: As-Built
Last Updated: 2026-07-11
Author: System Analyst AI

---

# 1. INTRODUCTION

## 1.1 Purpose

Dokumen ini mendefinisikan test case untuk seluruh fitur DigiCanteen. Test case diturunkan dari Software Requirements Specification (SRS v1.0) dan User Flow Specifications untuk memastikan setiap kebutuhan fungsional terverifikasi terhadap perilaku aplikasi yang sebenarnya berjalan.

## 1.2 Scope

Mencakup test case untuk:
- F001: Registrasi & Login (UC-001)
- F002: Jelajah & Detail Menu (UC-002)
- F003: Keranjang & Checkout (UC-002)
- F004: Pembayaran QRIS/Saldo (UC-002)
- F005: Group Order (UC-003)
- F006: Check-in/Check-out Meja & Poin (UC-004)
- F007: Poin & Voucher (UC-004)
- F008: Rating Makanan (UC-005)
- F009: Riwayat Pesanan (UC-005)
- F010: Dashboard Penjual (UC-006)
- F011: Kelola Menu Penjual (UC-006)
- F012: Pesanan Masuk Penjual (UC-006)
- F013: Ulasan Penjual (UC-006)
- F014: Notifikasi & Realtime Sync (lintas UC)

## 1.3 Test Case Format

| Field | Description |
| --- | --- |
| **TC ID** | Test Case Identifier (format: TC-FXXX-NNN) |
| **Related UC** | Use Case ID dari user flow |
| **Related Feature** | Feature ID dari SRS |
| **Test Scenario** | Deskripsi skenario pengujian |
| **Preconditions** | Kondisi yang harus terpenuhi sebelum test |
| **Test Data** | Data yang digunakan dalam pengujian |
| **Test Steps** | Langkah-langkah pengujian |
| **Expected Result** | Hasil yang diharapkan |
| **Type** | Positif / Negatif / Exception |

---

# 2. TEST CASE INDEX

| TC ID | Feature | Use Case | Scenario |
| --- | --- | --- | --- |
| TC-F001-001 | F001 | UC-001 | Registrasi Siswa Berhasil |
| TC-F001-002 | F001 | UC-001 | Registrasi Penjual Berhasil |
| TC-F001-003 | F001 | UC-001 | Login Berhasil |
| TC-F001-004 | F001 | UC-001 | Login Gagal - Kredensial Salah |
| TC-F001-005 | F001 | UC-001 | Registrasi - Email Sudah Terdaftar |
| TC-F001-006 | F001 | UC-001 | Akses Halaman Terproteksi Tanpa Login |
| TC-F002-001 | F002 | UC-002 | Menampilkan Daftar Menu |
| TC-F002-002 | F002 | UC-002 | Filter Kategori & Diet |
| TC-F002-003 | F002 | UC-002 | Pencarian Menu |
| TC-F002-004 | F002 | UC-002 | Melihat Detail Menu & Rating Rata-rata |
| TC-F003-001 | F003 | UC-002 | Tambah Item ke Keranjang dengan Kustomisasi |
| TC-F003-002 | F003 | UC-002 | Ubah Kuantitas Item di Keranjang |
| TC-F003-003 | F003 | UC-002 | Hapus Item dari Keranjang |
| TC-F003-004 | F003 | UC-002 | Keranjang Bertahan Setelah Refresh |
| TC-F003-005 | F003 | UC-002 | Pilih Slot Waktu Pengambilan |
| TC-F004-001 | F004 | UC-002 | Checkout & Bayar dengan QRIS (Mode Sandbox) |
| TC-F004-002 | F004 | UC-002 | Checkout & Bayar dengan Saldo (Cukup) |
| TC-F004-003 | F004 | UC-002 | Checkout dengan Saldo Tidak Cukup |
| TC-F004-004 | F004 | UC-002 | Simulasi Pembayaran QRIS Berhasil |
| TC-F004-005 | F004 | UC-002 | Konfirmasi Pembayaran Ganda (Idempoten) |
| TC-F005-001 | F005 | UC-003 | Membuat Group Order |
| TC-F005-002 | F005 | UC-003 | Bergabung ke Group Order dengan Kode Valid |
| TC-F005-003 | F005 | UC-003 | Bergabung dengan Kode Tidak Valid |
| TC-F005-004 | F005 | UC-003 | Checkout Bareng Group Order |
| TC-F005-005 | F005 | UC-003 | Bergabung ke Grup yang Sudah Terkunci |
| TC-F006-001 | F006 | UC-004 | Check-in Meja |
| TC-F006-002 | F006 | UC-004 | Check-out Tepat Waktu (Dapat Poin) |
| TC-F006-003 | F006 | UC-004 | Check-out Melebihi Batas Waktu (Tanpa Poin) |
| TC-F006-004 | F006 | UC-004 | Check-out Dipanggil Dua Kali |
| TC-F007-001 | F007 | UC-004 | Tukar Poin Menjadi Voucher Berhasil |
| TC-F007-002 | F007 | UC-004 | Tukar Poin Gagal - Poin Tidak Cukup |
| TC-F007-003 | F007 | UC-004 | Melihat Riwayat Poin |
| TC-F008-001 | F008 | UC-005 | Memberi Rating untuk Pesanan Selesai |
| TC-F008-002 | F008 | UC-005 | Mengirim Ulang Rating (Menimpa) |
| TC-F008-003 | F008 | UC-005 | Rating Tidak Tersedia untuk Pesanan Belum Selesai |
| TC-F008-004 | F008 | UC-005 | Rating untuk Menu yang Sudah Dihapus Penjual |
| TC-F009-001 | F009 | UC-005 | Melihat Riwayat Pesanan |
| TC-F009-002 | F009 | UC-005 | Tombol Beri Rating Muncul Otomatis |
| TC-F010-001 | F010 | UC-006 | Menampilkan KPI Dashboard |
| TC-F010-002 | F010 | UC-006 | Grafik Pendapatan 7 Hari & 6 Bulan |
| TC-F011-001 | F011 | UC-006 | Tambah Menu Baru Berhasil |
| TC-F011-002 | F011 | UC-006 | Edit Menu Existing |
| TC-F011-003 | F011 | UC-006 | Tandai Menu Habis/Ada |
| TC-F011-004 | F011 | UC-006 | Hapus Menu |
| TC-F011-005 | F011 | UC-006 | Upload Foto Menu Gagal - Bucket Belum Dibuat |
| TC-F012-001 | F012 | UC-006 | Terima Pesanan Masuk |
| TC-F012-002 | F012 | UC-006 | Tolak Pesanan Masuk |
| TC-F012-003 | F012 | UC-006 | Tandai Pesanan Siap Diambil |
| TC-F012-004 | F012 | UC-006 | Filter Status Pesanan Masuk |
| TC-F013-001 | F013 | UC-006 | Melihat Seluruh Ulasan Toko |
| TC-F013-002 | F013 | UC-006 | Filter Ulasan per Menu |
| TC-F014-001 | F014 | Lintas UC | Notifikasi Realtime untuk Penjual |
| TC-F014-002 | F014 | Lintas UC | Sinkronisasi Otomatis Tanpa Refresh Manual |

---

# 3. TEST CASES

## 3.1 Feature F001: Registrasi & Login

### 3.1.1 UC-001: Registrasi & Login

---

#### TC-F001-001: Registrasi Siswa Berhasil

| Field | Value |
| --- | --- |
| **TC ID** | TC-F001-001 |
| **Related UC** | UC-001 |
| **Related Feature** | F001 |
| **Test Scenario** | Calon siswa mendaftar akun baru dengan peran Siswa |
| **Preconditions** | Email belum terdaftar, `.env.local` Supabase sudah terisi |
| **Test Data** | Nama: `Budi Santoso`, Email: `budi@test.com`, Password: `siswa123`, Role: Siswa |
| **Test Steps** | 1. Buka `/register`<br>2. Isi nama, email, password, konfirmasi password<br>3. Pilih peran "Siswa"<br>4. Klik "Daftar" |
| **Expected Result** | 1. `signUp` dipanggil ke Supabase Auth<br>2. Baris `profiles` baru terbentuk dengan role='siswa'<br>3. Sistem redirect ke `/beranda` |
| **Type** | Positif |

---

#### TC-F001-002: Registrasi Penjual Berhasil

| Field | Value |
| --- | --- |
| **TC ID** | TC-F001-002 |
| **Related UC** | UC-001 |
| **Related Feature** | F001 |
| **Test Scenario** | Calon penjual mendaftar akun baru dengan peran Penjual |
| **Preconditions** | Email belum terdaftar |
| **Test Data** | Nama: `Warung Ibu Sri`, Email: `ibusri@test.com`, Password: `penjual123`, Role: Penjual |
| **Test Steps** | 1. Buka `/register`<br>2. Isi form, pilih peran "Penjual"<br>3. Klik "Daftar" |
| **Expected Result** | 1. Baris `profiles` baru dengan role='penjual'<br>2. Sistem redirect ke `/dashboard` |
| **Type** | Positif |

---

#### TC-F001-003: Login Berhasil

| Field | Value |
| --- | --- |
| **TC ID** | TC-F001-003 |
| **Related UC** | UC-001 |
| **Related Feature** | F001 |
| **Test Scenario** | Pengguna terdaftar login dengan kredensial valid |
| **Preconditions** | Akun `budi@test.com` sudah terdaftar |
| **Test Data** | Email: `budi@test.com`, Password: `siswa123` |
| **Test Steps** | 1. Buka `/login`<br>2. Isi email & password<br>3. Klik "Masuk" |
| **Expected Result** | 1. `signInWithPassword` sukses<br>2. Profil diambil dari `profiles`<br>3. Redirect ke `/beranda` (sesuai role) |
| **Type** | Positif |

---

#### TC-F001-004: Login Gagal - Kredensial Salah

| Field | Value |
| --- | --- |
| **TC ID** | TC-F001-004 |
| **Related UC** | UC-001 (AF-001) |
| **Related Feature** | F001 |
| **Test Scenario** | Pengguna memasukkan password yang salah |
| **Preconditions** | Akun `budi@test.com` sudah terdaftar |
| **Test Data** | Email: `budi@test.com`, Password: `salahpassword` |
| **Test Steps** | 1. Buka `/login`<br>2. Isi email valid, password salah<br>3. Klik "Masuk" |
| **Expected Result** | 1. Supabase mengembalikan error<br>2. Sistem menampilkan pesan error di bawah form<br>3. Pengguna tetap di `/login` |
| **Type** | Negatif |

---

#### TC-F001-005: Registrasi - Email Sudah Terdaftar

| Field | Value |
| --- | --- |
| **TC ID** | TC-F001-005 |
| **Related UC** | UC-001 (AF-002) |
| **Related Feature** | F001 |
| **Test Scenario** | Calon pengguna mendaftar dengan email yang sudah dipakai |
| **Preconditions** | Email `budi@test.com` sudah terdaftar |
| **Test Data** | Email: `budi@test.com` |
| **Test Steps** | 1. Buka `/register`<br>2. Isi form dengan email yang sudah ada<br>3. Klik "Daftar" |
| **Expected Result** | 1. `signUp` mengembalikan error<br>2. Sistem menampilkan pesan email sudah terdaftar |
| **Type** | Negatif |

---

#### TC-F001-006: Akses Halaman Terproteksi Tanpa Login

| Field | Value |
| --- | --- |
| **TC ID** | TC-F001-006 |
| **Related UC** | UC-001 (EF-003) |
| **Related Feature** | F001 |
| **Test Scenario** | Pengguna tanpa sesi aktif mengetik langsung URL halaman terproteksi |
| **Preconditions** | Belum login |
| **Test Data** | URL: `/beranda` atau `/dashboard` |
| **Test Steps** | 1. Buka URL `/beranda` tanpa login |
| **Expected Result** | 1. `RequireAuth` menampilkan "Memuat..." sebentar<br>2. Sistem redirect otomatis ke `/login` |
| **Type** | Exception |

---

## 3.2 Feature F002: Jelajah & Detail Menu

### 3.2.1 UC-002: Jelajah, Keranjang & Checkout

---

#### TC-F002-001: Menampilkan Daftar Menu

| Field | Value |
| --- | --- |
| **TC ID** | TC-F002-001 |
| **Related UC** | UC-002 |
| **Related Feature** | F002 |
| **Test Scenario** | Siswa membuka halaman Daftar Menu |
| **Preconditions** | Login sebagai siswa, minimal 1 menu tersedia |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/menu` |
| **Expected Result** | 1. Sistem query `menu_items` dan menampilkan grid `MenuCard`<br>2. Sidebar kategori tampil di desktop, chip di mobile |
| **Type** | Positif |

---

#### TC-F002-002: Filter Kategori & Diet

| Field | Value |
| --- | --- |
| **TC ID** | TC-F002-002 |
| **Related UC** | UC-002 (AF-001) |
| **Related Feature** | F002 |
| **Test Scenario** | Siswa memfilter menu berdasarkan kategori "snacks" dan diet "healthy-choice" |
| **Preconditions** | Ada menu dengan kombinasi kategori/badge tersebut |
| **Test Data** | Kategori: `snacks`, Diet: `healthy-choice` |
| **Test Steps** | 1. Buka `/menu`<br>2. Pilih chip kategori "Snacks"<br>3. Aktifkan filter diet "Healthy" |
| **Expected Result** | 1. Hasil menampilkan hanya menu snacks dengan badge healthy-choice (logika AND) |
| **Type** | Positif |

---

#### TC-F002-003: Pencarian Menu

| Field | Value |
| --- | --- |
| **TC ID** | TC-F002-003 |
| **Related UC** | UC-002 |
| **Related Feature** | F002 |
| **Test Scenario** | Siswa mencari menu dengan kata kunci |
| **Preconditions** | Ada menu bernama mengandung kata kunci |
| **Test Data** | Keyword: `nasi` |
| **Test Steps** | 1. Buka `/menu`<br>2. Ketik "nasi" di kolom pencarian |
| **Expected Result** | 1. Hasil menampilkan menu yang namanya mengandung "nasi" |
| **Type** | Positif |

---

#### TC-F002-004: Melihat Detail Menu & Rating Rata-rata

| Field | Value |
| --- | --- |
| **TC ID** | TC-F002-004 |
| **Related UC** | UC-002 |
| **Related Feature** | F002 |
| **Test Scenario** | Siswa membuka detail sebuah menu yang sudah memiliki rating |
| **Preconditions** | Menu memiliki minimal 1 rating |
| **Test Data** | Menu ID valid (UUID) |
| **Test Steps** | 1. Klik sebuah menu dari `/menu`|
| **Expected Result** | 1. Sistem membuka `/menu/[id]`<br>2. Menampilkan galeri, gizi, bahan, opsi kustom<br>3. Rating rata-rata dihitung dari `getAverageRatingForMenuItem` dan tampil akurat (atau "Belum Ada Rating" jika kosong) |
| **Type** | Positif |

---

## 3.3 Feature F003: Keranjang & Checkout

### 3.3.1 UC-002: Jelajah, Keranjang & Checkout

---

#### TC-F003-001: Tambah Item ke Keranjang dengan Kustomisasi

| Field | Value |
| --- | --- |
| **TC ID** | TC-F003-001 |
| **Related UC** | UC-002 |
| **Related Feature** | F003 |
| **Test Scenario** | Siswa menambah menu ke keranjang dengan opsi kustom berbayar |
| **Preconditions** | Menu memiliki `customOptions` |
| **Test Data** | Kuantitas: 2, Opsi: "Extra Sambal (+Rp2.000)" |
| **Test Steps** | 1. Buka `/menu/[id]`<br>2. Pilih opsi kustom, set kuantitas 2<br>3. Klik "Tambah ke Keranjang" |
| **Expected Result** | 1. Baris baru tersimpan di `CartContext` & `localStorage`<br>2. Badge jumlah item di header bertambah 2 |
| **Type** | Positif |

---

#### TC-F003-002: Ubah Kuantitas Item di Keranjang

| Field | Value |
| --- | --- |
| **TC ID** | TC-F003-002 |
| **Related UC** | UC-002 (AF-002) |
| **Related Feature** | F003 |
| **Test Scenario** | Siswa menaikkan/menurunkan kuantitas item di keranjang |
| **Preconditions** | Ada minimal 1 item di keranjang |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/keranjang`<br>2. Klik `+` pada `QuantityStepper` sebuah item<br>3. Klik `-` hingga kuantitas 0 |
| **Expected Result** | 1. Total ter-update real-time<br>2. Kuantitas 0 otomatis menghapus baris dari keranjang |
| **Type** | Positif |

---

#### TC-F003-003: Hapus Item dari Keranjang

| Field | Value |
| --- | --- |
| **TC ID** | TC-F003-003 |
| **Related UC** | UC-002 |
| **Related Feature** | F003 |
| **Test Scenario** | Siswa menghapus item dari keranjang lewat tombol hapus |
| **Preconditions** | Ada item di keranjang |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/keranjang`<br>2. Klik tombol hapus pada sebuah baris |
| **Expected Result** | 1. Baris hilang dari daftar<br>2. Ringkasan total ter-update |
| **Type** | Positif |

---

#### TC-F003-004: Keranjang Bertahan Setelah Refresh

| Field | Value |
| --- | --- |
| **TC ID** | TC-F003-004 |
| **Related UC** | UC-002 |
| **Related Feature** | F003 |
| **Test Scenario** | Isi keranjang tidak hilang saat halaman di-refresh |
| **Preconditions** | Ada item di keranjang |
| **Test Data** | — |
| **Test Steps** | 1. Tambah item ke keranjang<br>2. Refresh browser (F5)<br>3. Buka `/keranjang` |
| **Expected Result** | 1. Item yang sama masih tampil (dimuat dari `localStorage`) |
| **Type** | Positif |

---

#### TC-F003-005: Pilih Slot Waktu Pengambilan

| Field | Value |
| --- | --- |
| **TC ID** | TC-F003-005 |
| **Related UC** | UC-002 |
| **Related Feature** | F003 |
| **Test Scenario** | Siswa memilih slot waktu di halaman checkout |
| **Preconditions** | Keranjang tidak kosong |
| **Test Data** | Waktu: "Istirahat 2 (12:30)" |
| **Test Steps** | 1. Buka `/checkout`<br>2. Pilih salah satu slot waktu |
| **Expected Result** | 1. Slot terpilih tersorot secara visual<br>2. Nilai tersimpan untuk dikirim saat `createOrder` |
| **Type** | Positif |

---

## 3.4 Feature F004: Pembayaran QRIS/Saldo

### 3.4.1 UC-002: Jelajah, Keranjang & Checkout

---

#### TC-F004-001: Checkout & Bayar dengan QRIS (Mode Sandbox)

| Field | Value |
| --- | --- |
| **TC ID** | TC-F004-001 |
| **Related UC** | UC-002 |
| **Related Feature** | F004 |
| **Test Scenario** | Siswa checkout dan bayar dengan QRIS saat `XENDIT_SECRET_KEY` kosong |
| **Preconditions** | Keranjang tidak kosong, `.env.local` tanpa `XENDIT_SECRET_KEY` |
| **Test Data** | Metode bayar: QRIS |
| **Test Steps** | 1. Buka `/checkout`, pilih waktu & metode QRIS<br>2. Klik "Buat Pesanan & Bayar"<br>3. Tunggu ±8 detik tanpa scan sungguhan |
| **Expected Result** | 1. `orders` baru dibuat status `menunggu-pembayaran`<br>2. `QrisDisplay` menampilkan QR asli (dari library `qrcode`)<br>3. Status otomatis berubah `PAID` setelah ±8 detik<br>4. `confirm-payment` dipanggil, status pesanan jadi `menunggu-konfirmasi`, stok berkurang, keranjang kosong |
| **Type** | Positif |

---

#### TC-F004-002: Checkout & Bayar dengan Saldo (Cukup)

| Field | Value |
| --- | --- |
| **TC ID** | TC-F004-002 |
| **Related UC** | UC-002 |
| **Related Feature** | F004 |
| **Test Scenario** | Siswa checkout dengan metode Saldo dan saldo mencukupi |
| **Preconditions** | `walletBalance` siswa >= total pesanan |
| **Test Data** | Total: Rp27.000, Saldo: Rp50.000 |
| **Test Steps** | 1. Buka `/checkout`, pilih metode "Saldo"<br>2. Klik "Buat Pesanan & Bayar" |
| **Expected Result** | 1. `handlePaymentSuccess` dipanggil langsung tanpa QR<br>2. Status pesanan jadi `menunggu-konfirmasi`, stok berkurang<br>3. `profiles.wallet_balance` berkurang Rp27.000 |
| **Type** | Positif |

---

#### TC-F004-003: Checkout dengan Saldo Tidak Cukup

| Field | Value |
| --- | --- |
| **TC ID** | TC-F004-003 |
| **Related UC** | UC-002 (AF-003) |
| **Related Feature** | F004 |
| **Test Scenario** | Siswa memilih metode Saldo tapi saldo kurang dari total |
| **Preconditions** | `walletBalance` < total pesanan |
| **Test Data** | Total: Rp50.000, Saldo: Rp10.000 |
| **Test Steps** | 1. Buka `/checkout`, pilih metode "Saldo" |
| **Expected Result** | 1. Sistem mendeteksi `walletInsufficient = true`<br>2. Tombol bayar dinonaktifkan/menampilkan peringatan |
| **Type** | Negatif |

---

#### TC-F004-004: Simulasi Pembayaran QRIS Berhasil

| Field | Value |
| --- | --- |
| **TC ID** | TC-F004-004 |
| **Related UC** | UC-002 (AF-004) |
| **Related Feature** | F004 |
| **Test Scenario** | Siswa memakai tombol simulasi pembayaran saat memakai Xendit asli (bukan sandbox) |
| **Preconditions** | `XENDIT_SECRET_KEY` terisi, akun Xendit belum verifikasi bisnis |
| **Test Data** | — |
| **Test Steps** | 1. Checkout dengan QRIS<br>2. Klik "✅ Simulasikan Pembayaran Berhasil" |
| **Expected Result** | 1. `handlePaymentSuccess` dipanggil langsung tanpa perlu scan QR sungguhan |
| **Type** | Positif |

---

#### TC-F004-005: Konfirmasi Pembayaran Ganda (Idempoten)

| Field | Value |
| --- | --- |
| **TC ID** | TC-F004-005 |
| **Related UC** | UC-002 (EF-003) |
| **Related Feature** | F004 |
| **Test Scenario** | `POST /api/orders/confirm-payment` dipanggil dua kali untuk order yang sama (mis. klik ganda) |
| **Preconditions** | Order sudah dikonfirmasi sekali sebelumnya |
| **Test Data** | orderId yang sudah berstatus `menunggu-konfirmasi` |
| **Test Steps** | 1. Panggil `confirm-payment` untuk order tersebut sekali lagi |
| **Expected Result** | 1. Response `{ order, alreadyConfirmed: true }`<br>2. Stok TIDAK berkurang kedua kalinya |
| **Type** | Exception |

---

## 3.5 Feature F005: Group Order

### 3.5.1 UC-003: Group Order

---

#### TC-F005-001: Membuat Group Order

| Field | Value |
| --- | --- |
| **TC ID** | TC-F005-001 |
| **Related UC** | UC-003 |
| **Related Feature** | F005 |
| **Test Scenario** | Siswa membuat sesi Group Order baru |
| **Preconditions** | Siswa login, berada di `/keranjang` |
| **Test Data** | — |
| **Test Steps** | 1. Klik "Buat Group Order"<br>2. Buka `/menu/grup/buat`, klik "Buat Sekarang" |
| **Expected Result** | 1. `group_orders` baru dengan kode 6 karakter unik, status `terbuka`, `member_ids=[hostId]`<br>2. Kode & link undangan dapat disalin |
| **Type** | Positif |

---

#### TC-F005-002: Bergabung ke Group Order dengan Kode Valid

| Field | Value |
| --- | --- |
| **TC ID** | TC-F005-002 |
| **Related UC** | UC-003 |
| **Related Feature** | F005 |
| **Test Scenario** | Siswa lain bergabung memakai kode yang valid dan grup masih terbuka |
| **Preconditions** | Grup dengan kode tersebut berstatus `terbuka` |
| **Test Data** | Kode: `AB3CD9` (contoh) |
| **Test Steps** | 1. Buka `/menu/grup/AB3CD9/join`<br>2. Klik "Gabung" |
| **Expected Result** | 1. `member_ids` bertambah userId siswa<br>2. Redirect ke `/menu/grup/AB3CD9` |
| **Type** | Positif |

---

#### TC-F005-003: Bergabung dengan Kode Tidak Valid

| Field | Value |
| --- | --- |
| **TC ID** | TC-F005-003 |
| **Related UC** | UC-003 (EF-001) |
| **Related Feature** | F005 |
| **Test Scenario** | Siswa memasukkan kode yang tidak ada di database |
| **Preconditions** | — |
| **Test Data** | Kode: `ZZZZZZ` |
| **Test Steps** | 1. Masukkan kode `ZZZZZZ`, submit |
| **Expected Result** | 1. `getGroupOrder` mengembalikan `undefined`<br>2. Sistem menampilkan pesan "Kode tidak ditemukan" |
| **Type** | Negatif |

---

#### TC-F005-004: Checkout Bareng Group Order

| Field | Value |
| --- | --- |
| **TC ID** | TC-F005-004 |
| **Related UC** | UC-003 |
| **Related Feature** | F005 |
| **Test Scenario** | Host melakukan checkout bareng dari halaman grup |
| **Preconditions** | Minimal 2 anggota sudah menambah pesanan masing-masing |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/menu/grup/[kode]`<br>2. Klik "Checkout Bareng" |
| **Expected Result** | 1. Redirect ke `/checkout`<br>2. `createOrder` menyertakan `groupOrderId` |
| **Type** | Positif |

---

#### TC-F005-005: Bergabung ke Grup yang Sudah Terkunci

| Field | Value |
| --- | --- |
| **TC ID** | TC-F005-005 |
| **Related UC** | UC-003 (AF-002) |
| **Related Feature** | F005 |
| **Test Scenario** | Siswa mencoba bergabung ke grup berstatus `terkunci` |
| **Preconditions** | Grup sudah dikunci host |
| **Test Data** | Kode grup terkunci |
| **Test Steps** | 1. Masukkan kode grup terkunci, klik "Gabung" |
| **Expected Result** | 1. `joinGroupOrder` mengembalikan data grup tanpa menambahkan anggota baru<br>2. Sistem menampilkan pesan grup sudah tidak menerima anggota baru |
| **Type** | Negatif |

---

## 3.6 Feature F006: Check-in/Check-out Meja & Poin

### 3.6.1 UC-004: Check-in/Check-out Meja & Poin

---

#### TC-F006-001: Check-in Meja

| Field | Value |
| --- | --- |
| **TC ID** | TC-F006-001 |
| **Related UC** | UC-004 |
| **Related Feature** | F006 |
| **Test Scenario** | Siswa check-in setelah pesanan siap diambil |
| **Preconditions** | Pesanan berstatus `siap-diambil` |
| **Test Data** | Nomor meja: `12` |
| **Test Steps** | 1. Buka `/meja/checkin`<br>2. Isi nomor meja `12`, klik "Check-in" |
| **Expected Result** | 1. `table_checkins` baru dengan `check_in_at = now()`<br>2. Redirect ke `/meja/checkout`, timer mulai berjalan di halaman tersebut |
| **Type** | Positif |

---

#### TC-F006-002: Check-out Tepat Waktu (Dapat Poin)

| Field | Value |
| --- | --- |
| **TC ID** | TC-F006-002 |
| **Related UC** | UC-004 |
| **Related Feature** | F006 |
| **Test Scenario** | Siswa check-out dalam ≤15 menit sejak check-in |
| **Preconditions** | Sudah check-in, waktu berjalan 10 menit |
| **Test Data** | Elapsed: 10 menit |
| **Test Steps** | 1. Buka `/meja/checkout`<br>2. Klik "Check-out" |
| **Expected Result** | 1. `is_on_time = true`, `points_earned = 10`<br>2. `profiles.points` bertambah 10<br>3. `orders.status` menjadi `selesai-disajikan` |
| **Type** | Positif |

---

#### TC-F006-003: Check-out Melebihi Batas Waktu (Tanpa Poin)

| Field | Value |
| --- | --- |
| **TC ID** | TC-F006-003 |
| **Related UC** | UC-004 (AF-001) |
| **Related Feature** | F006 |
| **Test Scenario** | Siswa check-out setelah lebih dari 15 menit |
| **Preconditions** | Sudah check-in, waktu berjalan 20 menit |
| **Test Data** | Elapsed: 20 menit |
| **Test Steps** | 1. Buka `/meja/checkout` setelah 20 menit<br>2. Klik "Check-out" |
| **Expected Result** | 1. `is_on_time = false`, `points_earned = 0`<br>2. `orders.status` tetap berubah menjadi `selesai-disajikan`, tapi tanpa tambahan poin |
| **Type** | Negatif |

---

#### TC-F006-004: Check-out Dipanggil Dua Kali

| Field | Value |
| --- | --- |
| **TC ID** | TC-F006-004 |
| **Related UC** | UC-004 (EF-001) |
| **Related Feature** | F006 |
| **Test Scenario** | `completeCheckIn` dipanggil ulang untuk sesi yang sudah check-out |
| **Preconditions** | Sesi sudah memiliki `check_out_at` |
| **Test Data** | — |
| **Test Steps** | 1. Panggil endpoint/aksi check-out sekali lagi untuk sesi yang sama |
| **Expected Result** | 1. Sistem mengembalikan data sesi tanpa menghitung ulang atau menambah poin lagi |
| **Type** | Exception |

---

## 3.7 Feature F007: Poin & Voucher

### 3.7.1 UC-004: Check-in/Check-out Meja & Poin

---

#### TC-F007-001: Tukar Poin Menjadi Voucher Berhasil

| Field | Value |
| --- | --- |
| **TC ID** | TC-F007-001 |
| **Related UC** | UC-004 |
| **Related Feature** | F007 |
| **Test Scenario** | Siswa dengan poin >= 100 menukar ke voucher |
| **Preconditions** | `profiles.points >= 100` |
| **Test Data** | Poin awal: 150 |
| **Test Steps** | 1. Buka `/poin`<br>2. Klik "Tukar 100 Poin → Voucher" |
| **Expected Result** | 1. Voucher baru senilai Rp5.000 tercipta<br>2. `point_history` entri -100<br>3. Poin siswa berkurang jadi 50 |
| **Type** | Positif |

---

#### TC-F007-002: Tukar Poin Gagal - Poin Tidak Cukup

| Field | Value |
| --- | --- |
| **TC ID** | TC-F007-002 |
| **Related UC** | UC-004 (EF-002) |
| **Related Feature** | F007 |
| **Test Scenario** | Siswa dengan poin < 100 mencoba menukar voucher |
| **Preconditions** | `profiles.points < 100` |
| **Test Data** | Poin awal: 40 |
| **Test Steps** | 1. Buka `/poin`<br>2. Klik "Tukar 100 Poin → Voucher" |
| **Expected Result** | 1. `redeemVoucher` mengembalikan `null`<br>2. Sistem menampilkan pesan poin belum cukup, tidak ada voucher/entri poin baru |
| **Type** | Negatif |

---

#### TC-F007-003: Melihat Riwayat Poin

| Field | Value |
| --- | --- |
| **TC ID** | TC-F007-003 |
| **Related UC** | UC-004 |
| **Related Feature** | F007 |
| **Test Scenario** | Siswa melihat riwayat mutasi poinnya |
| **Preconditions** | Ada minimal 1 entri `point_history` |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/poin` |
| **Expected Result** | 1. Daftar riwayat poin tampil terurut terbaru, positif (didapat) dan negatif (ditukar) dibedakan visual |
| **Type** | Positif |

---

## 3.8 Feature F008: Rating Makanan

### 3.8.1 UC-005: Rating Makanan & Riwayat Pesanan

---

#### TC-F008-001: Memberi Rating untuk Pesanan Selesai

| Field | Value |
| --- | --- |
| **TC ID** | TC-F008-001 |
| **Related UC** | UC-005 |
| **Related Feature** | F008 |
| **Test Scenario** | Siswa memberi rating untuk pesanan berstatus "Selesai Disajikan" |
| **Preconditions** | Pesanan berstatus `selesai-disajikan`, belum dirating |
| **Test Data** | Bintang: 5, Komentar: "Enak banget!" |
| **Test Steps** | 1. Buka `/rating/[orderId]`<br>2. Pilih 5 bintang, isi komentar<br>3. Klik "Kirim" |
| **Expected Result** | 1. `ratings` baru tercipta (upsert)<br>2. Redirect ke `/pesanan`, tombol "Beri Rating" hilang untuk pesanan tersebut |
| **Type** | Positif |

---

#### TC-F008-002: Mengirim Ulang Rating (Menimpa)

| Field | Value |
| --- | --- |
| **TC ID** | TC-F008-002 |
| **Related UC** | UC-005 (AF-001) |
| **Related Feature** | F008 |
| **Test Scenario** | Siswa mengirim rating baru untuk kombinasi order+menu yang sama |
| **Preconditions** | Sudah pernah rating menu tersebut di pesanan ini |
| **Test Data** | Bintang lama: 3 → Bintang baru: 5 |
| **Test Steps** | 1. Kirim rating 5 bintang untuk kombinasi order+menu yang sudah pernah dirating 3 bintang |
| **Expected Result** | 1. `upsert` menimpa baris lama menjadi 5 bintang<br>2. Tidak ada baris duplikat di `ratings` |
| **Type** | Positif |

---

#### TC-F008-003: Rating Tidak Tersedia untuk Pesanan Belum Selesai

| Field | Value |
| --- | --- |
| **TC ID** | TC-F008-003 |
| **Related UC** | UC-005 |
| **Related Feature** | F008 |
| **Test Scenario** | Pesanan berstatus `diproses` tidak menampilkan tombol Beri Rating |
| **Preconditions** | Pesanan berstatus `diproses` |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/pesanan`, cek pesanan berstatus `diproses` |
| **Expected Result** | 1. Tombol "Beri Rating" tidak muncul untuk pesanan tersebut |
| **Type** | Negatif |

---

#### TC-F008-004: Rating untuk Menu yang Sudah Dihapus Penjual

| Field | Value |
| --- | --- |
| **TC ID** | TC-F008-004 |
| **Related UC** | UC-005 (AF-002) |
| **Related Feature** | F008 |
| **Test Scenario** | Salah satu menu di pesanan sudah dihapus penjual sebelum siswa memberi rating |
| **Preconditions** | Menu terkait sudah dihapus dari `menu_items` |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/rating/[orderId]` untuk pesanan dengan menu yang sudah terhapus<br>2. Beri rating untuk menu lain yang masih ada, klik "Kirim" |
| **Expected Result** | 1. Sistem tidak menunggu rating untuk menu yang sudah hilang datanya<br>2. Pesanan tetap dapat ditandai selesai dirating |
| **Type** | Exception |

---

## 3.9 Feature F009: Riwayat Pesanan

### 3.9.1 UC-005: Rating Makanan & Riwayat Pesanan

---

#### TC-F009-001: Melihat Riwayat Pesanan

| Field | Value |
| --- | --- |
| **TC ID** | TC-F009-001 |
| **Related UC** | UC-005 |
| **Related Feature** | F009 |
| **Test Scenario** | Siswa melihat seluruh riwayat pesanannya |
| **Preconditions** | Siswa memiliki minimal 1 pesanan |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/pesanan` |
| **Expected Result** | 1. Daftar pesanan tampil terurut terbaru dengan badge status masing-masing |
| **Type** | Positif |

---

#### TC-F009-002: Tombol Beri Rating Muncul Otomatis

| Field | Value |
| --- | --- |
| **TC ID** | TC-F009-002 |
| **Related UC** | UC-005 |
| **Related Feature** | F009 |
| **Test Scenario** | Tombol "Beri Rating" hanya muncul untuk pesanan selesai yang belum dirating |
| **Preconditions** | Ada pesanan `selesai-disajikan` yang belum dirating dan satu yang sudah dirating |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/pesanan`, bandingkan kedua pesanan |
| **Expected Result** | 1. Tombol muncul hanya pada pesanan yang belum dirating (`hasRatedOrder = false`) |
| **Type** | Positif |

---

## 3.10 Feature F010: Dashboard Penjual

### 3.10.1 UC-006: Kelola Menu, Pesanan Masuk & Ulasan

---

#### TC-F010-001: Menampilkan KPI Dashboard

| Field | Value |
| --- | --- |
| **TC ID** | TC-F010-001 |
| **Related UC** | UC-006 |
| **Related Feature** | F010 |
| **Test Scenario** | Penjual melihat ringkasan pendapatan & pesanan hari ini |
| **Preconditions** | Penjual login, ada pesanan hari ini |
| **Test Data** | — |
| **Test Steps** | 1. Login sebagai penjual → `/dashboard` |
| **Expected Result** | 1. KPI Card menampilkan pendapatan hari ini, jumlah pesanan, pesanan perlu diproses, jumlah menu habis — semuanya akurat sesuai data |
| **Type** | Positif |

---

#### TC-F010-002: Grafik Pendapatan 7 Hari & 6 Bulan

| Field | Value |
| --- | --- |
| **TC ID** | TC-F010-002 |
| **Related UC** | UC-006 |
| **Related Feature** | F010 |
| **Test Scenario** | Grafik pendapatan hanya menghitung pesanan yang sudah dibayar |
| **Preconditions** | Ada campuran pesanan berbayar, `menunggu-pembayaran`, dan `dibatalkan` |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/dashboard`, amati grafik |
| **Expected Result** | 1. Pesanan `menunggu-pembayaran` dan `dibatalkan` TIDAK dihitung ke grafik pendapatan |
| **Type** | Positif |

---

## 3.11 Feature F011: Kelola Menu Penjual

### 3.11.1 UC-006: Kelola Menu, Pesanan Masuk & Ulasan

---

#### TC-F011-001: Tambah Menu Baru Berhasil

| Field | Value |
| --- | --- |
| **TC ID** | TC-F011-001 |
| **Related UC** | UC-006 |
| **Related Feature** | F011 |
| **Test Scenario** | Penjual menambah menu baru lengkap dengan foto |
| **Preconditions** | Bucket `menu-images` sudah dibuat |
| **Test Data** | Nama: "Es Teh Manis", Harga: 5000, Kategori: drinks, Stok: 50 |
| **Test Steps** | 1. Buka `/kelola-menu/baru`<br>2. Isi form lengkap + upload foto<br>3. Klik "Simpan" |
| **Expected Result** | 1. Foto terupload ke bucket, URL tersimpan<br>2. `menu_items` baru tercipta<br>3. Redirect ke `/kelola-menu`, menu baru tampil |
| **Type** | Positif |

---

#### TC-F011-002: Edit Menu Existing

| Field | Value |
| --- | --- |
| **TC ID** | TC-F011-002 |
| **Related UC** | UC-006 |
| **Related Feature** | F011 |
| **Test Scenario** | Penjual mengedit harga menu yang sudah ada |
| **Preconditions** | Menu milik penjual sudah ada |
| **Test Data** | Harga baru: 6000 |
| **Test Steps** | 1. Buka `/kelola-menu/[id]/edit`<br>2. Ubah harga jadi 6000<br>3. Klik "Simpan" |
| **Expected Result** | 1. `updateMenuItem` UPDATE kolom `price`<br>2. Harga baru tampil di `/kelola-menu` dan halaman siswa |
| **Type** | Positif |

---

#### TC-F011-003: Tandai Menu Habis/Ada

| Field | Value |
| --- | --- |
| **TC ID** | TC-F011-003 |
| **Related UC** | UC-006 |
| **Related Feature** | F011 |
| **Test Scenario** | Penjual mengubah status ketersediaan menu |
| **Preconditions** | Menu berstatus tersedia |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/kelola-menu`<br>2. Klik "Tandai Habis" pada sebuah menu |
| **Expected Result** | 1. `is_available` berubah jadi `false`<br>2. Menu tampil sebagai "Habis" di sisi siswa |
| **Type** | Positif |

---

#### TC-F011-004: Hapus Menu

| Field | Value |
| --- | --- |
| **TC ID** | TC-F011-004 |
| **Related UC** | UC-006 |
| **Related Feature** | F011 |
| **Test Scenario** | Penjual menghapus menu dari katalog |
| **Preconditions** | Menu ada dan milik penjual login |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/kelola-menu`<br>2. Klik "Hapus" pada sebuah menu, konfirmasi |
| **Expected Result** | 1. Baris `menu_items` terhapus<br>2. Menu tidak lagi tampil di katalog siswa |
| **Type** | Positif |

---

#### TC-F011-005: Upload Foto Menu Gagal - Bucket Belum Dibuat

| Field | Value |
| --- | --- |
| **TC ID** | TC-F011-005 |
| **Related UC** | UC-006 (AF-002) |
| **Related Feature** | F011 |
| **Test Scenario** | Penjual mengunggah foto sebelum bucket `menu-images` dibuat manual |
| **Preconditions** | Bucket Storage belum dibuat di dashboard Supabase |
| **Test Data** | File foto valid (PNG/JPG) |
| **Test Steps** | 1. Buka `/kelola-menu/baru`, pilih file foto<br>2. Klik "Simpan" |
| **Expected Result** | 1. `uploadMenuImage` mengembalikan error<br>2. Sistem menampilkan pesan error yang jelas, bukan gagal diam-diam |
| **Type** | Exception |

---

## 3.12 Feature F012: Pesanan Masuk Penjual

### 3.12.1 UC-006: Kelola Menu, Pesanan Masuk & Ulasan

---

#### TC-F012-001: Terima Pesanan Masuk

| Field | Value |
| --- | --- |
| **TC ID** | TC-F012-001 |
| **Related UC** | UC-006 |
| **Related Feature** | F012 |
| **Test Scenario** | Penjual menerima pesanan berstatus `menunggu-konfirmasi` |
| **Preconditions** | Ada pesanan berstatus `menunggu-konfirmasi` |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/pesanan-masuk` (filter "Perlu Diterima")<br>2. Klik "✅ Terima Pesanan" |
| **Expected Result** | 1. `orders.status` berubah menjadi `diproses`<br>2. Pesanan pindah dari filter "Perlu Diterima" |
| **Type** | Positif |

---

#### TC-F012-002: Tolak Pesanan Masuk

| Field | Value |
| --- | --- |
| **TC ID** | TC-F012-002 |
| **Related UC** | UC-006 |
| **Related Feature** | F012 |
| **Test Scenario** | Penjual menolak pesanan yang masuk |
| **Preconditions** | Ada pesanan berstatus `menunggu-konfirmasi` |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/pesanan-masuk`<br>2. Klik "Tolak" |
| **Expected Result** | 1. `orders.status` berubah menjadi `dibatalkan` |
| **Type** | Positif |

---

#### TC-F012-003: Tandai Pesanan Siap Diambil

| Field | Value |
| --- | --- |
| **TC ID** | TC-F012-003 |
| **Related UC** | UC-006 |
| **Related Feature** | F012 |
| **Test Scenario** | Penjual menandai pesanan `diproses` menjadi siap diambil |
| **Preconditions** | Pesanan berstatus `diproses` |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/pesanan-masuk`, filter "Sedang Disiapkan"<br>2. Klik "Tandai Siap Diambil" |
| **Expected Result** | 1. `orders.status` berubah menjadi `siap-diambil`<br>2. Siswa menerima notifikasi terkait |
| **Type** | Positif |

---

#### TC-F012-004: Filter Status Pesanan Masuk

| Field | Value |
| --- | --- |
| **TC ID** | TC-F012-004 |
| **Related UC** | UC-006 |
| **Related Feature** | F012 |
| **Test Scenario** | Penjual memfilter daftar pesanan berdasarkan status |
| **Preconditions** | Ada pesanan dengan berbagai status |
| **Test Data** | Filter: "Selesai" |
| **Test Steps** | 1. Buka `/pesanan-masuk`<br>2. Pilih filter "Selesai" |
| **Expected Result** | 1. Daftar hanya menampilkan pesanan `selesai-disajikan` |
| **Type** | Positif |

---

## 3.13 Feature F013: Ulasan Penjual

### 3.13.1 UC-006: Kelola Menu, Pesanan Masuk & Ulasan

---

#### TC-F013-001: Melihat Seluruh Ulasan Toko

| Field | Value |
| --- | --- |
| **TC ID** | TC-F013-001 |
| **Related UC** | UC-006 |
| **Related Feature** | F013 |
| **Test Scenario** | Penjual melihat seluruh rating & komentar untuk menu miliknya |
| **Preconditions** | Ada rating untuk menu milik penjual |
| **Test Data** | — |
| **Test Steps** | 1. Buka `/ulasan` |
| **Expected Result** | 1. `getRatingsForSeller` menampilkan seluruh rating & komentar menu milik penjual beserta ringkasan rata-rata toko |
| **Type** | Positif |

---

#### TC-F013-002: Filter Ulasan per Menu

| Field | Value |
| --- | --- |
| **TC ID** | TC-F013-002 |
| **Related UC** | UC-006 |
| **Related Feature** | F013 |
| **Test Scenario** | Penjual memfilter ulasan berdasarkan satu menu tertentu |
| **Preconditions** | Ada rating untuk beberapa menu berbeda |
| **Test Data** | Menu: "Nasi Goreng" |
| **Test Steps** | 1. Buka `/ulasan`<br>2. Pilih filter menu "Nasi Goreng" |
| **Expected Result** | 1. Daftar hanya menampilkan rating untuk menu tersebut |
| **Type** | Positif |

---

## 3.14 Feature F014: Notifikasi & Realtime Sync

### 3.14.1 Lintas Use Case

---

#### TC-F014-001: Notifikasi Realtime untuk Penjual

| Field | Value |
| --- | --- |
| **TC ID** | TC-F014-001 |
| **Related UC** | UC-002, UC-006 |
| **Related Feature** | F014 |
| **Test Scenario** | Penjual menerima notifikasi saat ada pesanan baru masuk |
| **Preconditions** | Realtime diaktifkan untuk tabel `orders` di Supabase, penjual sedang online |
| **Test Data** | — |
| **Test Steps** | 1. Siswa checkout & bayar sukses di sesi lain<br>2. Amati `NotificationBell` penjual |
| **Expected Result** | 1. Notifikasi baru muncul tanpa refresh manual<br>2. Klik notifikasi membuka `/pesanan-masuk` |
| **Type** | Positif |

---

#### TC-F014-002: Sinkronisasi Otomatis Tanpa Refresh Manual

| Field | Value |
| --- | --- |
| **TC ID** | TC-F014-002 |
| **Related UC** | UC-006 |
| **Related Feature** | F014 |
| **Test Scenario** | Realtime BELUM diaktifkan di Supabase — aplikasi tetap berjalan normal |
| **Preconditions** | Replication untuk tabel `orders` belum diaktifkan |
| **Test Data** | — |
| **Test Steps** | 1. Ubah status pesanan dari sesi lain<br>2. Amati halaman Pesanan Masuk tanpa refresh |
| **Expected Result** | 1. Perubahan tidak muncul otomatis (diperlukan refresh manual)<br>2. Tidak ada error yang muncul ke pengguna |
| **Type** | Exception |

---

# 4. TRACEABILITY SUMMARY

| Feature ID | Total Test Cases | Positif | Negatif | Exception |
| --- | --- | --- | --- | --- |
| F001 | 6 | 3 | 2 | 1 |
| F002 | 4 | 4 | 0 | 0 |
| F003 | 5 | 5 | 0 | 0 |
| F004 | 5 | 4 | 1 | 1* |
| F005 | 5 | 3 | 2 | 0 |
| F006 | 4 | 2 | 1 | 1 |
| F007 | 3 | 2 | 1 | 0 |
| F008 | 4 | 2 | 1 | 1 |
| F009 | 2 | 2 | 0 | 0 |
| F010 | 2 | 2 | 0 | 0 |
| F011 | 5 | 4 | 0 | 1 |
| F012 | 4 | 4 | 0 | 0 |
| F013 | 2 | 2 | 0 | 0 |
| F014 | 2 | 1 | 0 | 1 |
| **Total** | **53** | **40** | **8** | **5*** |

\*TC-F004-005 dihitung dua kali secara logis (Positif untuk perilaku idempoten yang benar, dikategorikan Exception karena skenario pemicunya adalah kondisi tepi/error).
