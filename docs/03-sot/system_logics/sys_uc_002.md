# System Logic: UC-002 Jelajah, Keranjang & Checkout (Pembayaran QRIS/Saldo)

Document Version: v1.0

Use Case ID: UC-002

Use Case Name: Jelajah, Keranjang & Checkout

Status: As-Built

Last Updated: 2026-07-11

Author: System Analyst AI

---

## 1. Overview

Dokumen ini mendefinisikan logika sistem untuk jelajah menu, kelola keranjang, pembuatan pesanan, dan pembayaran (QRIS via Xendit atau Saldo internal). Sumber: `lib/data/menu.ts`, `lib/data/orders.ts`, `lib/cart/CartContext.tsx`, `lib/cart/calculateTotals.ts`, `lib/payment/xendit.ts`, `app/api/payments/qris/*`, `app/api/orders/confirm-payment/route.ts`.

---

## 2. Sequence Diagram

### 2.1 Load & Filter Menu

```mermaid
sequenceDiagram
    actor Siswa
    participant Frontend
    participant DB as Supabase (menu_items)

    Siswa->>Frontend: Buka /menu
    Frontend->>DB: SELECT * FROM menu_items ORDER BY created_at DESC
    DB-->>Frontend: daftar menu
    Frontend->>Frontend: filter client-side (kategori, search, diet badges)
    Frontend-->>Siswa: tampilkan grid MenuCard
```

### 2.2 Tambah ke Keranjang (client-only, localStorage)

```mermaid
sequenceDiagram
    actor Siswa
    participant DetailPage as /menu/[id]
    participant CartContext
    participant LocalStorage

    Siswa->>DetailPage: pilih opsi & kuantitas, klik "Tambah ke Keranjang"
    DetailPage->>CartContext: addItem(menuItemId, qty, options) — param ke-4 "note" didukung fungsinya tapi TIDAK PERNAH dikirim oleh UI manapun (selalu undefined di praktiknya)
    CartContext->>CartContext: cari baris identik (menuItemId+options+note)
    alt Baris identik ada
        CartContext->>CartContext: increment quantity
    else Baris baru
        CartContext->>CartContext: buat lineId baru
    end
    CartContext->>LocalStorage: setItem('digicanteen-cart-v1', {lines, groupCode})
    CartContext-->>Siswa: update badge jumlah item di header
```

### 2.3 Checkout & Buat Pesanan

```mermaid
sequenceDiagram
    actor Siswa
    participant CheckoutPage as /checkout
    participant OrdersAPI as lib/data/orders.ts
    participant DB as Supabase (orders)

    Siswa->>CheckoutPage: pilih waktu & metode bayar, klik "Buat Pesanan & Bayar"
    CheckoutPage->>CheckoutPage: calculateTotals(cart.lines) [async, query harga menu sekali per kombinasi]
    CheckoutPage->>OrdersAPI: createOrder({studentId, lines, subtotal, serviceFee, total, pickupTime, paymentMethod, groupOrderId?})
    OrdersAPI->>DB: INSERT INTO orders (status='menunggu-pembayaran', ...)
    DB-->>OrdersAPI: order row
    OrdersAPI-->>CheckoutPage: Order

    alt paymentMethod = 'saldo'
        CheckoutPage->>CheckoutPage: handlePaymentSuccess(order.id)
    else paymentMethod = 'qris'
        CheckoutPage->>QrisAPI: POST /api/payments/qris {orderId, amount: total}
    end
```

### 2.4 Pembayaran QRIS (Xendit / Sandbox)

```mermaid
sequenceDiagram
    actor Siswa
    participant Frontend
    participant QrisAPI as /api/payments/qris
    participant Xendit
    participant StatusAPI as /api/payments/qris/status
    participant ConfirmAPI as /api/orders/confirm-payment

    Frontend->>QrisAPI: POST {orderId, amount}
    alt XENDIT_SECRET_KEY terisi
        QrisAPI->>Xendit: create QR Code (API asli)
        Xendit-->>QrisAPI: qrString, referenceId, status=PENDING
    else Mode sandbox
        QrisAPI->>QrisAPI: generate QR string dummy (string QRIS statis buatan tangan, BUKAN via library) + referenceId lokal
        QrisAPI->>QrisAPI: jadwalkan auto-status PAID setelah ~8 detik (in-memory)
    end
    QrisAPI-->>Frontend: QrisPayment {qrString, referenceId, status}
    Frontend-->>Siswa: render QrisDisplay — komponen `components/payment/QrisDisplay.tsx` mengubah `qrString` (asli maupun dummy) menjadi gambar QR yang bisa discan, di browser, pakai library `qrcode` (`QRCode.toDataURL`)

    loop polling tiap beberapa detik
        Frontend->>StatusAPI: GET ?referenceId=...
        StatusAPI-->>Frontend: {status}
    end

    Frontend->>Frontend: status = 'PAID' terdeteksi
    Frontend->>ConfirmAPI: POST {orderId}
```

### 2.5 Konfirmasi Pembayaran & Potong Stok (Service Role, Idempoten)

```mermaid
sequenceDiagram
    participant Frontend
    participant ConfirmAPI as /api/orders/confirm-payment
    participant AdminDB as Supabase (Service Role)

    Frontend->>ConfirmAPI: POST {orderId}
    ConfirmAPI->>AdminDB: SELECT * FROM orders WHERE id = orderId
    AdminDB-->>ConfirmAPI: order

    alt order.status != 'menunggu-pembayaran'
        ConfirmAPI-->>Frontend: {order, alreadyConfirmed: true}
    else order.status == 'menunggu-pembayaran'
        ConfirmAPI->>AdminDB: UPDATE orders SET status='menunggu-konfirmasi' WHERE id=orderId
        loop tiap item di order.items
            ConfirmAPI->>AdminDB: SELECT stock FROM menu_items WHERE id = item.menuItemId
            alt menu ditemukan
                ConfirmAPI->>AdminDB: UPDATE menu_items SET stock = MAX(0, stock - quantity)
            else menu sudah dihapus
                ConfirmAPI->>ConfirmAPI: lewati item
            end
        end
        ConfirmAPI-->>Frontend: {order: updatedOrder}
    end

    Frontend->>Frontend: clearCart(), redirect ke halaman sukses
```

---

## 3. API Contract

### 3.1 `getAllMenuItems()` / `getMenuItemsByCategory(category)` / `getBestSellers()`

Query langsung ke `menu_items` (lihat `lib/data/menu.ts`). Tidak melalui REST custom.

### 3.2 POST `/api/payments/qris`

**Request Body:**

```json
{ "orderId": "uuid", "amount": 45000 }
```

**Success Response (200 OK):**

```json
{
  "orderId": "uuid",
  "xenditReferenceId": "ref-xxxx",
  "qrString": "00020101021226...",
  "amount": 45000,
  "status": "PENDING",
  "expiresAt": "2026-07-11T10:15:00Z"
}
```

**Error Response (400):**

```json
{ "error": "orderId dan amount (angka positif) wajib diisi." }
```

### 3.3 GET `/api/payments/qris/status?referenceId=`

**Success Response (200 OK):**

```json
{ "status": "PAID" }
```

Nilai `status`: `PENDING` | `PAID` | `EXPIRED` | `FAILED`.

### 3.4 POST `/api/orders/confirm-payment`

**Request Body:**

```json
{ "orderId": "uuid" }
```

**Success Response (200 OK) — pertama kali:**

```json
{ "order": { "id": "uuid", "status": "menunggu-konfirmasi", "...": "..." } }
```

**Success Response (200 OK) — pemanggilan berulang (idempoten):**

```json
{ "order": { "...": "..." }, "alreadyConfirmed": true }
```

**Error Response (404):**

```json
{ "error": "Pesanan tidak ditemukan." }
```

**Error Response (500) — Service Role belum dikonfigurasi:**

```json
{ "error": "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local. Lihat SETUP_SUPABASE_XENDIT.md." }
```

---

## 4. Business Rules

| Rule | Description |
| --- | --- |
| BR-001 | `SERVICE_FEE` flat Rp2.000 ditambahkan ke setiap pesanan |
| BR-002 | Total = subtotal + serviceFee − discount |
| BR-003 | Metode Saldo hanya diizinkan jika `walletBalance >= total` |
| BR-004 | Stok dikurangi minimal 0 (tidak boleh minus) |
| BR-005 | Endpoint confirm-payment idempoten berdasarkan pengecekan `order.status` |
| BR-006 | ID menu harus lolos validasi format UUID sebelum query (`isValidUuid`) |

---

## 5. Traceability

| User Flow | Requirement | Data/API |
| --- | --- | --- |
| userflow_uc_002.md | F002, F003, F004 | `menu_items`, `orders`, `/api/payments/qris*`, `/api/orders/confirm-payment` |
