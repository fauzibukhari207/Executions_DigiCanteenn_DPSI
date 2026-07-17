# System Logic: UC-006 Kelola Menu, Pesanan Masuk & Ulasan (Penjual)

Document Version: v1.0

Use Case ID: UC-006

Use Case Name: Kelola Menu, Pesanan Masuk & Ulasan

Status: As-Built

Last Updated: 2026-07-11

Author: System Analyst AI

---

## 1. Overview

Dokumen ini mendefinisikan logika sistem untuk operasional penjual: dashboard, CRUD menu, pemrosesan pesanan masuk, dan tinjauan ulasan. Sumber: `lib/data/menu.ts`, `lib/data/orders.ts`, `lib/data/ratings.ts`, `lib/supabase/uploadMenuImage.ts`, `lib/realtime/useOrdersRealtime.ts`.

---

## 2. Sequence Diagram

### 2.1 Tambah Menu Baru (dengan Upload Foto)

```mermaid
sequenceDiagram
    actor Penjual
    participant Frontend as /kelola-menu/baru
    participant Storage as Supabase Storage (menu-images)
    participant MenuLib as lib/data/menu.ts
    participant DB as Supabase (menu_items)

    Penjual->>Frontend: Isi form MenuForm + pilih foto
    Frontend->>Storage: uploadMenuImage(file)
    alt Bucket belum dibuat / gagal
        Storage-->>Frontend: error
        Frontend-->>Penjual: tampilkan pesan error upload
    else Sukses
        Storage-->>Frontend: image_url publik
        Frontend->>MenuLib: createMenuItem({...data, imageUrl})
        MenuLib->>DB: INSERT INTO menu_items
        DB-->>MenuLib: menu row baru
        MenuLib-->>Frontend: MenuItem
        Frontend-->>Penjual: redirect ke /kelola-menu
    end
```

### 2.2 Toggle Ketersediaan & Hapus Menu

```mermaid
sequenceDiagram
    actor Penjual
    participant Frontend as /kelola-menu
    participant MenuLib as lib/data/menu.ts
    participant DB as Supabase (menu_items)

    Penjual->>Frontend: Klik "Tandai Habis/Ada"
    Frontend->>MenuLib: toggleMenuAvailability(id)
    MenuLib->>DB: SELECT is_available FROM menu_items WHERE id=?
    DB-->>MenuLib: item
    MenuLib->>DB: UPDATE menu_items SET is_available = NOT is_available
    DB-->>MenuLib: updated row
    MenuLib-->>Frontend: MenuItem

    Penjual->>Frontend: Klik "Hapus"
    Frontend->>MenuLib: deleteMenuItem(id)
    MenuLib->>DB: DELETE FROM menu_items WHERE id = id
```

### 2.3 Proses Pesanan Masuk

```mermaid
sequenceDiagram
    actor Penjual
    participant Frontend as /pesanan-masuk
    participant OrdersLib as lib/data/orders.ts
    participant DB as Supabase (orders, RLS)
    participant Realtime as useOrdersRealtime

    Frontend->>OrdersLib: getOrdersForSeller(sellerId)
    OrdersLib->>DB: SELECT * FROM orders ORDER BY created_at DESC
    Note over DB: RLS otomatis menyaring baris sesuai kebijakan "Penjual lihat pesanan yang ada menunya"
    DB-->>OrdersLib: daftar orders (sudah tersaring)
    OrdersLib-->>Frontend: Order[] (filter default: menunggu-konfirmasi)

    Penjual->>Frontend: Klik "Terima Pesanan"
    Frontend->>OrdersLib: updateOrderStatus(id, 'diproses')
    OrdersLib->>DB: UPDATE orders SET status='diproses' WHERE id=id

    Penjual->>Frontend: Klik "Tandai Siap Diambil"
    Frontend->>OrdersLib: updateOrderStatus(id, 'siap-diambil')
    OrdersLib->>DB: UPDATE orders SET status='siap-diambil' WHERE id=id

    Realtime-->>Frontend: subscribe perubahan tabel orders -> auto refetch (Dashboard, Pesanan Masuk, Riwayat Pesanan, Notifikasi)
```

### 2.4 Ambil Ulasan Penjual (Query 2 Langkah)

```mermaid
sequenceDiagram
    actor Penjual
    participant Frontend as /ulasan
    participant RatingsLib as lib/data/ratings.ts
    participant DB as Supabase

    Frontend->>RatingsLib: getRatingsForSeller(sellerId)
    RatingsLib->>DB: SELECT id FROM menu_items WHERE seller_id = sellerId
    DB-->>RatingsLib: menuIds[]
    alt menuIds kosong
        RatingsLib-->>Frontend: []
    else ada menu
        RatingsLib->>DB: SELECT * FROM ratings WHERE menu_item_id IN (menuIds) ORDER BY created_at DESC
        DB-->>RatingsLib: ratings[]
        RatingsLib-->>Frontend: Rating[]
    end
```

### 2.5 Dashboard KPI & Grafik Pendapatan

```mermaid
sequenceDiagram
    actor Penjual
    participant Frontend as /dashboard
    participant OrdersLib as lib/data/orders.ts

    Frontend->>OrdersLib: getOrdersForSeller(sellerId)
    OrdersLib-->>Frontend: Order[]
    Frontend->>Frontend: todayOrders = filter(isToday && isRevenueOrder)
    Frontend->>Frontend: pendingOrders = filter(status == 'menunggu-konfirmasi')
    Frontend->>Frontend: agregasi pendapatan 7 hari & 6 bulan (recharts)
    Frontend-->>Penjual: render KPI Card + grafik batang
```

---

## 3. Data Access Contract

### 3.1 `getMenuItemsBySeller(sellerId)` / `createMenuItem(data)` / `updateMenuItem(id, updates)` / `deleteMenuItem(id)` / `toggleMenuAvailability(id)`

Lihat `lib/data/menu.ts` — semua operasi CRUD standar terhadap tabel `menu_items`, kolom di-mapping `camelCase ↔ snake_case`.

### 3.2 `getOrdersForSeller(sellerId): Promise<Order[]>`

```ts
supabase.from('orders').select('*').order('created_at', { ascending: false });
```

**Catatan penting:** query ini sengaja "select semua" — baris yang benar-benar dikembalikan sudah disaring RLS berdasarkan kebijakan "Penjual lihat pesanan yang ada menunya", sehingga penjual A tidak pernah menerima baris milik penjual B walau parameter `sellerId` tidak dipakai langsung dalam query.

### 3.3 `updateOrderStatus(id, status): Promise<Order | undefined>`

```ts
supabase.from('orders').update({ status }).eq('id', id).select().maybeSingle();
```

### 3.4 `getRatingsForSeller(sellerId): Promise<Rating[]>`

Query dua langkah karena tabel `ratings` tidak memiliki kolom `seller_id` langsung (lihat sequence diagram 2.4).

### 3.5 `uploadMenuImage(file): Promise<string>`

Upload ke bucket Supabase Storage `menu-images`, mengembalikan URL publik. Bucket harus dibuat manual lewat dashboard Supabase (tidak bisa lewat SQL biasa).

---

## 4. Business Rules

| Rule | Description |
| --- | --- |
| BR-001 | Pemisahan data antar-penjual ditegakkan oleh RLS di database, bukan filter di kode aplikasi |
| BR-002 | Grafik pendapatan hanya menghitung pesanan dengan status bukan `menunggu-pembayaran` dan bukan `dibatalkan` |
| BR-003 | Filter default halaman Pesanan Masuk: status `menunggu-konfirmasi` ("Perlu Diterima") |
| BR-004 | Operasi lintas-peran sensitif (potong stok saat konfirmasi bayar) TIDAK dilakukan di alur ini — didelegasikan ke endpoint Service Role terpisah (lihat sys_uc_002.md Bagian 2.5) karena RLS sengaja tidak mengizinkan siswa mengubah data milik penjual secara langsung |

---

## 5. Traceability

| User Flow | Requirement | Data/API |
| --- | --- | --- |
| userflow_uc_006.md | F010, F011, F012, F013 | `menu_items`, `orders`, `ratings`, Supabase Storage `menu-images` |
