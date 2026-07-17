# User Flow Specification

Document Version: v1.0

Use Case ID: UC-002
Use Case Name: Jelajah, Keranjang & Checkout (Pembayaran QRIS/Saldo)

Status: As-Built
Last Updated: 2026-07-11
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Siswa menelusuri menu dari Beranda/Daftar Menu, melihat detail menu, menambahkannya ke keranjang (dengan kustomisasi opsional), lalu checkout dengan memilih slot waktu pengambilan dan metode bayar (QRIS via Xendit atau Saldo internal).

## 1.2 Goal

Siswa ingin memesan makanan/minuman kantin tanpa mengantre fisik dan membayarnya secara non-tunai.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F002|Jelajah & Detail Menu|
|F003|Keranjang & Checkout|
|F004|Pembayaran QRIS/Saldo|

## 1.4 Primary Actor

Siswa

## 1.5 Supporting Actors

Xendit (payment gateway), Sistem (server API confirm-payment)

---

# 2. TRIGGER

Siswa login dan mendarat di `/beranda`, atau langsung membuka `/menu`.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Siswa sudah login (`RequireAuth role='siswa'`)|
|PRE-002|Minimal ada satu penjual yang sudah menambahkan menu (`menu_items`)|
|PRE-003|Untuk metode Saldo: `walletBalance` siswa mencukupi total pesanan|

---

# 4. MAIN FLOW

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa membuka `/beranda` atau `/menu`|Sistem menampilkan grid `MenuCard` (query `menu_items`, filter kategori/diet, pencarian)|
|2|Siswa klik sebuah menu|Sistem membuka `/menu/[id]`, menampilkan galeri, gizi, bahan, opsi kustom, rating rata-rata (`getAverageRatingForMenuItem`)|
|3|Siswa memilih opsi kustom & kuantitas, klik "Tambah ke Keranjang"|`CartContext.addItem()` menyimpan baris baru (atau menggabung ke baris identik) ke `localStorage` (`digicanteen-cart-v1`)|
|4|Siswa klik ikon Keranjang di header|Sistem membuka `/keranjang`, menampilkan daftar baris keranjang + ringkasan (subtotal, biaya layanan Rp2.000, total)|
|5|Siswa klik "Checkout"|Sistem membuka `/checkout`|
|6|Siswa memilih slot waktu pengambilan dan metode bayar (QRIS/Saldo)|Sistem menghitung ulang total dan menonaktifkan tombol bayar jika saldo tidak cukup (untuk metode Saldo)|
|7|Siswa klik "Buat Pesanan & Bayar"|Sistem memanggil `createOrder()` → INSERT `orders` dengan status `menunggu-pembayaran`|
|8a|(Metode QRIS)|Sistem memanggil `POST /api/payments/qris` → menampilkan `QrisDisplay` (QR asli, dari Xendit atau sandbox)|
|8b|(Metode Saldo)|Sistem langsung memanggil `handlePaymentSuccess(orderId)`|
|9|Siswa scan QR (atau menunggu sandbox auto-PAID ±8 detik)|Sistem polling `GET /api/payments/qris/status`; saat status `PAID`, panggil `handlePaymentSuccess(orderId)`|
|10||`handlePaymentSuccess` memanggil `POST /api/orders/confirm-payment`: ubah status pesanan ke `menunggu-konfirmasi` + kurangi stok tiap menu|
|11||Sistem mengosongkan keranjang (`clearCart`) dan menampilkan halaman sukses dengan ajakan Check-in Meja|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Filter & Pencarian Menu

### Condition

Siswa ingin menyaring menu berdasarkan kategori, kata kunci, atau diet (Healthy/Kids/Halal).

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa mengetik di kolom pencarian atau memilih chip kategori/diet|Sistem memfilter hasil secara client-side dari data `menu_items` yang sudah dimuat (logika filter diet default AND, dapat diganti OR di kode)|

---

## AF-002: Ubah Jumlah/Hapus Item di Keranjang

### Condition

Siswa ingin mengubah kuantitas atau menghapus item dari keranjang.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa klik `+`/`-` pada `QuantityStepper` sebuah baris|`CartContext.updateQuantity()` memperbarui state; kuantitas 0 otomatis menghapus baris|
|2|Siswa klik tombol hapus|`CartContext.removeItem()` menghapus baris dari keranjang|

---

## AF-003: Bayar dengan Saldo Tidak Cukup

### Condition

`walletBalance` siswa kurang dari `total` pesanan dan metode bayar = Saldo.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa memilih metode Saldo|Sistem mendeteksi `walletInsufficient = true`|
|2||Tombol "Buat Pesanan & Bayar" dinonaktifkan/menampilkan peringatan saldo kurang|

---

## AF-004: Simulasi Pembayaran QRIS

### Condition

Xendit belum terverifikasi bisnis sehingga QR asli belum bisa menerima pembayaran sungguhan.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa melihat tombol "✅ Simulasikan Pembayaran Berhasil" (muncul otomatis di bawah QR saat memakai Xendit asli, bukan mode sandbox)|Klik tombol memanggil `handlePaymentSuccess(orderId)` langsung, melewati proses scan QR sungguhan|

---

# 6. EXCEPTION FLOWS

## EF-001: ID Menu Tidak Valid (Format Bukan UUID)

### Condition

Ada ID menu lama di `localStorage` (peninggalan sebelum migrasi Supabase) yang formatnya bukan UUID.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Sistem memuat detail item keranjang|`getMenuItemsByIds()` memvalidasi format UUID sebelum query|
|2||ID tidak valid dianggap "tidak ditemukan" (bukan error keras), item ditampilkan dengan opsi hapus, bukan membuat halaman hang di "Memuat..."|

---

## EF-002: Xendit/Supabase Belum Dikonfigurasi

### Condition

`XENDIT_SECRET_KEY` kosong.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa checkout dengan QRIS|`/api/payments/qris` otomatis memakai mode sandbox: string QRIS dummy buatan tangan (bukan dari Xendit), lalu dirender jadi gambar QR asli yang bisa discan lewat library `qrcode` di `QrisDisplay`, status otomatis `PAID` ±8 detik|

---

## EF-003: Konfirmasi Pembayaran Dipanggil Dua Kali

### Condition

Klik ganda atau retry jaringan memicu `confirm-payment` dua kali untuk order yang sama.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|`POST /api/orders/confirm-payment` dipanggil ulang|Sistem mengecek `order.status !== 'menunggu-pembayaran'`|
|2||Jika sudah dikonfirmasi sebelumnya, sistem mengembalikan `{ order, alreadyConfirmed: true }` tanpa memotong stok lagi|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Baris baru tercipta di `orders` dengan status `menunggu-konfirmasi`|
|POST-002|Stok tiap `menu_items` yang dipesan berkurang sesuai kuantitas (minimal 0)|
|POST-003|Keranjang siswa kosong (`localStorage` dibersihkan)|
|POST-004|Untuk metode Saldo, `profiles.wallet_balance` siswa berkurang sebesar `total`|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-001|Biaya layanan flat Rp2.000 per transaksi|
|BR-002|Metode Saldo ditolak jika saldo kurang dari total|
|BR-003|Stok dikurangi saat pembayaran dikonfirmasi, bukan saat item ditambah ke keranjang|
|BR-004|Endpoint konfirmasi pembayaran bersifat idempoten|
|BR-005|Filter diet default menggunakan logika AND antar-tag|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-004|Beranda|
|PAGE-005|Daftar Menu|
|PAGE-006|Detail Menu|
|PAGE-007|Keranjang|
|PAGE-008|Checkout|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|menu_items|Katalog menu, detail, rating rata-rata|
|profiles|Saldo dompet siswa untuk validasi metode Saldo|

## 10.2 Data Created

|Entity|Description|
|---|---|
|orders|Pesanan baru saat checkout|
|QrisPayment (via Xendit)|Sesi pembayaran QRIS|

## 10.3 Data Updated

|Entity|Description|
|---|---|
|menu_items.stock|Dikurangi saat pembayaran dikonfirmasi|
|orders.status|`menunggu-pembayaran` → `menunggu-konfirmasi`|
|profiles.wallet_balance|Dikurangi untuk metode Saldo|

## 10.4 Data Deleted

|Entity|Description|
|---|---|
|Cart (localStorage)|Dikosongkan setelah pembayaran sukses|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|Siswa|AKSI (ALLOWED)|
|Penjual|DITOLAK — diarahkan ke `/dashboard` jika mencoba akses|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Siswa dapat menelusuri, mencari, dan memfilter menu|
|AC-002|Siswa dapat menambah item dengan kustomisasi dan kuantitas ke keranjang|
|AC-003|Siswa dapat mengubah/menghapus item di keranjang dan melihat total real-time|
|AC-004|Siswa dapat checkout dan membayar via QRIS (sandbox/asli) atau Saldo|
|AC-005|Setelah bayar sukses, status pesanan berubah dan stok menu berkurang otomatis|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F002|
|F003|
|F004|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-004|
|PAGE-005|
|PAGE-006|
|PAGE-007|
|PAGE-008|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|1.0|2026-07-11|System Analyst AI|Initial as-built draft|
