# Test Plan

Document Version: v1.0

Project: DigiCanteen

Product: Aplikasi Pemesanan & Pembayaran Kantin Sekolah Berbasis Web

Status: As-Built

Last Updated: 2026-07-11

Author: System Analyst AI

---

# 1. INTRODUCTION

## 1.1 Purpose

Dokumen ini mendefinisikan strategi, ruang lingkup, sumber daya, dan jadwal pengujian untuk memastikan DigiCanteen berfungsi sesuai Software Requirements Specification (SRS v1.0), User Flow Specifications, dan Test Case Specification sebelum dirilis lebih luas ke siswa dan penjual sungguhan.

## 1.2 References

| Document | Version |
| --- | --- |
| Software Requirements Specification | v1.0 |
| Data Model | v1.0 |
| Design System | v3.0 |
| Information Architecture | v1.0 |
| User Flow Specifications (UC-001 s.d. UC-006) | v1.0 |
| Test Case Specification | v1.0 |

---

# 2. SCOPE

## 2.1 In Scope

- Registrasi & Login dua peran (Siswa, Penjual) — F001
- Jelajah & Detail Menu — F002
- Keranjang & Checkout — F003
- Pembayaran QRIS (sandbox & Xendit asli) dan Saldo — F004
- Group Order (buat/gabung/checkout bareng) — F005
- Check-in/Check-out Meja & Poin — F006
- Poin & Voucher — F007
- Rating Makanan — F008
- Riwayat Pesanan — F009
- Dashboard Penjual — F010
- Kelola Menu Penjual (termasuk upload foto) — F011
- Pesanan Masuk Penjual — F012
- Ulasan Penjual — F013
- Notifikasi & Realtime Sync — F014

## 2.2 Out of Scope

- Performance / load testing (fase terpisah)
- Security penetration testing (fase terpisah)
- Multi-tenant/multi-sekolah (out of scope SRS)
- Pembayaran kartu kredit/debit langsung (out of scope SRS)
- Retur/refund otomatis (out of scope SRS)
- Aplikasi mobile native (web responsive only)
- Cross-browser compatibility di luar Chrome, Firefox, Edge, Safari

---

# 3. TEST STRATEGY

## 3.1 Testing Levels

### Level 1: Component Testing (Unit)

| Aspect | Detail |
| --- | --- |
| **Target** | Fungsi murni di data layer (`lib/data/*.ts`, `lib/cart/calculateTotals.ts`), komponen UI dasar |
| **Approach** | Automated unit test (tanggung jawab developer) |
| **Tool** | Jest / Vitest (Frontend & API Route handlers) |
| **Responsibility** | Developer |

### Level 2: Integration Testing

| Aspect | Detail |
| --- | --- |
| **Target** | Interaksi Frontend ↔ Supabase (Auth, Database, Storage) ↔ API Route ↔ Xendit |
| **Approach** | Automated integration test + manual API testing |
| **Tool** | Postman / Insomnia untuk `/api/orders/confirm-payment`, `/api/payments/qris*`; Supabase local/staging project |
| **Responsibility** | Tester |

### Level 3: System Testing

| Aspect | Detail |
| --- | --- |
| **Target** | Seluruh fitur end-to-end via browser, kedua peran (Siswa & Penjual) |
| **Approach** | Manual test execution berdasarkan Test Case Specification |
| **Tool** | Browser (Chrome/Firefox/Edge/Safari) |
| **Responsibility** | Tester |

### Level 4: User Acceptance Testing (UAT)

| Aspect | Detail |
| --- | --- |
| **Target** | Skenario nyata harian: siswa memesan saat istirahat, penjual memproses pesanan |
| **Approach** | Manual exploratory testing oleh end user |
| **Tool** | Environment staging yang identik dengan production (Supabase project terpisah) |
| **Responsibility** | End User (Siswa & Penjual perwakilan) + Tester |

## 3.2 Testing Approach

### Functional Testing Approach

Test case dieksekusi berdasarkan prioritas fitur:

1. **High Priority (F001, F003, F004, F012):** 100% test case dieksekusi — inti alur transaksi & akses.
2. **Medium Priority (F002, F005, F006, F007, F011):** 100% test case dieksekusi.
3. **Low Priority (F008, F009, F010, F013, F014):** 100% test case dieksekusi, boleh dijadwalkan setelah alur inti stabil.

### Defect Management

| Stage | Action |
| --- | --- |
| Defect Found | Tester mencatat defect di log dengan langkah reproduksi |
| Severity Level | Critical / Major / Minor / Trivial |
| Critical Defect | Pengujian dihentikan sampai defect diperbaiki (mis. stok terpotong dua kali, saldo salah hitung) |
| Major Defect | Pengujian fitur terkait dihentikan sampai diperbaiki |
| Minor/Trivial | Pengujian tetap berjalan, defect diperbaiki setelahnya |

---

# 4. TEST ENVIRONMENT

## 4.1 Hardware Requirements

| Perangkat | Spesifikasi Minimum |
| --- | --- |
| Komputer / Laptop | Processor Intel i3 / AMD Ryzen 3, RAM 4GB, Storage 256GB |
| Smartphone (Siswa) | Android/iOS dengan browser modern, layar minimal 5 inci |
| Tablet (Penjual, opsional) | Layar minimal 10 inci, RAM 3GB |

## 4.2 Software Requirements

### Frontend Testing

| Software | Version |
| --- | --- |
| Google Chrome | Latest stable |
| Mozilla Firefox | Latest stable |
| Microsoft Edge | Latest stable |
| Safari | Latest stable (macOS/iOS) |

### Backend & API Testing

| Software | Version |
| --- | --- |
| Postman / Insomnia | Latest stable |
| Node.js | ≥ 18.x (sesuai runtime Next.js 14) |

### Database & Layanan Pihak Ketiga

| Software/Service | Version/Mode |
| --- | --- |
| Supabase (PostgreSQL + Auth + Storage + Realtime) | Project staging terpisah dari production |
| Xendit | Mode Test/Sandbox (API key sandbox, tanpa dokumen bisnis) |

## 4.3 Network Requirements

- Koneksi internet stabil dengan latency < 150ms ke Supabase & Xendit.
- Local development dapat menggunakan `next dev` di `localhost:3000`.

## 4.4 Test Data Requirements

| Data Item | Quantity | Description |
| --- | --- | --- |
| Akun Siswa | 3+ | Variasi saldo dompet (Rp0, Rp10.000, Rp100.000) dan poin (0, 50, 150) |
| Akun Penjual | 2+ | Untuk menguji isolasi data antar-penjual (RLS) |
| Menu aktif | 10+ | Variasi kategori, badge diet, stok (0, 1, 10, 100) |
| Menu dengan stok = 0 | 1+ | Untuk test case menu habis |
| Group Order aktif | 2+ | Satu `terbuka`, satu `terkunci` |
| Pesanan di setiap status | 1+ per status | `menunggu-pembayaran`, `menunggu-konfirmasi`, `diproses`, `siap-diambil`, `selesai-disajikan`, `dibatalkan` |
| Rating existing | 5+ | Untuk menguji rata-rata rating & halaman Ulasan |

---

# 5. ROLES & RESPONSIBILITIES

| Role | Name / Team | Responsibility |
| --- | --- | --- |
| Test Manager | System Analyst | Menyusun test plan, mengawasi pelaksanaan, melaporkan hasil |
| Tester | QA Team | Mengeksekusi test case, mencatat defect, memverifikasi perbaikan |
| Developer | Dev Team | Memperbaiki defect yang ditemukan |
| End User (Siswa) | Perwakilan siswa | Menjalankan UAT alur pemesanan |
| End User (Penjual) | Perwakilan penjual kantin | Menjalankan UAT alur operasional |
| Project Sponsor | Pemilik Produk / Klien | Menyetujui hasil pengujian dan keputusan rilis |

---

# 6. TEST SCHEDULE

## 6.1 Phases

| Phase | Activity | Duration | Deliverable |
| --- | --- | --- | --- |
| **P1: Test Planning** | Menyusun test plan, menyiapkan Supabase staging & Xendit sandbox | 2 hari | Test Plan Document |
| **P2: Test Case Preparation** | Menyusun/mereview Test Case Specification | 2 hari | Test Case Specification |
| **P3: Test Execution** | Menjalankan test case, mencatat hasil | 4 hari | Test Execution Report |
| **P4: Defect Fixing** | Developer memperbaiki defect | 3 hari | Fixed Build |
| **P5: Re-testing** | Verifikasi perbaikan, regression test | 2 hari | Updated Test Report |
| **P6: UAT** | User acceptance testing oleh siswa & penjual perwakilan | 2 hari | UAT Sign-off |
| **P7: Test Closure** | Menyusun laporan akhir pengujian | 1 hari | Test Summary Report |

**Total estimasi:** 16 hari kerja

---

# 7. ENTRY & EXIT CRITERIA

## 7.1 Entry Criteria

| No | Criteria |
| --- | --- |
| EC-01 | SRS, User Flow, dan Test Case Specification sudah di-review dan disetujui |
| EC-02 | Project Supabase staging & Xendit sandbox sudah siap dan terkonfigurasi (`.env.local` lengkap) |
| EC-03 | Bucket Storage `menu-images` sudah dibuat |
| EC-04 | Test data sudah disiapkan dan terisi di database staging |
| EC-05 | Tester sudah memahami test case dan skenario pengujian |

## 7.2 Exit Criteria

| No | Criteria |
| --- | --- |
| XC-01 | 100% test case dieksekusi |
| XC-02 | Tidak ada defect dengan severity Critical atau Major yang masih open |
| XC-03 | Seluruh defect Minor/Trivial sudah didokumentasikan dan diterima sebagai known issue |
| XC-04 | UAT sudah selesai dan mendapatkan sign-off dari siswa & penjual perwakilan |
| XC-05 | Test Summary Report sudah disusun dan disetujui |

## 7.3 Suspension Criteria

| No | Criteria |
| --- | --- |
| SC-01 | Terdapat critical defect yang menghalangi pengujian lebih dari 50% test case (mis. stok/saldo tidak terpotong sama sekali) |
| SC-02 | Lingkungan staging (Supabase/Xendit) tidak stabil atau sering down |
| SC-03 | Perubahan kebutuhan mendadak yang signifikan (major requirement change) |

---

# 8. TEST DELIVERABLES

| Deliverable | Description | Due |
| --- | --- | --- |
| Test Plan | Dokumen perencanaan pengujian ini | Akhir P1 |
| Test Case Specification | Detail test case untuk setiap fitur | Akhir P2 |
| Test Execution Report | Hasil eksekusi test case (pass/fail) | Akhir P3 |
| Defect Log | Daftar defect yang ditemukan | Akhir P3 |
| Re-test Report | Hasil verifikasi perbaikan defect | Akhir P5 |
| UAT Sign-off | Persetujuan dari end user (siswa & penjual) | Akhir P6 |
| Test Summary Report | Laporan akhir pengujian | Akhir P7 |

---

# 9. RISK & MITIGATION

| Risk ID | Risk Description | Probability | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R-01 | Lingkungan staging Supabase tidak representatif dengan production | Medium | High | Gunakan konfigurasi RLS & schema yang identik dengan production |
| R-02 | Akun Xendit sandbox tidak mencerminkan perilaku QR asli sepenuhnya | Medium | Medium | Uji juga jalur mode sandbox internal aplikasi (tanpa `XENDIT_SECRET_KEY`) sebagai pembanding |
| R-03 | Realtime Supabase belum diaktifkan di staging sehingga fitur sinkronisasi tidak teruji | Medium | Medium | Pastikan replication tabel `orders` diaktifkan sebelum P3 dimulai |
| R-04 | Test data tidak mencakup semua kombinasi status pesanan | Low | Medium | Lakukan review test data sebelum eksekusi (lihat Bagian 4.4) |
| R-05 | Perubahan requirement di tengah pengujian | Low | High | Freeze requirement sebelum P3 dimulai |
| R-06 | Keterbatasan akses ke perangkat Safari/iOS untuk uji siswa | Low | Low | Gunakan BrowserStack atau perangkat pinjaman jika tidak tersedia |

---

# 10. APPROVAL

| Role | Name | Signature | Date |
| --- | --- | --- | --- |
| Test Manager | System Analyst AI | | |
| Developer Lead | | | |
| Project Sponsor (Pemilik Produk) | | | |

---

# 11. REVISION HISTORY

| Version | Date | Author | Description |
| --- | --- | --- | --- |
| 1.0 | 2026-07-11 | System Analyst AI | Initial as-built draft, diturunkan dari kode `digicanteen-app` |
