# Software Requirements Specification (SRS)

Document Version: v1.0

Project: DigiCanteen

Product: Aplikasi Pemesanan & Pembayaran Kantin Sekolah Berbasis Web

Status: As-Built (diturunkan dari kode aplikasi yang sudah berjalan)

Last Updated: 2026-07-11

Author: System Analyst AI

# 1. INTRODUCTION

## 1.1 Purpose

Dokumen ini mendefinisikan spesifikasi kebutuhan fungsional dan non-fungsional untuk **DigiCanteen**, aplikasi web pemesanan makanan/minuman kantin sekolah. Berbeda dari SRS konvensional yang ditulis sebelum development, dokumen ini bersifat **as-built**: diturunkan dengan menelusuri kode sumber aplikasi (`digicanteen-app`) yang sudah dibangun bertahap (Batch 1–8 + beberapa perbaikan pasca-migrasi Supabase), sehingga berfungsi sebagai *source of truth* (SoT-1) yang benar-benar sinkron dengan implementasi saat ini, dan menjadi acuan untuk artefak turunan (User Flows, Data Model, Design System, Test Cases).

## 1.2 Scope

### Business Goals

* Mendigitalisasi proses pemesanan makanan di kantin sekolah agar siswa tidak perlu mengantre fisik saat memesan.
* Memberi penjual kantin alat kelola menu, stok, dan pesanan masuk secara real-time.
* Mengurangi penumpukan siswa di meja/counter lewat mekanisme check-in/check-out meja dan slot waktu pengambilan.
* Meningkatkan keterlibatan siswa lewat program poin & voucher, serta pemesanan berkelompok (Group Order).
* Menyediakan pembayaran non-tunai (QRIS via Xendit, atau saldo internal) agar transaksi tercatat rapi.

### In Scope

* Registrasi & login dua peran: **Siswa** dan **Penjual** (Supabase Auth + tabel `profiles`).
* Jelajah & pencarian menu, filter kategori dan diet (Healthy/Kids/Halal), lihat detail menu (gizi, bahan, kustomisasi, rating rata-rata).
* Keranjang belanja dengan kustomisasi opsi berbayar. (Kolom `note` per item tersedia di tipe data & `CartContext.addItem()`, tapi **tidak ada input UI di halaman manapun** untuk mengisinya — kapasitas yang belum terhubung ke antarmuka.)
* **Group Order**: buat sesi pesan bareng (kode 6 karakter), gabung via kode/link, checkout kontribusi masing-masing anggota.
* Checkout: pilih slot waktu pengambilan, metode bayar (QRIS atau Saldo).
* Pembayaran QRIS terintegrasi Xendit (mode sandbox otomatis kalau API key belum diisi) dan pembayaran Saldo (potong `wallet_balance`).
* Alur status pesanan bertahap: `menunggu-pembayaran` → `menunggu-konfirmasi` → `diproses` → `siap-diambil` → `selesai-disajikan` (dengan opsi `dibatalkan`), termasuk pemotongan stok otomatis & idempoten saat pembayaran dikonfirmasi.
* Check-in dan check-out meja dengan timer, pemberian poin jika check-out ≤ 15 menit.
* Program Poin & Voucher: riwayat poin, tukar 100 poin menjadi voucher Rp5.000.
* Rating makanan per menu dalam sebuah pesanan (1–5 bintang + komentar opsional), rata-rata rating tampil di halaman menu.
* Dashboard penjual: ringkasan pendapatan & pesanan hari ini, grafik pendapatan 7 hari/6 bulan.
* Kelola Menu penjual: tambah/edit/hapus/tandai habis, upload foto menu ke Supabase Storage.
* Pesanan Masuk penjual: terima/tolak, tandai siap diambil, filter status.
* Ulasan penjual: lihat semua rating & komentar dari siswa untuk menu miliknya.
* Notifikasi lonceng (berbeda konten per peran) dan sinkronisasi real-time (Supabase Realtime) untuk Pesanan Masuk, Dashboard, Riwayat Pesanan, dan Notifikasi.
* Proteksi akses berbasis peran (RequireAuth) di semua halaman siswa/penjual.

### Out of Scope

* Manajemen multi-kantin/multi-sekolah dalam satu instance (saat ini semua penjual berbagi satu ruang data — belum ada tenant terpisah).
* Integrasi metode pembayaran kartu kredit/debit langsung (hanya QRIS via Xendit dan saldo internal).
* Sistem membership/langganan berbayar.
* Retur/refund otomatis pasca-pesanan selesai dibayar.
* Aplikasi mobile native (saat ini web responsif saja).

## 1.3 Stakeholders

| Stakeholder | Role | Responsibility |
| --- | --- | --- |
| Pemilik Produk / Klien | Project Sponsor | Memberikan arahan kebutuhan bisnis dan menyetujui rilis fitur per batch. |
| Siswa | End User (Pemesan) | Memesan makanan, membayar, check-in/check-out meja, memberi rating. |
| Penjual Kantin | End User (Pengelola) | Mengelola menu & stok, memproses pesanan masuk, memantau pendapatan dan ulasan. |
| System Analyst | Author | Menyusun dan memperbarui dokumentasi *Source of Truth* (SoT) berdasarkan kode yang berjalan. |

## 1.4 Definitions

| Term | Definition |
| --- | --- |
| Siswa | Peran pengguna yang memesan menu, membayar, dan menggunakan meja kantin. |
| Penjual | Peran pengguna yang memiliki dan mengelola menu, memproses pesanan. |
| Group Order | Sesi pemesanan bersama beberapa siswa dengan satu kode undangan 6 karakter. |
| QRIS | Quick Response Code Indonesian Standard, metode pembayaran non-tunai via Xendit. |
| Check-in/Check-out Meja | Mekanisme pencatatan waktu siswa menempati meja setelah mengambil pesanan; check-out tepat waktu (≤15 menit) memberi poin. |
| Poin | Satuan reward yang didapat siswa dari check-out tepat waktu, dapat ditukar voucher. |
| RLS | Row Level Security, kebijakan akses baris data di database Supabase (PostgreSQL). |
| SoT | Source of Truth, dokumen acuan utama pengembangan. |

## 1.5 References

* Kode sumber aplikasi: `digicanteen-app` (Next.js 14 App Router + TypeScript + Tailwind + Supabase + Xendit).
* `README.md` proyek (riwayat pengembangan Batch 1–8 dan perbaikan pasca-migrasi Supabase).
* `lib/types.ts` (definisi tipe data & `BUSINESS_RULES`).

# 2. PRODUCT OVERVIEW

## 2.1 Product Summary

DigiCanteen adalah sistem pemesanan kantin sekolah berbasis web yang menghubungkan siswa dan penjual kantin dalam satu platform. Siswa dapat menelusuri menu, memesan sendiri atau beramai-ramai (Group Order), membayar via QRIS atau saldo, mengambil pesanan di meja dengan mekanisme check-in/check-out yang memberi insentif poin untuk kedisiplinan waktu, lalu memberi rating. Penjual mendapat dashboard operasional untuk mengelola katalog menu, memproses antrean pesanan masuk, dan memantau performa penjualan serta ulasan pelanggan.

## 2.2 User Types

| User Type | Description |
| --- | --- |
| Siswa | Pengguna yang menelusuri menu, memesan, membayar, check-in/out meja, mengumpulkan poin, dan memberi rating. |
| Penjual | Pengguna yang mengelola menu/stok miliknya, memproses pesanan masuk, dan memantau pendapatan serta ulasan. |

## 2.3 User Goals

### User Type: Siswa

* Dapat menemukan menu dengan cepat lewat kategori, pencarian, dan filter diet.
* Dapat memesan sendiri atau bersama teman (Group Order) tanpa perlu mengantre fisik.
* Dapat membayar dengan QRIS atau saldo secara aman dan terpantau statusnya.
* Dapat mengambil pesanan di meja dengan proses check-in/out yang jelas dan mendapat insentif poin.
* Dapat memberi rating dan melihat riwayat pesanannya.

### User Type: Penjual

* Dapat menambah, mengedit, dan menandai habis menu miliknya dengan cepat, termasuk mengunggah foto.
* Dapat memantau dan memproses pesanan masuk (terima/tolak/tandai siap) tanpa perlu refresh manual.
* Dapat melihat ringkasan pendapatan harian/mingguan/bulanan dan ulasan pelanggan dalam satu dashboard.

## 2.4 Operating Environment

* **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS.
* **Backend/Database:** Supabase (PostgreSQL + Auth + Storage + Realtime).
* **Payment Gateway:** Xendit (QRIS), dengan fallback mode sandbox otomatis (QR asli, auto "PAID" ±8 detik) bila `XENDIT_SECRET_KEY` belum diisi.
* **Deployment:** Cloud hosting (kompatibel Vercel/Node.js runtime untuk API routes).
* **Browser Support:** Google Chrome, Mozilla Firefox, Microsoft Edge, Safari (versi terbaru).
* **Device Support:** Responsive web layout (desktop, tablet, dan mobile/HP siswa).

## 2.5 Assumptions

* Siswa dan penjual mengakses aplikasi dari perangkat dengan koneksi internet stabil di lingkungan sekolah.
* Setiap penjual sudah mendaftar akun dan mengisi menunya sendiri sebelum siswa dapat memesan (tidak ada data seed otomatis pasca-migrasi Supabase).
* Bucket Storage `menu-images` di Supabase sudah dibuat secara manual agar upload foto menu berfungsi.
* Realtime PostgreSQL sudah diaktifkan untuk tabel `orders` agar sinkronisasi otomatis berjalan (tanpa ini aplikasi tetap berjalan dengan refresh manual).

## 2.6 Constraints

* Karena semua menu contoh awalnya memakai `seller_id` yang sama saat testing, pemisahan data antar-toko baru benar-benar teruji penuh setelah banyak akun penjual asli terdaftar.
* Akun Xendit yang dipakai belum terverifikasi bisnis, sehingga QR yang dihasilkan pada mode API asli belum bisa menerima pembayaran sungguhan (disediakan tombol simulasi pembayaran sebagai jalan tengah untuk pengujian end-to-end).
* Validasi kepemilikan menu di level UI (role-check dasar) belum sepenuhnya menggantikan Row Level Security di database untuk semua kasus tepi.
* **Voucher belum terhubung ke Checkout.** Siswa dapat menukar poin menjadi voucher dan melihatnya di `/poin`, tapi kolom `orders.discount` selalu 0 saat pesanan dibuat — belum ada UI/logika untuk memilih dan menerapkan voucher saat checkout. F007 (Poin & Voucher) baru terimplementasi sebagian.

# 3. CORE BUSINESS OBJECTS

| Object | Description |
| --- | --- |
| Profile (User) | Akun siswa/penjual: nama, email, role, saldo dompet, poin. |
| MenuItem | Item menu milik seorang penjual: harga, kategori, badge, gizi, bahan, opsi kustom, stok, status tersedia. |
| Order | Pesanan siswa: daftar item, subtotal, biaya layanan, total, waktu ambil, status, metode bayar. |
| GroupOrder | Sesi pesan bareng: kode unik, host, anggota, status. |
| QrisPayment | Transaksi pembayaran QRIS: referensi Xendit, string QR, status. |
| TableCheckIn | Sesi check-in/check-out meja: waktu masuk/keluar, ketepatan waktu, poin didapat. |
| Rating | Penilaian bintang + komentar untuk kombinasi pesanan & menu. |
| PointHistoryEntry | Riwayat penambahan/pengurangan poin siswa. |
| Voucher | Hasil penukaran poin: nilai diskon, status pemakaian. |

# 4. FUNCTIONAL REQUIREMENTS

| Feature ID | Feature Name | Description |
| --- | --- | --- |
| F001 | Registrasi & Login | Siswa/penjual mendaftar dan masuk lewat Supabase Auth; peran diambil otomatis dari tabel `profiles`. |
| F002 | Jelajah & Detail Menu | Pencarian, filter kategori/diet, dan halaman detail lengkap termasuk rating rata-rata. |
| F003 | Keranjang & Checkout | Kelola item keranjang (localStorage), pilih slot waktu, pilih metode bayar, buat pesanan. |
| F004 | Pembayaran QRIS/Saldo | Pembuatan QR via Xendit (atau sandbox), polling status, potong saldo untuk metode Saldo, konfirmasi pembayaran server-side dengan pemotongan stok idempoten. |
| F005 | Group Order | Membuat, bergabung, dan checkout bersama dalam satu sesi Group Order. |
| F006 | Check-in/Check-out Meja & Poin | Mulai sesi meja, tutup sesi dengan penghitungan ketepatan waktu dan poin. |
| F007 | Poin & Voucher | Riwayat poin dan penukaran poin menjadi voucher diskon. |
| F008 | Rating Makanan | Beri rating per menu dalam pesanan yang berstatus "Selesai Disajikan". |
| F009 | Riwayat Pesanan | Daftar pesanan siswa dengan status dan aksi beri rating. |
| F010 | Dashboard Penjual | Ringkasan KPI hari ini dan grafik pendapatan 7 hari/6 bulan. |
| F011 | Kelola Menu Penjual | CRUD menu, toggle ketersediaan, upload foto. |
| F012 | Pesanan Masuk Penjual | Terima/tolak/tandai siap pesanan dengan filter status. |
| F013 | Ulasan Penjual | Lihat rating & komentar seluruh menu milik penjual. |
| F014 | Notifikasi & Realtime Sync | Notifikasi kontekstual per peran dan sinkronisasi otomatis data pesanan. |

# 5. NON-FUNCTIONAL REQUIREMENTS

## 5.1 Performance

* Query menu dan pesanan menggunakan index alami Supabase (`created_at`, foreign key); halaman menampilkan status "Memuat..." saat data belum tersedia, tanpa memblokir render awal.
* Kalkulasi total keranjang dioptimalkan agar query harga menu dilakukan sekali per kombinasi baris (bukan per baris satu-satu).

## 5.2 Security

* Autentikasi via Supabase Auth (email/password); peran disimpan di tabel `profiles`, tidak dapat dipilih manual saat login.
* Row Level Security (RLS) membatasi penjual hanya dapat mengubah data miliknya; operasi lintas-peran sensitif (potong stok, ubah status pesanan dari sisi siswa) dilakukan lewat API route server yang memakai `SUPABASE_SERVICE_ROLE_KEY` (tidak pernah dikirim ke browser).
* Semua halaman siswa/penjual dijaga komponen `RequireAuth`: belum login → redirect `/login`; role salah → redirect ke area yang sesuai.

## 5.3 Reliability & Data Integrity

* Endpoint konfirmasi pembayaran (`/api/orders/confirm-payment`) bersifat idempoten — pemanggilan berulang untuk pesanan yang sama tidak memotong stok dua kali.
* Validasi format UUID pada ID menu sebelum query ke database untuk mencegah error keras dari data lama yang tidak valid (sisa localStorage sebelum migrasi).
* Rating memakai `upsert` dengan kunci unik (`order_id`, `menu_item_id`, `student_id`) sehingga pengiriman ulang menimpa rating lama, bukan menduplikasi.

## 5.4 Usability

* Desain mengikuti Design System Neo-Brutalist (border tegas, shadow offset, efek "squishy"/"liftable") untuk memberi umpan balik visual instan pada setiap interaksi.
* Navigasi konsisten lewat `NavDrawer` yang tersedia di semua ukuran layar (bukan hanya `BottomNav` mobile).

## 5.5 Compatibility

* Checkout tetap dapat diuji end-to-end tanpa kredensial Xendit sungguhan lewat mode sandbox QR otomatis.
* Aplikasi tidak crash meski `.env.local` kosong — halaman terproteksi menampilkan status memuat, bukan error.

# 6. BUSINESS RULES (RINGKASAN)

| Rule ID | Description |
| --- | --- |
| BR-001 | Biaya layanan flat `SERVICE_FEE` = Rp2.000 per transaksi. |
| BR-002 | Batas waktu check-out meja untuk dapat poin: `CHECKOUT_TIME_LIMIT_MINUTES` = 15 menit. |
| BR-003 | Poin didapat per check-out tepat waktu: `POINTS_PER_ON_TIME_CHECKOUT` = 10 poin. |
| BR-004 | Rasio tukar poin ke voucher: `POINTS_TO_VOUCHER_RATIO` = 100 poin. |
| BR-005 | Nilai diskon voucher: `VOUCHER_DISCOUNT_AMOUNT` = Rp5.000. |
| BR-006 | Status pesanan hanya boleh maju sesuai urutan: `menunggu-pembayaran` → `menunggu-konfirmasi` → `diproses` → `siap-diambil` → `selesai-disajikan`, atau berpindah ke `dibatalkan` sebelum selesai. |
| BR-007 | Stok menu dikurangi otomatis (minimal 0) saat pesanan dikonfirmasi dibayar, bukan saat dipesan. |
| BR-008 | Group Order hanya dapat diikuti selama statusnya `terbuka`; kode terdiri dari 6 karakter tanpa 0/O dan 1/I. |
| BR-009 | Metode bayar Saldo ditolak jika `walletBalance` siswa kurang dari total pesanan. |

# 7. TRACEABILITY (Fitur → Aktor)

| Feature ID | Primary Actor |
| --- | --- |
| F001 | Siswa, Penjual |
| F002, F003, F004, F005, F006, F007, F008, F009 | Siswa |
| F010, F011, F012, F013 | Penjual |
| F014 | Siswa, Penjual |
