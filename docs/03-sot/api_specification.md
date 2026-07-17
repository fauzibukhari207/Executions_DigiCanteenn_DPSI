# API Specification

Document Version: v1.0

Project: DigiCanteen

Status: As-Built

Last Updated: 2026-07-16

---

## 1. Arsitektur API

DigiCanteen adalah aplikasi Next.js 14 (App Router) yang memakai **Supabase sebagai Backend-as-a-Service**. Ada dua lapis "API" dalam aplikasi ini:

1. **HTTP API Routes** (`backend/app/api/`) — endpoint server Next.js sungguhan yang dipanggil lewat `fetch()` dari frontend. Dipakai khusus untuk operasi yang butuh hak akses tinggi (`SUPABASE_SERVICE_ROLE_KEY`) atau memanggil pihak ketiga (Xendit). Ini dijabarkan di Bagian 2.
2. **Data Access Layer** (`frontend/lib/data/*.ts`) — fungsi TypeScript yang dipanggil langsung dari komponen React, memanggil Supabase client (PostgREST auto-generated API) di baliknya. Tabel dilindungi Row Level Security, sehingga akses ini aman dipanggil dari browser. Ini dijabarkan di Bagian 3.

## 2. HTTP API Routes (Server, Next.js Route Handlers)

Base URL: `{DEPLOYMENT_URL}/api`

### 2.1 `POST /api/orders/confirm-payment`

Dipanggil checkout (QRIS maupun Saldo) segera setelah pembayaran sukses. Mengubah status pesanan dan memotong stok menu terkait. **Idempoten** — pemanggilan ulang untuk order yang sama tidak memotong stok dua kali.

* **Auth**: menggunakan Supabase service role di server (tidak perlu token dari client, dipanggil internal oleh aplikasi setelah pembayaran terverifikasi).
* **Request body**:
  ```json
  { "orderId": "uuid" }
  ```
* **Response 200 (baru dikonfirmasi)**:
  ```json
  { "order": { "id": "uuid", "status": "menunggu-konfirmasi", "...": "..." } }
  ```
* **Response 200 (sudah dikonfirmasi sebelumnya)**:
  ```json
  { "order": { "...": "..." }, "alreadyConfirmed": true }
  ```
* **Response 400**: `{ "error": "orderId wajib diisi." }`
* **Response 404**: `{ "error": "Pesanan tidak ditemukan." }`
* **Response 500**: `{ "error": "<pesan error>" }` — termasuk jika `SUPABASE_SERVICE_ROLE_KEY` belum dikonfigurasi.
* **Efek samping**: mengubah `orders.status` → `menunggu-konfirmasi`; mengurangi `menu_items.stock` per item (minimum 0).

### 2.2 `POST /api/payments/qris`

Membuat pembayaran QRIS baru lewat Xendit. Jika `XENDIT_SECRET_KEY` kosong, otomatis memakai mode sandbox (QR asli tergenerate, status otomatis "PAID" ±8 detik untuk pengujian).

* **Request body**:
  ```json
  { "orderId": "uuid", "amount": 25000 }
  ```
* **Response 200**:
  ```json
  {
    "referenceId": "string",
    "qrString": "string",
    "status": "PENDING",
    "amount": 25000
  }
  ```
* **Response 400**: `{ "error": "orderId dan amount (angka positif) wajib diisi." }`
* **Response 500**: `{ "error": "Gagal membuat pembayaran QRIS." }`

### 2.3 `GET /api/payments/qris/status?referenceId={id}`

Mengecek status pembayaran QRIS terkini (dipoll dari halaman checkout).

* **Query param**: `referenceId` (wajib)
* **Response 200**:
  ```json
  { "status": "PENDING" }
  ```
  Nilai `status` yang mungkin: `PENDING`, `PAID`, `EXPIRED`, `FAILED`.
* **Response 400**: `{ "error": "Query param \"referenceId\" wajib diisi." }`
* **Response 500**: `{ "error": "Gagal mengecek status pembayaran." }`

## 3. Data Access Layer (Client → Supabase PostgREST)

Dipanggil langsung dari komponen frontend (`frontend/lib/data/*.ts`), diamankan oleh Row Level Security di database (lihat `database_design.md` §6). Didokumentasikan di sini sebagai kontrak fungsi karena berperan sebagai "API internal" aplikasi.

### 3.1 Menu — `lib/data/menu.ts`
| Fungsi | Parameter | Return | Keterangan |
| --- | --- | --- | --- |
| `getAllMenuItems()` | — | `MenuItem[]` | Semua menu aktif |
| `getMenuItemById(id)` | `id: string` | `MenuItem \| undefined` | Detail satu menu |
| `getMenuItemsByIds(ids)` | `ids: string[]` | `MenuItem[]` | Batch lookup (untuk keranjang) |
| `getMenuItemsByCategory(category?)` | `category?: MenuCategory \| 'all'` | `MenuItem[]` | Filter kategori |
| `getBestSellers()` | — | `MenuItem[]` | Menu berlabel best-seller |
| `getMenuItemsBySeller(sellerId)` | `sellerId: string` | `MenuItem[]` | Menu milik satu penjual |
| `createMenuItem(data)` | `Omit<MenuItem,'id'>` | `MenuItem` | Tambah menu baru |
| `updateMenuItem(id, updates)` | `id, Partial<MenuItem>` | `MenuItem \| undefined` | Ubah menu |
| `deleteMenuItem(id)` | `id: string` | `void` | Hapus menu |
| `toggleMenuAvailability(id)` | `id: string` | `MenuItem \| undefined` | Toggle status jual |

### 3.2 Orders — `lib/data/orders.ts`
| Fungsi | Parameter | Return | Keterangan |
| --- | --- | --- | --- |
| `createOrder(params)` | items, studentId, pickupTime, paymentMethod, dll. | `Order` | Buat pesanan baru (status awal `menunggu-pembayaran`) |
| `getOrderById(id)` | `id` | `Order \| undefined` | Detail pesanan |
| `updateOrderStatus(id, status)` | `id, OrderStatus` | `Order \| undefined` | Ubah status (dipakai halaman Pesanan Masuk penjual) |
| `getOrdersByStudent(studentId)` | `studentId` | `Order[]` | Riwayat pesanan siswa |
| `getOrdersForSeller(sellerId)` | `sellerId` | `Order[]` | Pesanan masuk milik penjual |

### 3.3 Group Order — `lib/data/groups.ts`
| Fungsi | Parameter | Return | Keterangan |
| --- | --- | --- | --- |
| `createGroupOrder(hostId)` | `hostId` | `GroupOrder` | Buat sesi baru + kode unik |
| `getGroupOrder(code)` | `code` | `GroupOrder \| undefined` | Cari sesi via kode |
| `joinGroupOrder(code, userId)` | `code, userId` | `GroupOrder \| undefined` | Gabung sesi |
| `leaveGroupOrder(code, userId)` | `code, userId` | `GroupOrder \| undefined` | Keluar sesi |
| `lockGroupOrder(code)` | `code` | `GroupOrder \| undefined` | Kunci sesi (tidak bisa join lagi) |

### 3.4 Check-in Meja — `lib/data/checkins.ts`
| Fungsi | Parameter | Return | Keterangan |
| --- | --- | --- | --- |
| `createCheckIn(orderId, studentId, tableNumber)` | — | `TableCheckIn` | Mulai sesi meja |
| `getCheckIn(id)` | `id` | `TableCheckIn \| undefined` | Detail sesi |
| `completeCheckIn(id)` | `id` | `TableCheckIn \| undefined` | Tutup sesi, hitung ketepatan waktu & poin |

### 3.5 Poin & Voucher — `lib/data/points.ts`
| Fungsi | Parameter | Return | Keterangan |
| --- | --- | --- | --- |
| `addPointEntry(studentId, points, reason)` | — | `PointHistoryEntry` | Catat mutasi poin |
| `getPointHistory(studentId)` | `studentId` | `PointHistoryEntry[]` | Riwayat poin |
| `getVouchers(studentId)` | `studentId` | `Voucher[]` | Daftar voucher siswa |
| `redeemVoucher(studentId, currentPoints)` | — | `Voucher \| null` | Tukar 100 poin → voucher Rp5.000 |

### 3.6 Rating — `lib/data/ratings.ts`
| Fungsi | Parameter | Return | Keterangan |
| --- | --- | --- | --- |
| `addRating(params)` | orderId, menuItemId, studentId, stars, comment? | `Rating` | Kirim/timpa rating (upsert) |
| `getRatingsForOrder(orderId)` | `orderId` | `Rating[]` | Rating dalam satu pesanan |
| `getRatingsForMenuItem(menuItemId)` | `menuItemId` | `Rating[]` | Semua rating satu menu |
| `getAverageRatingForMenuItem(menuItemId)` | `menuItemId` | `{ average, count }` | Rata-rata & jumlah rating |
| `hasRatedOrder(orderId, studentId)` | — | `boolean` | Cek sudah rating atau belum |
| `getRatingsForSeller(sellerId)` | `sellerId` | `Rating[]` | Semua rating menu milik penjual (halaman Ulasan) |

## 4. Autentikasi

Seluruh Data Access Layer di Bagian 3 mengandalkan sesi Supabase Auth (`lib/auth/session.tsx`) yang tersimpan di client; token JWT dikirim otomatis oleh Supabase client di setiap query. HTTP API Routes di Bagian 2 tidak memerlukan token dari client karena hanya dipanggil secara internal oleh alur checkout yang sudah tervalidasi peran siswa di halaman.

## 5. Error Handling

Semua HTTP API Route mengikuti format seragam:
```json
{ "error": "pesan singkat dalam Bahasa Indonesia" }
```
dengan HTTP status 400 (input tidak valid), 404 (data tidak ditemukan), atau 500 (error server/pihak ketiga).
