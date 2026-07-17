# System Logic: UC-003 Group Order

Document Version: v1.0

Use Case ID: UC-003

Use Case Name: Group Order

Status: As-Built

Last Updated: 2026-07-11

Author: System Analyst AI

---

## 1. Overview

Dokumen ini mendefinisikan logika sistem pembuatan, penggabungan, dan penguncian sesi Group Order. Sumber: `lib/data/groups.ts`.

---

## 2. Sequence Diagram

### 2.1 Buat Group Order

```mermaid
sequenceDiagram
    actor Host as Siswa (Host)
    participant Frontend
    participant DB as Supabase (group_orders)

    Host->>Frontend: Klik "Buat Sekarang"
    loop hingga 5x percobaan
        Frontend->>Frontend: generateCode() -> 6 karakter acak
        Frontend->>DB: INSERT {code, host_id, member_ids:[host_id], status:'terbuka'}
        alt Sukses
            DB-->>Frontend: group_order row
        else Error 23505 (unique_violation)
            Frontend->>Frontend: coba kode baru
        end
    end
    Frontend-->>Host: tampilkan kode + link undangan
```

### 2.2 Gabung Group Order

```mermaid
sequenceDiagram
    actor Anggota as Siswa (Anggota)
    participant Frontend
    participant DB as Supabase (group_orders)

    Anggota->>Frontend: Buka link/masukkan kode, klik "Gabung"
    Frontend->>DB: SELECT * FROM group_orders WHERE code = CODE
    DB-->>Frontend: group_order row atau kosong

    alt Tidak ditemukan
        Frontend-->>Anggota: "Kode tidak ditemukan"
    else status != 'terbuka'
        Frontend-->>Anggota: kembalikan data grup apa adanya (tidak bergabung)
    else sudah anggota
        Frontend-->>Anggota: kembalikan data grup apa adanya
    else berhasil
        Frontend->>DB: UPDATE group_orders SET member_ids = member_ids + [userId] WHERE code = CODE
        DB-->>Frontend: group_order row terbaru
        Frontend-->>Anggota: redirect ke halaman Group Order
    end
```

### 2.3 "Checkout Bareng" (Per-Anggota, Bukan Digabung)

```mermaid
sequenceDiagram
    actor Anggota as Siswa (Host atau Anggota mana pun)
    participant GroupPage as /menu/grup/[kode]
    participant CartContext
    participant CheckoutPage as /checkout
    participant OrdersAPI as lib/data/orders.ts

    Anggota->>GroupPage: Klik "Checkout Group →" (link biasa, bukan aksi khusus)
    GroupPage->>CheckoutPage: navigate ke /checkout
    CheckoutPage->>CartContext: baca lines & groupCode milik pengguna ini SAJA
    Note over CheckoutPage: TIDAK ada penggabungan keranjang anggota lain di sisi server
    CheckoutPage->>OrdersAPI: createOrder({..., groupOrderId: groupCode})
    Note over OrdersAPI: BUG TERVERIFIKASI: groupCode adalah kode 6 karakter (mis. "AB3CD9"),<br/>bukan group.id (UUID) — dikirim apa adanya ke kolom orders.group_order_id
    OrdersAPI-->>CheckoutPage: Order (kemungkinan gagal FK atau salah kaitan)
```

**Catatan penting:** setiap anggota yang checkout membuat pesanan (`orders`) miliknya sendiri secara independen dari keranjangnya sendiri. Tidak ada satu pesanan gabungan untuk seluruh anggota grup.

---

## 3. Data Access Contract

### 3.1 `createGroupOrder(hostId): Promise<GroupOrder>`

INSERT ke `group_orders` dengan retry hingga 5x saat terjadi `unique_violation` (Postgres error code `23505`) pada kolom `code`.

### 3.2 `getGroupOrder(code): Promise<GroupOrder | undefined>`

`SELECT * FROM group_orders WHERE code = code.toUpperCase()` (single).

### 3.3 `joinGroupOrder(code, userId): Promise<GroupOrder | undefined>`

Membaca grup terlebih dahulu; hanya UPDATE `member_ids` jika `status === 'terbuka'` dan `userId` belum ada di daftar.

### 3.4 `leaveGroupOrder(code, userId): Promise<GroupOrder | undefined>`

UPDATE `member_ids` dengan memfilter keluar `userId`.

### 3.5 `lockGroupOrder(code): Promise<GroupOrder | undefined>`

UPDATE `status = 'terkunci'`. **Fungsi ini terverifikasi ada dan berfungsi di data layer, tetapi tidak dipanggil dari komponen UI manapun** (dicek lewat pencarian penuh ke seluruh kode frontend) — jadi grup di aplikasi berjalan saat ini tidak pernah benar-benar berubah ke status `terkunci` lewat interaksi pengguna biasa.

---

## 4. Business Rules

| Rule | Description |
| --- | --- |
| BR-001 | Kode 6 karakter dari alfabet terbatas (tanpa 0/O, 1/I) untuk mengurangi kesalahan baca manusia |
| BR-002 | Maksimal 5 percobaan generate kode sebelum dianggap gagal |
| BR-003 | Join hanya berhasil jika status grup `terbuka` |
| BR-004 | Join bersifat idempoten (anggota yang sudah ada tidak diduplikasi) |

---

## 5. Traceability

| User Flow | Requirement | Data/API |
| --- | --- | --- |
| userflow_uc_003.md | F005 | tabel `group_orders` |
