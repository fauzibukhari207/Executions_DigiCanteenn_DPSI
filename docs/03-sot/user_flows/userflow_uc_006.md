# User Flow Specification

Document Version: v1.0

Use Case ID: UC-006
Use Case Name: Kelola Menu, Pesanan Masuk & Ulasan (Penjual)

Status: As-Built
Last Updated: 2026-07-11
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Penjual memantau ringkasan operasional di Dashboard, mengelola katalog menunya (tambah/edit/hapus/tandai habis, upload foto), memproses pesanan masuk secara bertahap (terima/tolak → tandai siap), dan meninjau ulasan pelanggan untuk menu-menunya.

## 1.2 Goal

Penjual ingin mengelola bisnis kantinnya sehari-hari — dari katalog, antrean pesanan, hingga performa penjualan dan kepuasan pelanggan — dalam satu dashboard.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F010|Dashboard Penjual|
|F011|Kelola Menu Penjual|
|F012|Pesanan Masuk Penjual|
|F013|Ulasan Penjual|

## 1.4 Primary Actor

Penjual

## 1.5 Supporting Actors

Sistem (Realtime sync, Supabase Storage)

---

# 2. TRIGGER

Penjual login dan mendarat di `/dashboard`.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Penjual sudah login (`RequireAuth role='penjual'`)|
|PRE-002|Untuk upload foto menu: bucket Storage `menu-images` sudah dibuat di Supabase|

---

# 4. MAIN FLOW (Dashboard)

|Step|Actor Action|System Response|
|---|---|---|
|1|Penjual login|Sistem redirect ke `/dashboard`|
|2||Sistem menampilkan KPI: pendapatan hari ini, jumlah pesanan hari ini, pesanan perlu diproses, jumlah menu habis|
|3||Sistem menampilkan grafik pendapatan 7 hari terakhir dan 6 bulan terakhir (dihitung dari `orders` berbayar milik penjual, via `recharts`)|
|4||Sistem berlangganan `useOrdersRealtime` — dashboard otomatis refetch saat ada perubahan tabel `orders`|

---

# 4B. MAIN FLOW (Kelola Menu)

|Step|Actor Action|System Response|
|---|---|---|
|1|Penjual buka `/kelola-menu`|`getMenuItemsBySeller(sellerId)` menampilkan daftar menu miliknya|
|2|Penjual klik "Tambah Menu"|Sistem membuka `/kelola-menu/baru` dengan `MenuForm` kosong|
|3|Penjual mengisi nama, harga, kategori, gizi, bahan, badge, stok, status tersedia, dan mengunggah foto|`uploadMenuImage()` mengunggah file ke bucket `menu-images`, mengembalikan URL publik|
|4|Penjual klik "Simpan"|`createMenuItem(data)` INSERT `menu_items`, kembali ke `/kelola-menu`|
|5|Penjual klik "Edit" pada menu tertentu|Sistem membuka `/kelola-menu/[id]/edit` dengan `MenuForm` terisi data existing|
|6|Penjual klik "Tandai Habis/Ada"|`toggleMenuAvailability(id)` UPDATE `is_available`|
|7|Penjual klik "Hapus"|`deleteMenuItem(id)` menghapus baris dari `menu_items`|

---

# 4C. MAIN FLOW (Pesanan Masuk)

|Step|Actor Action|System Response|
|---|---|---|
|1|Penjual buka `/pesanan-masuk`|`getOrdersForSeller(sellerId)` menampilkan daftar pesanan (difilter RLS di database), default filter "Perlu Diterima" (`menunggu-konfirmasi`)|
|2|Penjual klik "✅ Terima Pesanan"|`updateOrderStatus(id, 'diproses')`|
|3|Penjual klik "Tolak"|`updateOrderStatus(id, 'dibatalkan')`|
|4|Penjual klik "Tandai Siap Diambil" (untuk pesanan `diproses`)|`updateOrderStatus(id, 'siap-diambil')`|
|5||Sistem (Realtime) otomatis memperbarui daftar tanpa perlu refresh manual|

---

# 4D. MAIN FLOW (Ulasan)

|Step|Actor Action|System Response|
|---|---|---|
|1|Penjual buka `/ulasan`|`getRatingsForSeller(sellerId)` — query dua langkah: ambil ID menu milik penjual, lalu ambil rating dengan `menu_item_id` di daftar itu|
|2||Sistem menampilkan daftar rating & komentar, filter per menu, dan ringkasan rating rata-rata toko|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Notifikasi Pesanan Perlu Diterima

### Condition

Ada pesanan baru berstatus `menunggu-konfirmasi`.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Sistem mendeteksi pesanan baru (Realtime)|`NotificationBell` menampilkan notifikasi "Pesanan Menunggu Konfirmasi" — prioritas tertinggi untuk penjual|
|2|Penjual klik notifikasi|Sistem membuka `/pesanan-masuk` langsung|

---

## AF-002: Upload Foto Gagal (Bucket Belum Dibuat)

### Condition

Bucket Storage `menu-images` belum dibuat manual di dashboard Supabase.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Penjual upload foto menu|`uploadMenuImage()` mengembalikan error dari Supabase Storage|
|2||Sistem menampilkan pesan error yang jelas (bukan gagal diam-diam), mengarahkan penjual untuk membuat bucket lewat dashboard Supabase|

---

# 6. EXCEPTION FLOWS

## EF-001: RLS Menolak Update yang Bukan Miliknya

### Condition

Kebijakan RLS hanya mengizinkan penjual mengubah menu/pesanan yang relevan dengannya.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Query update dikirim ke Supabase|RLS memfilter baris; jika tidak match, Postgres mengembalikan "0 baris ter-update" tanpa error keras|
|2||Frontend perlu memeriksa hasil update dan menampilkan pesan gagal jika baris tidak berubah (pelajaran dari bug pemotongan stok yang diperbaiki dengan endpoint Service Role khusus — lihat sys_uc_002.md)|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Menu baru/berubah tersimpan di `menu_items` sesuai aksi penjual|
|POST-002|`orders.status` berubah sesuai aksi penjual di Pesanan Masuk|
|POST-003|Dashboard dan Pesanan Masuk tersinkron otomatis lewat Realtime tanpa refresh manual|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-001|Penjual hanya dapat mengelola menu miliknya sendiri (`seller_id`)|
|BR-002|Grafik pendapatan hanya menghitung pesanan berbayar (bukan `menunggu-pembayaran`/`dibatalkan`)|
|BR-003|Filter default Pesanan Masuk: "Perlu Diterima" (`menunggu-konfirmasi`)|
|BR-004|Realtime disyaratkan diaktifkan manual untuk tabel `orders` di Supabase; tanpa itu aplikasi tetap berjalan dengan refresh manual|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-018|Dashboard|
|PAGE-019|Kelola Menu|
|PAGE-019-SUB-01|Tambah Menu|
|PAGE-019-SUB-02|Edit Menu|
|PAGE-020|Pesanan Masuk|
|PAGE-021|Ulasan|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|orders|KPI dashboard, daftar pesanan masuk|
|menu_items|Daftar menu milik penjual, deteksi menu habis|
|ratings|Ulasan & rating rata-rata toko|

## 10.2 Data Created

|Entity|Description|
|---|---|
|menu_items|Menu baru saat penjual menambah|

## 10.3 Data Updated

|Entity|Description|
|---|---|
|menu_items|Edit data, toggle ketersediaan|
|orders.status|Perubahan status oleh penjual|

## 10.4 Data Deleted

|Entity|Description|
|---|---|
|menu_items|Dihapus saat penjual klik "Hapus"|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|Penjual|AKSI (ALLOWED)|
|Siswa|DITOLAK — diarahkan ke `/beranda` jika mencoba akses|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Dashboard menampilkan KPI dan grafik pendapatan yang akurat dan real-time|
|AC-002|Penjual dapat CRUD menu lengkap termasuk upload foto|
|AC-003|Penjual dapat memproses pesanan masuk (terima/tolak/tandai siap) dengan status ter-update real-time|
|AC-004|Penjual dapat melihat seluruh ulasan & rata-rata rating tokonya|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F010|
|F011|
|F012|
|F013|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-018|
|PAGE-019|
|PAGE-020|
|PAGE-021|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|1.0|2026-07-11|System Analyst AI|Initial as-built draft|
