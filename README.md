# DigiCanteen

Aplikasi pemesanan & pembayaran kantin sekolah berbasis web, studi kasus Kantin SMAN 1 Prambanan.

## Deskripsi Singkat

DigiCanteen menghubungkan siswa dan penjual kantin dalam satu platform: siswa dapat menjelajah menu, memesan sendiri atau berkelompok (Group Order), membayar non-tunai (QRIS/Saldo), mengambil pesanan di meja lewat mekanisme check-in/check-out yang memberi insentif poin, lalu memberi rating. Penjual mendapat dashboard untuk mengelola menu, memproses pesanan masuk, dan memantau pendapatan serta ulasan pelanggan. Latar belakang masalah dan tujuan solusi selengkapnya ada di `docs/02-analisis-kebutuhan/problem_statement.md`.

## Anggota Tim & Pembagian Peran

Peran Final (2 Backend – 2 Frontend – 1 Docs/Koordinasi)

| Nama | Peran | Fokus File/Folder |
| --- | --- | --- |
| Yusuf Ariffandi | Backend – API Routes & Controllers | `backend/app/routes`, `backend/app/controllers` |
| Rosiana Abdullah | Backend – Database & Services | `backend/database`, `backend/lib/services` |
| Muhammad Fauzi Al Bukhari | Frontend – Routes/Pages | `frontend/app/**/page.tsx`, `layout.tsx`, `middleware.ts` |
| Muhammad Harits Arrozzaq | Frontend – Components & lib | `frontend/components`, `frontend/lib` |
| Angaraeni Putri Hartadi | Docs/SoT + Koordinasi | `docs/03-sot/*`, review PR, jaga konsistensi API spec ↔ backend ↔ frontend |

## Teknologi yang Digunakan

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage, Realtime) + Next.js API Route Handlers
- **Payment Gateway**: Xendit (QRIS), dengan mode sandbox otomatis untuk pengujian tanpa kredensial live
- **Library pendukung**: `@supabase/supabase-js`, `qrcode`, `recharts`

## Struktur Proyek

```
DigiCanteen/
├── backend/                # Kode server-side: API routes, integrasi Xendit, skema database
├── frontend/                # Aplikasi Next.js lengkap (siap dijalankan)
├── docs/
│   ├── 01-wawancara-observasi/   # Data hasil wawancara & observasi
│   ├── 02-analisis-kebutuhan/    # Problem Statement, Stakeholder, Functional Requirements
│   └── 03-sot/                   # Source of Truth: SRS, Data Model, Database Design,
│                                  # API Specification, IA, Design System, User Flow,
│                                  # System Logic, Test Plan/Cases
└── README.md
```

### Catatan tentang pemisahan Backend/Frontend

DigiCanteen dibangun dengan Next.js App Router, di mana API route (backend) secara arsitektural berjalan di dalam proyek Next.js yang sama dengan UI (frontend) — ini bawaan framework, bukan pilihan desain acak. Untuk memenuhi struktur `backend/` dan `frontend/` terpisah sesuai format submission:

- **`frontend/`** berisi seluruh aplikasi Next.js yang bisa langsung dijalankan (`npm run dev`), termasuk API route-nya (karena route tersebut hanya bisa berjalan sebagai bagian dari proses Next.js).
- **`backend/`** berisi salinan kode yang murni bertanggung jawab di sisi server — API route handlers, integrasi Supabase Admin (service role) dan Xendit, tipe data bersama, serta skema database (`backend/database/schema.sql`) — sebagai referensi terpisah untuk keperluan penilaian/dokumentasi.

Database sesungguhnya (PostgreSQL) dikelola sebagai layanan terkelola oleh Supabase, bukan server backend terpisah yang di-deploy manual.

## Cara Menjalankan Aplikasi

1. Masuk ke folder `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Salin `.env.example` menjadi `.env.local`, lalu isi:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — dari dashboard Supabase (Project Settings > API).
   - `XENDIT_SECRET_KEY` — opsional; jika dikosongkan, checkout otomatis memakai mode sandbox (QR asli, status "PAID" otomatis ±8 detik, tanpa transaksi uang sungguhan).
3. Jalankan skema database: buka Supabase SQL Editor, jalankan isi `backend/database/schema.sql`.
4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000`.

> **Keamanan**: `.env.local` sengaja **tidak** disertakan dalam paket ini karena berisi kredensial. Jangan pernah meng-commit atau membagikan file `.env.local` yang sudah terisi kunci asli.

## URL Aplikasi yang Telah Di-deploy

digicanteen-app-2.vercel.app

## URL Repository GitHub

https://github.com/fauzibukhari207/Executions_DigiCanteenn_DPSI/edit/main/README.md

## Dokumentasi Lengkap

| Dokumen | Lokasi |
| --- | --- |
| Data Wawancara & Observasi | `docs/01-wawancara-observasi/` |
| Problem Statement | `docs/02-analisis-kebutuhan/problem_statement.md` |
| Stakeholder Analysis | `docs/02-analisis-kebutuhan/stakeholder_analysis.md` |
| Functional Requirements | `docs/02-analisis-kebutuhan/functional_requirements.md` |
| Software Requirement Specification (SRS) | `docs/03-sot/srs.md` |
| Database Design | `docs/03-sot/database_design.md` |
| API Specification | `docs/03-sot/api_specification.md` |
| Data Model (detail turunan kode) | `docs/03-sot/data_model.md` |
| Information Architecture | `docs/03-sot/information_architecture.md` |
| Design System | `docs/03-sot/design_system.md` |
| User Flow | `docs/03-sot/user_flows/` |
| System Logic | `docs/03-sot/system_logics/` |
| Test Plan & Test Cases | `docs/03-sot/test_plan.md`, `docs/03-sot/test_cases.md`, `docs/03-sot/test_execution_sheet.md` |
