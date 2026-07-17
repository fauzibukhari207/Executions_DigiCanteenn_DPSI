# Information Architecture (IA) - Source of Truth #2

Document Version: v1.0

Project: DigiCanteen

Product: Aplikasi Pemesanan & Pembayaran Kantin Sekolah Berbasis Web

Status: Validated / Active (diturunkan dari struktur folder `app/` — Next.js App Router)

Last Updated: 2026-07-11

Author: System Analyst AI

---

## 1. DOCUMENT OVERVIEW

### 1.1 Purpose

Dokumen ini mendefinisikan Arsitektur Informasi (IA) DigiCanteen sebagai Source of Truth #2 (SoT-2), diturunkan dari SoT-1 (SRS v1.0) sekaligus disinkronkan dengan struktur route App Router yang benar-benar berjalan (`app/(auth)`, `app/(siswa)`, `app/(penjual)`, `app/profil`).

### 1.2 Related Sources of Truth

| Artifact | Reference | Description |
| --- | --- | --- |
| SoT-1 | SRS v1.0 | Spesifikasi kebutuhan perangkat lunak dasar. |
| SoT-3 | Design System | Token visual dan komponen UI. |
| SoT-4 | User Flows | Detail langkah operasional per use case. |
| SoT-6 | Data Model | Struktur data yang mendukung tiap halaman. |

---

## 2. PRODUCT STRUCTURE

### 2.1 Product Modules

| Module ID | Module Name | Description |
| --- | --- | --- |
| M001 | Authentication | Registrasi, login, dan proteksi akses (`RequireAuth`) untuk dua peran. |
| M002 | Siswa - Jelajah & Pesan | Landing siswa, katalog menu, detail menu, keranjang, checkout, pembayaran. |
| M003 | Siswa - Group Order | Membuat, bergabung, dan checkout bersama sesi pesan bareng. |
| M004 | Siswa - Meja & Poin | Check-in/check-out meja dan program poin/voucher. |
| M005 | Siswa - Riwayat & Rating | Riwayat pesanan dan pemberian rating menu. |
| M006 | Penjual - Operasional | Dashboard, kelola menu, pesanan masuk, ulasan. |
| M007 | Profil Bersama | Satu halaman profil yang kontennya menyesuaikan peran login. |

### 2.2 Module Hierarchy

```text
DigiCanteen (Root "/")
├── M001: Authentication
│   ├── Halaman Login (/login)
│   └── Halaman Register (/register)
├── M002: Siswa - Jelajah & Pesan
│   ├── Beranda (/beranda)
│   ├── Daftar Menu (/menu)
│   ├── Detail Menu (/menu/[id])
│   ├── Keranjang (/keranjang)
│   └── Checkout (/checkout)
├── M003: Siswa - Group Order
│   ├── Buat Group Order (/menu/grup/buat)
│   ├── Gabung Group Order (/menu/grup/[kode]/join)
│   └── Halaman Group Order (/menu/grup/[kode])
├── M004: Siswa - Meja & Poin
│   ├── Check-in Meja (/meja/checkin)
│   ├── Check-out Meja (/meja/checkout)
│   └── Poin & Voucher (/poin)
├── M005: Siswa - Riwayat & Rating
│   ├── Riwayat Pesanan (/pesanan)
│   └── Beri Rating (/rating/[orderId])
├── M006: Penjual - Operasional
│   ├── Dashboard (/dashboard)
│   ├── Kelola Menu (/kelola-menu)
│   ├── Tambah Menu (/kelola-menu/baru)
│   ├── Edit Menu (/kelola-menu/[id]/edit)
│   ├── Pesanan Masuk (/pesanan-masuk)
│   └── Ulasan (/ulasan)
├── M007: Profil Bersama (/profil)
└── DEV: Living Style Guide (/dev/style-guide) — bukan bagian alur pengguna akhir
```

---

## 3. SITE MAP

### 3.1 Navigation Tree

- **PAGE-001:** Landing `/` (Publik, redirect otomatis jika sudah login)
- **PAGE-002:** Login `/login` (Publik)
- **PAGE-003:** Register `/register` (Publik)
- **PAGE-004:** Beranda `/beranda` (Siswa)
- **PAGE-005:** Daftar Menu `/menu` (Siswa)
- **PAGE-006:** Detail Menu `/menu/[id]` (Siswa)
- **PAGE-007:** Keranjang `/keranjang` (Siswa)
- **PAGE-008:** Checkout `/checkout` (Siswa)
- **PAGE-009:** Buat Group Order `/menu/grup/buat` (Siswa)
- **PAGE-010:** Gabung Group Order `/menu/grup/[kode]/join` (Siswa)
- **PAGE-011:** Halaman Group Order `/menu/grup/[kode]` (Siswa)
- **PAGE-012:** Check-in Meja `/meja/checkin` (Siswa)
- **PAGE-013:** Check-out Meja `/meja/checkout` (Siswa)
- **PAGE-014:** Riwayat Pesanan `/pesanan` (Siswa)
- **PAGE-015:** Beri Rating `/rating/[orderId]` (Siswa)
- **PAGE-016:** Poin & Voucher `/poin` (Siswa)
- **PAGE-017:** Profil `/profil` (Siswa & Penjual)
- **PAGE-018:** Dashboard `/dashboard` (Penjual)
- **PAGE-019:** Kelola Menu `/kelola-menu` (Penjual)
- **PAGE-019-SUB-01:** Tambah Menu `/kelola-menu/baru` (Penjual)
- **PAGE-019-SUB-02:** Edit Menu `/kelola-menu/[id]/edit` (Penjual)
- **PAGE-020:** Pesanan Masuk `/pesanan-masuk` (Penjual)
- **PAGE-021:** Ulasan `/ulasan` (Penjual)

### 3.2 Navigation Type

| Navigation | Type | Behavior |
| --- | --- | --- |
| NavDrawer | Side Drawer (☰ dari AppHeader) | Muncul di **semua ukuran layar**, isi menyesuaikan status login & peran otomatis. |
| BottomNav | Bottom Tab Bar | Pelengkap navigasi cepat khusus mobile. |
| Ikon Keranjang | Header Shortcut | Menampilkan jumlah item asli dari `CartContext`, klik langsung ke `/keranjang`. |
| NotificationBell | Top-Right Dropdown | Isi berbeda per peran; klik notifikasi mengarah langsung ke halaman terkait. |
| SideNav (filter) | Contextual Panel | Filter kategori/diet di `/menu`, dapat dikontrol dari halaman induk. |

---

## 4. PAGE INVENTORY

| Page ID | Page Name | Module | Access Role | URL Path |
| --- | --- | --- | --- | --- |
| PAGE-001 | Landing | — | Publik (redirect jika login) | `/` |
| PAGE-002 | Login | M001 | Publik | `/login` |
| PAGE-003 | Register | M001 | Publik | `/register` |
| PAGE-004 | Beranda | M002 | Siswa | `/beranda` |
| PAGE-005 | Daftar Menu | M002 | Siswa | `/menu` |
| PAGE-006 | Detail Menu | M002 | Siswa | `/menu/[id]` |
| PAGE-007 | Keranjang | M002 | Siswa | `/keranjang` |
| PAGE-008 | Checkout | M002 | Siswa | `/checkout` |
| PAGE-009 | Buat Group Order | M003 | Siswa | `/menu/grup/buat` |
| PAGE-010 | Gabung Group Order | M003 | Siswa | `/menu/grup/[kode]/join` |
| PAGE-011 | Halaman Group Order | M003 | Siswa | `/menu/grup/[kode]` |
| PAGE-012 | Check-in Meja | M004 | Siswa | `/meja/checkin` |
| PAGE-013 | Check-out Meja | M004 | Siswa | `/meja/checkout` |
| PAGE-014 | Riwayat Pesanan | M005 | Siswa | `/pesanan` |
| PAGE-015 | Beri Rating | M005 | Siswa | `/rating/[orderId]` |
| PAGE-016 | Poin & Voucher | M004 | Siswa | `/poin` |
| PAGE-017 | Profil | M007 | Siswa & Penjual | `/profil` |
| PAGE-018 | Dashboard | M006 | Penjual | `/dashboard` |
| PAGE-019 | Kelola Menu | M006 | Penjual | `/kelola-menu` |
| PAGE-019-SUB-01 | Tambah Menu | M006 | Penjual | `/kelola-menu/baru` |
| PAGE-019-SUB-02 | Edit Menu | M006 | Penjual | `/kelola-menu/[id]/edit` |
| PAGE-020 | Pesanan Masuk | M006 | Penjual | `/pesanan-masuk` |
| PAGE-021 | Ulasan | M006 | Penjual | `/ulasan` |

---

## 5. PAGE DEFINITIONS

### Page ID: PAGE-001 — Landing

**Purpose:** Titik masuk aplikasi; menyapa pengguna baru dan mengarahkan pengguna yang sudah login ke area masing-masing.

**Entry Points:** Akses root URL `/`.

**Exit Points:** Belum login → tombol Masuk/Daftar. Sudah login → auto-redirect ke `/beranda` (siswa) atau `/dashboard` (penjual).

**Related User Flows:** UC-001.

**Required Permissions:** Publik.

---

### Page ID: PAGE-002 — Login

**Purpose:** Autentikasi pengguna terdaftar (Supabase Auth).

**Entry Points:** Landing, NavDrawer (tamu), redirect dari `RequireAuth` saat sesi tidak ada.

**Exit Points:** Sukses → redirect otomatis ke `/beranda` atau `/dashboard` sesuai `role` dari tabel `profiles`.

**Related User Flows:** UC-001.

**Required Permissions:** Publik. Sesi aktif yang mengakses `/login` di-redirect ke area masing-masing.

**Notes:** Layout `fixed inset-0` (bukan `min-h-screen`) agar presisi terhadap viewport asli di semua browser.

---

### Page ID: PAGE-003 — Register

**Purpose:** Pendaftaran akun baru dengan pemilihan peran Siswa/Penjual.

**Entry Points:** Landing, Login ("belum punya akun"), NavDrawer.

**Exit Points:** Sukses → redirect sesuai peran (atau perlu verifikasi email jika "Confirm email" aktif di Supabase).

**Related User Flows:** UC-001.

**Required Permissions:** Publik.

---

### Page ID: PAGE-004 — Beranda

**Purpose:** Sapaan personal, filter cepat, dan rekomendasi menu harian untuk siswa.

**Entry Points:** Login sukses (siswa), NavDrawer.

**Exit Points:** Klik menu → PAGE-006. Klik kategori → PAGE-005.

**Related User Flows:** UC-002.

**Required Permissions:** Siswa (RequireAuth role='siswa').

---

### Page ID: PAGE-005 — Daftar Menu

**Purpose:** Jelajah katalog menu lengkap dengan kategori, pencarian, dan filter diet.

**Entry Points:** Beranda, NavDrawer.

**Exit Points:** Klik menu → PAGE-006.

**Related User Flows:** UC-002.

**Required Permissions:** Siswa.

**Notes:** Sidebar kategori (`SideNav`) tampil hanya di layar ≥1024px (`lg:`); di bawah itu — termasuk tablet 768–1023px — kategori ditampilkan sebagai chip horizontal yang bisa discroll (`lg:hidden`).

---

### Page ID: PAGE-006 — Detail Menu

**Purpose:** Menampilkan galeri, statistik gizi, bahan, kustomisasi berbayar, rating rata-rata, dan tombol tambah ke keranjang.

**Entry Points:** PAGE-004, PAGE-005.

**Exit Points:** "Tambah ke Keranjang" → tetap di halaman (toast/update ikon keranjang) atau lanjut ke PAGE-007.

**Related User Flows:** UC-002.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-007 — Keranjang

**Purpose:** Kelola item pesanan (ubah jumlah/hapus), lihat ringkasan biaya, dan status Group Order aktif.

**Entry Points:** Ikon Keranjang di AppHeader, PAGE-006.

**Exit Points:** "Checkout" → PAGE-008. Buat/gabung grup → PAGE-009/PAGE-010.

**Related User Flows:** UC-002, UC-005.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-008 — Checkout

**Purpose:** Memilih slot waktu pengambilan dan metode bayar, lalu membuat pesanan dan memproses pembayaran.

**Entry Points:** PAGE-007.

**Exit Points:** Pembayaran sukses → PAGE-012 (ajakan check-in meja) atau PAGE-014.

**Related User Flows:** UC-002.

**Required Permissions:** Siswa.

**Notes:** Metode Saldo langsung memotong `wallet_balance`; metode QRIS menampilkan `QrisDisplay` dan polling status.

---

### Page ID: PAGE-009 — Buat Group Order

**Purpose:** Membuat sesi Group Order baru dan menghasilkan kode 6 karakter + link undangan.

**Entry Points:** PAGE-007 ("Buat Group Order").

**Exit Points:** → PAGE-011 (halaman grup).

**Related User Flows:** UC-005.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-010 — Gabung Group Order

**Purpose:** Bergabung ke Group Order via kode atau link undangan.

**Entry Points:** Link undangan, input manual kode di PAGE-007.

**Exit Points:** Sukses gabung → PAGE-011.

**Related User Flows:** UC-005.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-011 — Halaman Group Order

**Purpose:** Menampilkan daftar peran anggota (Host/Anggota) dan subtotal keranjang milik pengguna yang sedang login sendiri ("Kontribusimu") — **bukan** rincian kontribusi tiap anggota lain, dan tombol untuk lanjut checkout.

**Entry Points:** PAGE-009, PAGE-010.

**Exit Points:** "Checkout Group →" → PAGE-008 (memproses keranjang milik pengguna ini sendiri, bukan gabungan seluruh anggota — lihat catatan bug `groupOrderId` di sys_uc_003.md).

**Related User Flows:** UC-005.

**Required Permissions:** Siswa (anggota grup).

---

### Page ID: PAGE-012 — Check-in Meja

**Purpose:** Mencatat waktu siswa mulai menempati meja setelah pesanan siap diambil.

**Entry Points:** Notifikasi "Siap Diambil", PAGE-008/PAGE-014.

**Exit Points:** → PAGE-013 saat siswa selesai makan.

**Related User Flows:** UC-004.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-013 — Check-out Meja

**Purpose:** Menutup sesi meja; menghitung ketepatan waktu (≤15 menit) dan memberi poin jika memenuhi syarat. Otomatis menandai pesanan "Selesai Disajikan".

**Entry Points:** PAGE-012.

**Exit Points:** Halaman sukses → tombol langsung ke PAGE-015 (Beri Rating).

**Related User Flows:** UC-004.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-014 — Riwayat Pesanan

**Purpose:** Daftar seluruh pesanan siswa dengan status; tombol "Beri Rating" muncul otomatis untuk pesanan "Selesai Disajikan" yang belum dirating.

**Entry Points:** NavDrawer, notifikasi.

**Exit Points:** → PAGE-015.

**Related User Flows:** UC-006.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-015 — Beri Rating

**Purpose:** Memberi bintang (1–5) + komentar opsional untuk tiap menu dalam sebuah pesanan.

**Entry Points:** PAGE-013, PAGE-014.

**Exit Points:** Sukses submit → kembali ke PAGE-014.

**Related User Flows:** UC-006.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-016 — Poin & Voucher

**Purpose:** Menampilkan riwayat poin dan opsi tukar 100 poin menjadi voucher Rp5.000.

**Entry Points:** NavDrawer.

**Exit Points:** Tetap di halaman setelah penukaran (update saldo poin & daftar voucher).

**Related User Flows:** UC-004.

**Required Permissions:** Siswa.

---

### Page ID: PAGE-017 — Profil

**Purpose:** Menampilkan dan mengedit data profil; kontennya menyesuaikan peran login secara otomatis (satu halaman untuk kedua peran, sesuai keterbatasan Next.js route group).

**Entry Points:** NavDrawer.

**Exit Points:** "Logout" → PAGE-001.

**Related User Flows:** UC-001, UC-006, UC-007.

**Required Permissions:** Siswa & Penjual (konten berbeda per role, dijaga `RequireAuth` tanpa parameter `role`).

---

### Page ID: PAGE-018 — Dashboard

**Purpose:** Ringkasan operasional toko: pendapatan hari ini, jumlah pesanan, pesanan perlu diproses, jumlah menu habis, dan grafik pendapatan 7 hari/6 bulan.

**Entry Points:** Login sukses (penjual), NavDrawer.

**Exit Points:** Klik daftar pesanan mendesak → PAGE-020.

**Related User Flows:** UC-007.

**Required Permissions:** Penjual (RequireAuth role='penjual').

**Notes:** Data grafik dihitung dari pesanan yang sudah dibayar (bukan "Menunggu Pembayaran"/"Dibatalkan") milik penjual yang login, disinkron real-time.

---

### Page ID: PAGE-019 — Kelola Menu

**Purpose:** Daftar menu milik penjual dengan aksi Edit / Tandai Habis-Ada / Hapus.

**Entry Points:** NavDrawer, Dashboard.

**Exit Points:** "Tambah Menu" → PAGE-019-SUB-01. "Edit" → PAGE-019-SUB-02.

**Related User Flows:** UC-007.

**Required Permissions:** Penjual.

---

### Page ID: PAGE-019-SUB-01 / SUB-02 — Tambah/Edit Menu

**Purpose:** Form lengkap tambah/edit menu (nama, harga, kategori, gizi, bahan, badge, stok, status tersedia, upload foto).

**Entry Points:** PAGE-019.

**Exit Points:** Simpan → kembali ke PAGE-019.

**Related User Flows:** UC-007.

**Required Permissions:** Penjual.

---

### Page ID: PAGE-020 — Pesanan Masuk

**Purpose:** Daftar pesanan masuk dengan filter status; aksi "Terima Pesanan"/"Tolak" dan "Tandai Siap Diambil".

**Entry Points:** NavDrawer, Dashboard, NotificationBell.

**Exit Points:** Tetap di halaman (status ter-update real-time).

**Related User Flows:** UC-007.

**Required Permissions:** Penjual.

**Notes:** Filter default "Perlu Diterima" (`menunggu-konfirmasi`).

---

### Page ID: PAGE-021 — Ulasan

**Purpose:** Melihat seluruh rating & komentar siswa untuk menu milik penjual, dengan filter per menu dan ringkasan rating rata-rata toko.

**Entry Points:** NavDrawer.

**Exit Points:** —

**Related User Flows:** UC-006.

**Required Permissions:** Penjual.

---

## 6. USER NAVIGATION FLOWS

### Flow NF-001: Alur Pemesanan Utama Siswa

**Entry Page:** PAGE-004 (Beranda)

**Navigation Path:**

1. PAGE-004 (Beranda) → cari/klik menu
2. PAGE-005 atau langsung PAGE-006 (Detail Menu)
3. PAGE-006 → kustomisasi & "Tambah ke Keranjang"
4. PAGE-007 (Keranjang) → "Checkout"
5. PAGE-008 (Checkout) → pilih waktu & metode bayar → bayar
6. PAGE-012 (Check-in Meja) → PAGE-013 (Check-out, dapat poin)
7. PAGE-015 (Beri Rating)

**Exit Page:** PAGE-014 (Riwayat Pesanan)

**Related User Flows:** UC-002, UC-004, UC-006

---

### Flow NF-002: Alur Group Order

**Entry Page:** PAGE-007 (Keranjang)

**Navigation Path:**

1. PAGE-007 → "Buat Group Order"
2. PAGE-009 (dapat kode & link)
3. Bagikan link → teman membuka PAGE-010 (Gabung)
4. PAGE-011 (Halaman Group Order) — setiap anggota menambah pesanan ke keranjangnya masing-masing; halaman hanya menampilkan subtotal milik diri sendiri
5. Setiap anggota (bukan hanya host) klik "Checkout Group →" → PAGE-008, checkout dilakukan terpisah per-anggota dari keranjang masing-masing (bukan digabung menjadi satu pesanan)

**Exit Page:** PAGE-008 (Checkout)

**Related User Flows:** UC-005

---

### Flow NF-003: Alur Operasional Penjual

**Entry Page:** PAGE-018 (Dashboard)

**Navigation Path:**

1. PAGE-018 (lihat pesanan perlu diproses)
2. NavDrawer → PAGE-020 (Pesanan Masuk)
3. Klik "Terima Pesanan" → status `diproses`
4. Klik "Tandai Siap Diambil" → status `siap-diambil`
5. NavDrawer → PAGE-019 (Kelola Menu) → tambah/edit menu di PAGE-019-SUB-01/02
6. NavDrawer → PAGE-021 (Ulasan) → pantau rating pelanggan

**Exit Page:** PAGE-018 (Dashboard)

**Related User Flows:** UC-007

---

## 7. CONTENT HIERARCHY

### 7.1 Module: Siswa - Jelajah & Pesan

**Level 1:** Grid menu (Beranda/Daftar Menu) dengan Card + Badge.

**Level 2:** Detail menu (galeri, gizi, kustomisasi, rating), item Keranjang (kuantitas, opsi). *(Field `note` per item ada di data model tapi belum ada UI untuk mengisinya.)*

**Level 3:** Ringkasan checkout (subtotal, biaya layanan, total), pilihan metode bayar, tampilan QR/status pembayaran.

### 7.2 Module: Penjual - Operasional

**Level 1:** KPI Card Dashboard (pendapatan, jumlah pesanan, menu habis).

**Level 2:** Tabel/daftar menu (Kelola Menu) dan daftar pesanan (Pesanan Masuk) dengan filter status.

**Level 3:** Form detail menu (Tambah/Edit) dan aksi per-pesanan (Terima/Tolak/Siap).

---

## 8. ROUTING CONVENTIONS

| Page ID | Route | Access Type | Fallback/Redirect Rules |
| --- | --- | --- | --- |
| PAGE-001 | `/` | Public | Sudah login → redirect ke `/beranda` (siswa) atau `/dashboard` (penjual) |
| PAGE-002 | `/login` | Public | Sudah login → redirect ke area masing-masing |
| PAGE-003 | `/register` | Public | Sudah login → redirect ke area masing-masing |
| PAGE-004–016 | `/beranda`, `/menu`, `/menu/[id]`, `/keranjang`, `/checkout`, `/menu/grup/*`, `/meja/*`, `/pesanan`, `/rating/[orderId]`, `/poin` | Authenticated (siswa) | Belum login → `/login`; role salah → `/dashboard` |
| PAGE-017 | `/profil` | Authenticated (siswa/penjual) | Belum login → `/login` |
| PAGE-018–021 | `/dashboard`, `/kelola-menu`, `/kelola-menu/baru`, `/kelola-menu/[id]/edit`, `/pesanan-masuk`, `/ulasan` | Authenticated (penjual) | Belum login → `/login`; role salah → `/beranda` |
| DEV | `/dev/style-guide` | Internal/dev only | Bukan bagian alur pengguna akhir |

---

## 9. TRACEABILITY MATRIX (SRS v1.0 → IA v1.0)

| Feature ID | Feature Name | Mapped Page ID |
| --- | --- | --- |
| F001 | Registrasi & Login | PAGE-002, PAGE-003 |
| F002 | Jelajah & Detail Menu | PAGE-004, PAGE-005, PAGE-006 |
| F003 | Keranjang & Checkout | PAGE-007, PAGE-008 |
| F004 | Pembayaran QRIS/Saldo | PAGE-008 |
| F005 | Group Order | PAGE-009, PAGE-010, PAGE-011 |
| F006 | Check-in/Check-out & Poin | PAGE-012, PAGE-013, PAGE-016 |
| F007 | Poin & Voucher | PAGE-016 |
| F008 | Rating Makanan | PAGE-015 |
| F009 | Riwayat Pesanan | PAGE-014 |
| F010 | Dashboard Penjual | PAGE-018 |
| F011 | Kelola Menu Penjual | PAGE-019, PAGE-019-SUB-01, PAGE-019-SUB-02 |
| F012 | Pesanan Masuk Penjual | PAGE-020 |
| F013 | Ulasan Penjual | PAGE-021 |
| F014 | Notifikasi & Realtime | AppHeader/NotificationBell (semua halaman) |
