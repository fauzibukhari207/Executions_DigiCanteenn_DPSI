Document Version: v1.0

Project: DigiCanteen
Product: Aplikasi Pemesanan & Pembayaran Kantin Sekolah Berbasis Web
Status: As-Built
Last Updated: 2026-07-11
Author: System Analyst AI

## 1. PURPOSE

This document serves as the master index for all User Flow Specifications of DigiCanteen.

Each User Flow is maintained in a separate document, derived by tracing the actual page/component behavior in the codebase (`app/(siswa)`, `app/(penjual)`, `app/(auth)`).

## 2. FILE STRUCTURE

```text
user_flows/
├── index.md
├── userflow_uc_001.md   (Registrasi & Login)
├── userflow_uc_002.md   (Jelajah, Keranjang & Checkout)
├── userflow_uc_003.md   (Group Order)
├── userflow_uc_004.md   (Check-in/Check-out Meja & Poin)
├── userflow_uc_005.md   (Rating Makanan & Riwayat Pesanan)
└── userflow_uc_006.md   (Kelola Menu, Pesanan Masuk & Ulasan - Penjual)
```

## 3. USER FLOW CATALOG

|Use Case ID|Use Case Name|Primary Actor|File Path|Status|
|---|---|---|---|---|
|UC-001|Registrasi & Login|Siswa, Penjual|./userflow_uc_001.md|As-Built|
|UC-002|Jelajah, Keranjang & Checkout|Siswa|./userflow_uc_002.md|As-Built|
|UC-003|Group Order|Siswa|./userflow_uc_003.md|As-Built|
|UC-004|Check-in/Check-out Meja & Poin|Siswa|./userflow_uc_004.md|As-Built|
|UC-005|Rating Makanan & Riwayat Pesanan|Siswa|./userflow_uc_005.md|As-Built|
|UC-006|Kelola Menu, Pesanan Masuk & Ulasan|Penjual|./userflow_uc_006.md|As-Built|

---

## 4. REQUIREMENT → USER FLOW MAPPING

|Feature ID|Feature Name|Use Cases|
|---|---|---|
|F001|Registrasi & Login|UC-001|
|F002, F003|Jelajah Menu, Keranjang & Checkout|UC-002|
|F004|Pembayaran QRIS/Saldo|UC-002|
|F005|Group Order|UC-003|
|F006, F007|Check-in/Check-out Meja & Poin|UC-004|
|F008, F009|Rating Makanan & Riwayat Pesanan|UC-005|
|F010, F011, F012, F013|Dashboard, Kelola Menu, Pesanan Masuk, Ulasan|UC-006|
|F014|Notifikasi & Realtime Sync|UC-002, UC-004, UC-006|

---

## 5. PAGE → USER FLOW MAPPING

|Page ID|Page Name|Use Cases|
|---|---|---|
|PAGE-002, PAGE-003|Login, Register|UC-001|
|PAGE-004, PAGE-005, PAGE-006, PAGE-007, PAGE-008|Beranda, Daftar Menu, Detail Menu, Keranjang, Checkout|UC-002|
|PAGE-009, PAGE-010, PAGE-011|Buat/Gabung/Halaman Group Order|UC-003|
|PAGE-012, PAGE-013, PAGE-016|Check-in, Check-out, Poin & Voucher|UC-004|
|PAGE-014, PAGE-015|Riwayat Pesanan, Beri Rating|UC-005|
|PAGE-018, PAGE-019, PAGE-020, PAGE-021|Dashboard, Kelola Menu, Pesanan Masuk, Ulasan|UC-006|

---

## 6. USER FLOW DEPENDENCIES

|Use Case|Depends On|
|---|---|
|UC-001|None|
|UC-002|UC-001|
|UC-003|UC-001, UC-002|
|UC-004|UC-001, UC-002|
|UC-005|UC-001, UC-002, UC-004|
|UC-006|UC-001|

---

## 7. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|1.0|2026-07-11|System Analyst AI|Initial as-built draft, diturunkan dari kode `digicanteen-app`|
