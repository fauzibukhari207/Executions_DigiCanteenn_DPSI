# User Flow Specification

Document Version: v1.0

Use Case ID: UC-003
Use Case Name: Group Order

Status: As-Built
Last Updated: 2026-07-11
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Siswa dapat membuat sesi pemesanan bersama (Group Order), mengundang teman lewat kode 6 karakter atau link, dan melakukan checkout bareng di mana kontribusi (subtotal) tiap anggota dihitung terpisah.

## 1.2 Goal

Sekelompok siswa ingin memesan bersamaan dalam satu sesi tanpa harus checkout satu per satu secara terpisah.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F005|Group Order|

## 1.4 Primary Actor

Siswa (Host & Anggota)

## 1.5 Supporting Actors

Sistem (generator kode unik)

---

# 2. TRIGGER

Siswa berada di halaman `/keranjang` dan memilih "Buat Group Order", atau membuka link undangan/kode dari teman.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Siswa (host maupun anggota) sudah login|
|PRE-002|Untuk join: kode grup valid dan status grup `terbuka`|

---

# 4. MAIN FLOW (Buat & Undang)

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa (Host) klik "Buat Group Order" di `/keranjang`|Sistem membuka `/menu/grup/buat`|
|2|Host klik "Buat Sekarang"|`createGroupOrder(hostId)` men-generate kode unik 6 karakter (retry hingga 5x jika bentrok) dan INSERT `group_orders` dengan `status='terbuka'`, `member_ids=[hostId]`|
|3||Sistem menampilkan kode & link undangan yang dapat disalin, lalu membuka `/menu/grup/[kode]`|
|4|Host membagikan link ke teman|—|

---

# 4B. MAIN FLOW (Gabung)

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa (Anggota) membuka link `/menu/grup/[kode]/join` atau memasukkan kode manual|Sistem menampilkan halaman konfirmasi gabung|
|2|Anggota klik "Gabung"|`joinGroupOrder(code, userId)` menambahkan `userId` ke `member_ids` (jika status masih `terbuka` dan belum tergabung)|
|3||Sistem redirect ke `/menu/grup/[kode]` — halaman grup|

---

# 4C. MAIN FLOW (Checkout Bareng)

|Step|Actor Action|System Response|
|---|---|---|
|1|Setiap anggota menambahkan pesanan masing-masing ke keranjang, `CartContext.groupCode` diset ke kode aktif|Sistem menyimpan `groupCode` di `localStorage` bersama isi keranjang|
|2|Siapa pun anggota membuka `/menu/grup/[kode]`|Sistem menampilkan daftar nama peran anggota (Host/Anggota) **dan subtotal milik pengguna yang sedang login saja** ("Kontribusimu") — **bukan** rincian kontribusi tiap anggota lain; teks di halaman menjelaskan "Total gabungan seluruh anggota akan dihitung saat checkout"|
|3|Siapa pun anggota (bukan hanya host) klik "Checkout Group →"|Tombol adalah link biasa ke `/checkout`; halaman Checkout membaca `groupCode` dari `CartContext` (bukan dikirim eksplisit dari halaman grup) dan hanya memproses **isi keranjang pengguna yang sedang login itu sendiri**, bukan gabungan keranjang semua anggota|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Anggota Keluar dari Grup

### Condition

Anggota memutuskan tidak jadi ikut sebelum checkout.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Anggota klik "Keluar dari Grup"|`leaveGroupOrder(code, userId)` menghapus `userId` dari `member_ids`|

---

## AF-002: Fungsi Kunci Grup (Tersedia di Backend, Belum Terhubung ke UI)

### Condition

`lockGroupOrder(code)` ada dan berfungsi di `lib/data/groups.ts`, namun **tidak ada tombol atau elemen UI manapun** di `/menu/grup/[kode]` (atau halaman lain) yang memanggilnya — terverifikasi lewat pencarian penuh ke seluruh kode frontend.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|(Tidak dapat dilakukan siswa dari UI saat ini)|Grup hanya bisa dikunci lewat pemanggilan fungsi `lockGroupOrder(code)` secara langsung (mis. dari Supabase SQL editor atau skrip manual), bukan dari alur pengguna|

**Catatan:** Ini adalah kapasitas yang sudah disiapkan di data layer tapi belum "dikawinkan" ke komponen manapun — kemungkinan fitur yang direncanakan untuk batch pengembangan berikutnya. Anggota baru saat ini **selalu bisa bergabung** selama grup belum diisi checkout, karena tidak ada cara mengubah statusnya ke `terkunci` dari UI.

---

# 6. EXCEPTION FLOWS

## EF-001: Kode Grup Tidak Ditemukan

### Condition

Siswa memasukkan kode yang tidak valid/kadaluarsa.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa submit kode|`getGroupOrder(code)` mengembalikan `undefined`|
|2||Sistem menampilkan pesan "Kode Group Order tidak ditemukan"|

---

## EF-002: Kode Bentrok Saat Generate

### Condition

Kode acak yang di-generate kebetulan sudah dipakai grup lain (constraint `UNIQUE` pada kolom `code`).

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|`createGroupOrder` INSERT dengan kode baru|Database mengembalikan error `23505` (unique_violation)|
|2||Sistem mencoba lagi dengan kode baru, hingga maksimal 5 percobaan|
|3||Jika tetap gagal setelah 5x, sistem melempar error "Gagal membuat kode Group Order yang unik, coba lagi."|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Grup tercipta dengan kode unik dan host sebagai anggota pertama|
|POST-002|Anggota yang bergabung tercatat di `member_ids`|
|POST-003|Setiap pesanan checkout dari sesi grup tersebut memiliki `orders.group_order_id` terisi|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-001|Kode grup 6 karakter dari set `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (tanpa 0/O, 1/I agar tidak tertukar)|
|BR-002|Bergabung hanya diizinkan saat status grup `terbuka`|
|BR-003|Anggota yang sudah tergabung tidak ditambahkan dua kali (idempoten)|
|BR-004|Kontribusi tiap anggota dihitung dari item keranjang miliknya sendiri yang menandai `groupCode` yang sama|
|BR-005|**"Checkout Bareng" tidak menggabungkan keranjang semua anggota menjadi satu pesanan.** Setiap anggota checkout terpisah dari keranjangnya sendiri-sendiri; `groupOrderId` hanya dilampirkan sebagai penanda agar pesanan-pesanan terpisah itu bisa dikaitkan ke grup yang sama|
|BR-006|**(Bug terverifikasi di kode)** `app/(siswa)/checkout/page.tsx` mengirim `groupOrderId: groupCode` — yaitu kode 6 karakter grup (mis. "AB3CD9") — bukan `group.id` (UUID) milik grup tersebut. Karena `orders.group_order_id` didesain sebagai kolom UUID yang mereferensikan `group_orders.id`, pengiriman kode string ke kolom ini kemungkinan besar akan gagal insert (error tipe data) atau, jika kolom itu ternyata bukan UUID di database sungguhan, akan salah kaitan (tidak benar-benar FK ke baris `group_orders` yang valid). Ini murni temuan dari kode yang berjalan, direkomendasikan untuk diperbaiki developer sebelum fitur Group Order dianggap production-ready|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-007|Keranjang|
|PAGE-009|Buat Group Order|
|PAGE-010|Gabung Group Order|
|PAGE-011|Halaman Group Order|
|PAGE-008|Checkout|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|group_orders|Cek status & anggota saat join/leave/lock|

## 10.2 Data Created

|Entity|Description|
|---|---|
|group_orders|Sesi grup baru saat dibuat host|

## 10.3 Data Updated

|Entity|Description|
|---|---|
|group_orders.member_ids|Bertambah/berkurang saat join/leave|
|group_orders.status|Berubah ke `terkunci` saat dikunci host|

## 10.4 Data Deleted

|Entity|Description|
|---|---|
|None|Tidak ada penghapusan data pada alur ini|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|Siswa|AKSI (ALLOWED) — buat, gabung, keluar, checkout bareng|
|Penjual|DITOLAK — bukan bagian alur penjual|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Siswa dapat membuat Group Order dan mendapatkan kode + link unik|
|AC-002|Siswa lain dapat bergabung memakai kode/link yang valid|
|AC-003|Halaman grup menampilkan kontribusi tiap anggota secara akurat|
|AC-004|Checkout bareng menghasilkan pesanan dengan `group_order_id` terisi|
|AC-005|Kode grup yang bentrok ditangani otomatis tanpa gagal ke pengguna|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F005|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-007|
|PAGE-009|
|PAGE-010|
|PAGE-011|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|1.0|2026-07-11|System Analyst AI|Initial as-built draft|
