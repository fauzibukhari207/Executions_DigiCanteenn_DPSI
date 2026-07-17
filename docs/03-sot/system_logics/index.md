# System Logic Specifications

Document Version: v1.0

Project: DigiCanteen

Product: Aplikasi Pemesanan & Pembayaran Kantin Sekolah Berbasis Web

Status: As-Built

Last Updated: 2026-07-11

Author: System Analyst AI

---

## 1. PURPOSE

This document serves as the master index for all System Logic Specifications of DigiCanteen.

Unlike a conventional POS system, DigiCanteen's backend logic is split between:
- **Direct Supabase client queries** from the data layer (`lib/data/*.ts`), governed by Row Level Security (RLS), for most reads/writes.
- **Custom Next.js API Routes** (`app/api/**`) using the Supabase Service Role key for operations that must bypass RLS safely (payment confirmation + stock deduction) or that talk to a third-party payment gateway (Xendit QRIS).

Each System Logic file documents both patterns for its use case.

---

## 2. FILE STRUCTURE

```text
system_logics/
├── index.md
├── sys_uc_001.md   (Registrasi & Login)
├── sys_uc_002.md   (Jelajah, Keranjang & Checkout + Pembayaran)
├── sys_uc_003.md   (Group Order)
├── sys_uc_004.md   (Check-in/Check-out Meja & Poin)
├── sys_uc_005.md   (Rating Makanan & Riwayat Pesanan)
└── sys_uc_006.md   (Kelola Menu, Pesanan Masuk & Ulasan - Penjual)
```

---

## 3. SYSTEM LOGIC CATALOG

| Use Case ID | Use Case Name | File Path | Status |
| --- | --- | --- | --- |
| UC-001 | Registrasi & Login | ./sys_uc_001.md | As-Built |
| UC-002 | Jelajah, Keranjang & Checkout | ./sys_uc_002.md | As-Built |
| UC-003 | Group Order | ./sys_uc_003.md | As-Built |
| UC-004 | Check-in/Check-out Meja & Poin | ./sys_uc_004.md | As-Built |
| UC-005 | Rating Makanan & Riwayat Pesanan | ./sys_uc_005.md | As-Built |
| UC-006 | Kelola Menu, Pesanan Masuk & Ulasan | ./sys_uc_006.md | As-Built |

---

## 4. USER FLOW → SYSTEM LOGIC MAPPING

| User Flow | System Logic | Description |
| --- | --- | --- |
| userflow_uc_001.md | sys_uc_001.md | Supabase Auth sign up/in, pembacaan profil dari tabel `profiles` |
| userflow_uc_002.md | sys_uc_002.md | Query `menu_items`, kelola keranjang lokal, pembuatan `orders`, integrasi Xendit QRIS |
| userflow_uc_003.md | sys_uc_003.md | CRUD `group_orders`, generate & validasi kode unik |
| userflow_uc_004.md | sys_uc_004.md | CRUD `table_checkins`, mutasi `profiles.points` |
| userflow_uc_005.md | sys_uc_005.md | Upsert `ratings`, query `orders` milik siswa |
| userflow_uc_006.md | sys_uc_006.md | CRUD `menu_items`, update `orders.status`, agregasi `ratings` per penjual |

---

## 5. API OVERVIEW

### 5.1 Data Access Pattern (Supabase Client — sisi browser, tunduk RLS)

Sebagian besar operasi baca/tulis memakai Supabase JS client langsung dari komponen (lewat fungsi di `lib/data/*.ts`), bukan REST custom. Contoh: `supabase.from('menu_items').select('*')`.

### 5.2 Custom API Routes (Next.js Route Handlers, server-side)

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/orders/confirm-payment` | Update status pesanan + potong stok (Service Role, bypass RLS, idempoten) |
| POST | `/api/payments/qris` | Buat pembayaran QRIS baru via Xendit (atau sandbox) |
| GET | `/api/payments/qris/status?referenceId=` | Cek status pembayaran QRIS |

### 5.3 Common Response Format (Custom API Routes)

```json
{
  "data": {},
  "error": null
}
```

Pada implementasi nyata, response sukses mengembalikan objek data langsung (mis. `{ order }` atau `{ status }`), dan response gagal mengembalikan `{ "error": "pesan error" }` dengan HTTP status sesuai.

### 5.4 HTTP Status Codes

| Code | Description |
| --- | --- |
| 200 | Success |
| 201 | Created (order/QRIS payment baru) |
| 400 | Bad Request / Validasi gagal |
| 401 | Unauthorized (sesi tidak valid) |
| 404 | Not Found (order/menu tidak ditemukan) |
| 500 | Internal Server Error (mis. Supabase/Xendit belum dikonfigurasi) |

---

## 6. REVISION HISTORY

| Version | Date | Author | Description |
| --- | --- | --- | --- |
| 1.0 | 2026-07-11 | System Analyst AI | Initial as-built draft, diturunkan dari kode `digicanteen-app` |
