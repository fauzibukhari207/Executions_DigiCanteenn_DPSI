# Design System (DS) - Source of Truth #3

Document Version: v3.0

Project: DigiCanteen

Product: Aplikasi Pemesanan & Pembayaran Kantin Sekolah Berbasis Web

Status: Validated / Active (diturunkan dari `tailwind.config.ts`, `app/globals.css`, dan `components/ui/*`)

Last Updated: 2026-07-11

Author: System Analyst AI

Style Name: **Neo-Brutalist** (nama prototipe awal "KantinKita" → nama produk final "DigiCanteen")

---

## 1. DOCUMENT OVERVIEW

### 1.1 Purpose

Dokumen ini mendefinisikan bahasa visual, standar interaksi, dan komponen UI reusable pada seluruh antarmuka DigiCanteen. Sebagai Source of Truth #3 (SoT-3), dokumen ini diturunkan dari SoT-1 (SRS v1.0) dan SoT-2 (Information Architecture), serta menjadi rujukan mutlak untuk implementasi Frontend (`tailwind.config.ts`, `app/globals.css`, `components/ui/*`) agar seluruh layar konsisten.

### 1.2 Related Sources of Truth

| Artifact | Reference | Description |
| --- | --- | --- |
| SoT-1 | SRS v1.0 | Spesifikasi kebutuhan perangkat lunak DigiCanteen. |
| SoT-2 | Information Architecture | Struktur navigasi, peta situs, dan routing. |
| SoT-4 | User Flows | Rangkaian langkah interaksi per use case. |
| SoT-6 | Data Model | Struktur data yang mendasari tampilan (menu, pesanan, dsb). |

---

## 2. DESIGN PRINCIPLES

### 2.1 Design Goals

- **Umpan Balik Fisik (Tactile Feedback):** Setiap elemen yang bisa diklik terasa "ditekan" secara visual, meniru interaksi objek nyata.
- **Kejelasan Tanpa Basa-basi:** Border tegas 2–5px dan tanpa radius (kecuali elemen bulat penuh) membuat batas antar-elemen selalu jelas, cocok untuk siswa yang terburu-buru saat jam istirahat.
- **Energik & Playful:** Palet warna oranye-kuning-merah yang hangat, sesuai identitas kantin sekolah, bukan aplikasi korporat yang kaku.

### 2.2 UX Principles

- **Instant Feedback:** Tombol dan kartu memakai efek `.squishy` (bergeser 3px + shadow hilang saat ditekan) dan `.liftable` (terangkat saat hover) — lihat `app/globals.css`.
- **Konsistensi Lintas Peran:** Komponen UI dasar (`Button`, `Card`, `Badge`, `Chip`, `Input`, dst.) dipakai bersama oleh alur Siswa maupun Penjual, hanya konten dan warna aksen yang berbeda per konteks.
- **Aman dari Kesalahan:** Aksi destruktif (hapus item keranjang, hapus menu, tolak pesanan) memakai varian tombol `danger` dengan warna `error` agar kontras dari aksi normal.

---

## 3. BRAND FOUNDATION

### 3.1 Brand Personality

- **Hangat & Menggugah Selera:** Warna primer oranye terbakar (`primary-container #ff5f1f`) merepresentasikan energi jajanan kantin.
- **Jujur & Tegas (Neo-Brutalist):** Tanpa gradient halus atau shadow lembut — semua elemen memakai *hard shadow* offset (`4px 4px 0px #1b1b1b`) dan border solid hitam.
- **Ramah Segala Usia:** Tipografi besar dan tebal (Archivo Narrow, weight 700–900) mudah dibaca cepat oleh siswa maupun penjual di tengah keramaian kantin.

### 3.2 Visual Characteristics

- **Bentuk Sudut:** Radius **0px** di semua ukuran (`sm`/`md`/`lg`/`xl`), kecuali `full` (9999px) untuk elemen bulat seperti avatar/lonceng notifikasi. Ini adalah identitas utama gaya Neo-Brutalist DigiCanteen.
- **Kedalaman Visual:** Bukan soft shadow, melainkan *offset hard shadow* solid warna outline (`#1b1b1b`) di 4 tingkat: `sm` (4px), `md` (6px), `lg` (8px), `xl` (12px).
- **Border Tebal:** Lebar border kustom 2px (default), 3px, 4px, hingga 5px — dipakai konsisten pada Button, Card, Chip, Badge, Input.

---

## 4. COLOR SYSTEM

Token warna diambil langsung dari `tailwind.config.ts theme.extend.colors` — jangan mengubah nilai di sini tanpa mengubah dokumen SoT ini terlebih dahulu.

### 4.1 Surface & Background

| Token | Hex Value | Usage |
| --- | --- | --- |
| background / surface | `#f9f9f9` | Latar utama halaman |
| surface-container-lowest | `#ffffff` | Latar kartu/komponen mengambang (Card, Input) |
| surface-container-low | `#f3f3f3` | Latar sekunder |
| surface-container | `#eeeeee` | Latar netral (mis. Badge netral) |
| surface-container-high | `#e8e8e8` | Latar hover/aktif ringan |
| surface-container-highest | `#e2e2e2` | Latar penekanan tertinggi non-warna |
| surface-variant | `#e2e2e2` | Variasi latar |
| surface-dim | `#dadada` | Latar redup (disabled) |

### 4.2 On-Surface & Outline

| Token | Hex Value | Usage |
| --- | --- | --- |
| on-background / on-surface | `#1b1b1b` | Teks utama di atas latar terang |
| on-surface-variant | `#5b4138` | Teks sekunder (coklat kemerahan hangat) |
| inverse-on-surface | `#f1f1f1` | Teks di atas latar gelap |
| outline / outline-variant | `#1b1b1b` | Warna border & shadow solid di seluruh komponen |

### 4.3 Primary (Aksen Utama — Oranye Terbakar)

| Token | Hex Value | Usage |
| --- | --- | --- |
| primary | `#ab3600` | Teks/ikon aksen di atas latar terang |
| primary-container | `#ff5f1f` | Latar tombol utama (CTA "Tambah ke Keranjang", "Bayar", dll.) |
| primary-fixed | `#ffdbcf` | Latar aksen lembut |
| on-primary | `#ffffff` | Teks di atas primary-container |
| on-primary-container | `#561700` | Teks di atas primary-fixed |

### 4.4 Secondary (Aksen Kuning — Poin & Highlight)

| Token | Hex Value | Usage |
| --- | --- | --- |
| secondary | `#7a5900` | Teks/ikon aksen kuning tua |
| secondary-container | `#fcbc05` | Latar Badge "Kids Favorite", Chip aktif, elemen Poin |
| secondary-fixed | `#ffdea2` | Latar aksen lembut kuning |
| on-secondary / on-secondary-container | `#ffffff` / `#6b4e00` | Teks kontras |

### 4.5 Tertiary (Aksen Merah — Best Seller/Rating)

| Token | Hex Value | Usage |
| --- | --- | --- |
| tertiary | `#bf0025` | Badge "Best Seller", bintang rating aktif |
| tertiary-container | `#ff5b5e` | Latar aksen merah muda |
| on-tertiary / on-tertiary-container | `#ffffff` / `#61000e` | Teks kontras |

### 4.6 Error

| Token | Hex Value | Usage |
| --- | --- | --- |
| error | `#ba1a1a` | Tombol `danger` (hapus, tolak pesanan), status "Menunggu Konfirmasi" |
| error-container | `#ffdad6` | Latar pesan error lembut |
| on-error / on-error-container | `#ffffff` / `#93000a` | Teks kontras |

---

## 5. TYPOGRAPHY

### 5.1 Font Family

| Token | Font | Usage |
| --- | --- | --- |
| sans (`--font-archivo`) | Archivo Narrow | Font utama seluruh teks UI |
| mono (`--font-jetbrains`) | JetBrains Mono | Label, tombol, angka harga — memberi kesan "struk/kode" khas kasir |

### 5.2 Type Scale

| Token | Size / Line-height | Weight | Usage |
| --- | --- | --- | --- |
| display-xl | 80px / 80px, tracking -0.04em | 900 | Hero landing page |
| headline-lg | 48px / 52px, tracking -0.02em | 800 | Judul halaman besar (desktop) |
| headline-lg-mobile | 32px / 36px, tracking -0.02em | 800 | Judul halaman besar (mobile) |
| headline-md | 24px / 28px | 800 | Judul section, nama menu di kartu |
| body-lg | 18px / 28px | 500 | Paragraf penekanan |
| body-md | 16px / 24px | 500 | Paragraf standar |
| label-bold | 14px / 16px, tracking 0.05em | 700 | Teks tombol, label form (UPPERCASE, font mono) |
| label-sm | 12px / 14px | 500 | Caption, badge, metadata |

---

## 6. SPACING, RADIUS & ELEVATION

### 6.1 Spacing

| Token | Value | Usage |
| --- | --- | --- |
| unit | 4px | Satuan dasar spacing |
| gutter | 24px | Jarak antar-kolom grid |
| margin | 32px | Margin luar section |

### 6.2 Border Radius

| Token | Value | Usage |
| --- | --- | --- |
| none / sm / md / lg / xl | 0px | Semua komponen persegi — identitas Neo-Brutalist |
| full | 9999px | Elemen bulat penuh: avatar, ikon lonceng, badge angka notifikasi |

### 6.3 Border Width

| Token | Value | Usage |
| --- | --- | --- |
| DEFAULT | 2px | Border standar (Badge, Input) |
| 3 | 3px | Border Button, Card, Chip |
| 4 | 4px | Border penekanan (Card besar) |
| 5 | 5px | Border ekstra tebal (elemen hero) |

### 6.4 Shadow (Hard Shadow Offset)

| Token | Value | Usage |
| --- | --- | --- |
| sm | `4px 4px 0px #1b1b1b` | Chip, elemen kecil |
| DEFAULT / md | `6px 6px 0px #1b1b1b` | Button, Input |
| lg | `8px 8px 0px #1b1b1b` | Card (default) |
| xl | `12px 12px 0px #1b1b1b` | Card ditekankan/hover |
| none | `none` | Saat elemen "ditekan" (state `.squishy:active`) |

---

## 7. INTERACTION PATTERNS

### 7.1 `.squishy` — Efek Tertekan

Dipakai pada semua elemen yang dapat diklik (Button, Chip, Checkbox). Saat `:active`, elemen bergeser `translate(3px, 3px)` dan shadow hilang (`box-shadow: none`), mensimulasikan tombol fisik yang ditekan ke dalam. Transisi 100ms.

### 7.2 `.liftable` — Efek Terangkat

Dipakai pada Card yang dapat diklik (mis. `MenuCard`). Saat `:hover`, elemen bergeser `translate(-4px, -4px)` seolah terangkat dari permukaan. Transisi 200ms.

### 7.3 Brutal Checkbox

Checkbox kustom persegi (bukan bulat bawaan browser): 22×22px, border 2px, tercentang menampilkan latar `primary-container` + tanda centang (✓).

---

## 8. CORE COMPONENTS

### 8.1 Button (`components/ui/Button.tsx`)

| Variant | Style |
| --- | --- |
| primary | Latar `primary-container`, teks `on-primary` — CTA utama |
| secondary | Latar `secondary-container`, teks `on-surface` — aksi sekunder |
| outline | Latar `surface-container-lowest`, teks `on-surface` — aksi netral |
| danger | Latar `error`, teks `on-error` — aksi destruktif |

Semua varian: border 3px, shadow `md`, font mono `label-bold` uppercase, efek `.squishy`, dan state `disabled` menonaktifkan efek tekan.

### 8.2 Card (`components/ui/Card.tsx`)

Latar `surface-container-lowest`, border 3px, shadow `lg`. Prop `lift` (default `true`) menambahkan efek `.liftable` + shadow `xl` saat hover dan kursor pointer — dipakai untuk kartu yang dapat diklik (MenuCard); set `lift={false}` untuk kartu statis (ringkasan pesanan).

### 8.3 Badge (`components/ui/Badge.tsx`)

Border 2px, font mono `label-sm` uppercase bold. Tone: `tertiary` (Best Seller), `secondary` (Kids Favorite), `primary` (Healthy Choice), `error` (Habis/peringatan), `neutral` (default).

### 8.4 Chip (`components/ui/Chip.tsx`)

Filter kategori/diet horizontal. Border 3px, shadow `sm`, efek `.squishy`. State aktif memakai latar `secondary-container` sambil tetap menampilkan shadow (berbeda dari kategori SideNav yang memakai efek "tertekan" penuh).

### 8.5 Input & QuantityStepper

Input teks/angka bergaya sama (border tebal, shadow, tanpa radius). QuantityStepper memakai dua tombol persegi `+`/`−` mengapit angka kuantitas, dipakai di Detail Menu dan Cart Item Card (Keranjang) — dua ukuran (`default`/`compact`). **Catatan:** field "Stok" di form Kelola Menu (Tambah/Edit Menu) memakai `Input` angka biasa, **bukan** QuantityStepper.

### 8.6 RoleToggle

Dipakai **hanya di form Register** untuk memilih peran Siswa/Penjual saat mendaftar — dua tombol bersisian dengan state aktif "tertekan" (translate + shadow hilang). **Tidak dipakai di halaman Login** — sejak migrasi ke Supabase Auth, peran ditentukan otomatis dari tabel `profiles`, bukan dipilih manual saat login.

### 8.7 StarRatingInput

Bintang interaktif bergaya kotak. Preview hover memakai border putus-putus; bintang yang benar-benar sudah diklik memakai latar kuning solid (`secondary-container`) — dibedakan secara visual agar tidak tertukar dengan preview hover.

---

## 9. LAYOUT COMPONENTS

| Component | Description |
| --- | --- |
| AppHeader | Header atas berisi logo, tombol menu (☰) pembuka NavDrawer, ikon Keranjang (dengan badge jumlah item), dan NotificationBell. |
| NavDrawer | Navigasi utama berbentuk drawer samping, tampil di semua ukuran layar. Isi menyesuaikan status login & peran (Siswa/Penjual/Tamu). |
| BottomNav | Navigasi cepat di bagian bawah layar mobile (pelengkap NavDrawer, bukan pengganti). |
| SideNav | Panel filter/kategori yang dapat dikontrol dari halaman induk (dipakai di `/menu` untuk filter diet). |
| Footer | Footer sederhana di halaman publik/landing. |
| NotificationBell | Ikon lonceng dengan dropdown notifikasi kontekstual per peran. |

---

## 10. ICONOGRAPHY

DigiCanteen memakai emoji sebagai ikon ringan (bukan icon-font/SVG library) untuk kecepatan development dan kesan playful, misalnya: 🏠 Beranda, 🍽️ Daftar Menu, 🛒 Keranjang, 🧾 Riwayat Pesanan, 💳 Poin & Voucher, 👤 Profil, 📊 Dasbor, 🍱 Kelola Menu, ⭐ Ulasan, 🔔 Notifikasi.

---

## 11. RESPONSIVE RULES

| Breakpoint | Behavior |
| --- | --- |
| Mobile & Tablet Kecil (< 768px) | `BottomNav` tampil untuk navigasi cepat (`md:hidden`); kategori Daftar Menu berupa Chip horizontal yang bisa discroll (`lg:hidden`). |
| Tablet Besar (768px – 1023px) | `BottomNav` sudah tersembunyi (≥768px), **namun `SideNav` juga belum tampil** — kategori Daftar Menu masih berupa Chip horizontal karena breakpoint `SideNav` adalah `lg` (1024px), bukan `md` (768px) seperti `BottomNav`. Di rentang ini pengguna mengandalkan NavDrawer + Chip. |
| Desktop (≥ 1024px) | `SideNav` kategori tampil permanen di sisi kiri (`/menu`, `lg:flex`); Chip horizontal disembunyikan (`lg:hidden`); NavDrawer tetap dapat diakses dari AppHeader di semua ukuran. |

---

## 12. TRACEABILITY

| Design Token Group | Source File | Related Requirement |
| --- | --- | --- |
| Warna, tipografi, radius, shadow | `tailwind.config.ts` | SRS F001–F014 (seluruh UI) |
| Efek interaksi (`.squishy`, `.liftable`, `.brutal-checkbox`) | `app/globals.css` | SRS Section 5.4 (Usability) |
| Komponen dasar (Button, Card, Badge, Chip, dst.) | `components/ui/*` | SRS Section 5.4, IA Section 6–7 |
