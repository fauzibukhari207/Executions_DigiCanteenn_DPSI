# User Flow Specification

Document Version: v1.0

Use Case ID: UC-005
Use Case Name: Rating Makanan & Riwayat Pesanan

Status: As-Built
Last Updated: 2026-07-11
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Siswa melihat riwayat seluruh pesanannya di `/pesanan`, dan untuk pesanan berstatus "Selesai Disajikan" yang belum dirating, dapat memberi rating bintang (1–5) beserta komentar opsional untuk tiap menu dalam pesanan tersebut.

## 1.2 Goal

Siswa ingin memberi umpan balik kualitas makanan/minuman yang sudah dipesan, dan melihat status seluruh pesanannya di satu tempat.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F008|Rating Makanan|
|F009|Riwayat Pesanan|

## 1.4 Primary Actor

Siswa

## 1.5 Supporting Actors

Sistem (validasi rating ganda)

---

# 2. TRIGGER

Siswa membuka `/pesanan` dari NavDrawer, atau klik tombol "Beri Rating" di halaman sukses check-out meja.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Siswa memiliki minimal satu pesanan|
|PRE-002|Untuk memberi rating: pesanan berstatus `selesai-disajikan`|

---

# 4. MAIN FLOW (Riwayat Pesanan)

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa membuka `/pesanan`|`getOrdersByStudent(studentId)` menampilkan seluruh pesanan siswa terurut terbaru, dengan badge status per pesanan|
|2||Untuk tiap pesanan berstatus `selesai-disajikan`, sistem mengecek `hasRatedOrder(orderId, studentId)`|
|3||Jika belum dirating, tombol "Beri Rating" muncul otomatis pada kartu pesanan tersebut|

---

# 4B. MAIN FLOW (Beri Rating)

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa klik "Beri Rating" pada sebuah pesanan|Sistem membuka `/rating/[orderId]`, menampilkan daftar menu dalam pesanan tersebut dengan `StarRatingInput` per menu|
|2|Siswa memilih bintang (dan komentar opsional) untuk tiap menu, klik "Kirim"|`addRating({orderId, menuItemId, studentId, stars, comment})` — `upsert` ke tabel `ratings` dengan kunci unik (order_id, menu_item_id, student_id)|
|3||Sistem menyimpan rating untuk semua menu dalam pesanan, lalu kembali ke `/pesanan`|
|4||Rating rata-rata menu (`getAverageRatingForMenuItem`) otomatis ter-update dan tampil di halaman Detail Menu|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Mengirim Ulang Rating (Update)

### Condition

Siswa memberi rating ulang untuk kombinasi pesanan+menu yang sama.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa submit rating untuk menu yang sudah pernah dirating|`upsert` dengan `onConflict: 'order_id,menu_item_id,student_id'` **menimpa** rating lama, bukan menambah baris baru|

---

## AF-002: Menu dalam Pesanan Sudah Dihapus Penjual

### Condition

Salah satu menu di pesanan sudah dihapus dari katalog penjual setelah pesanan dibuat.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Halaman rating memuat detail menu dari `order.items`|Menu yang datanya sudah hilang tidak lagi diwajibkan untuk dirating — tombol "Kirim" tidak menunggu rating untuk menu "hantu" tersebut|

---

# 6. EXCEPTION FLOWS

## EF-001: Preview Hover vs Bintang Terpilih Tertukar

### Condition

Siswa mengarahkan kursor ke bintang tanpa mengklik.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Siswa hover di atas bintang|`StarRatingInput` menampilkan preview dengan border putus-putus (bukan latar solid)|
|2|Siswa benar-benar klik bintang|Bintang terpilih berubah menjadi latar kuning solid (`secondary-container`), berbeda visual dari preview hover|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Baris `ratings` tercipta atau diperbarui untuk tiap menu yang dirating|
|POST-002|Rata-rata rating menu terkait ter-update pada pembacaan berikutnya|
|POST-003|Tombol "Beri Rating" tidak lagi muncul untuk pesanan yang sudah lengkap dirating|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-001|Rating hanya dapat diberikan untuk pesanan berstatus `selesai-disajikan`|
|BR-002|Kunci unik (order_id, menu_item_id, student_id) — rating ganda otomatis menimpa, bukan duplikat|
|BR-003|Nilai bintang 1–5, komentar opsional|
|BR-004|Menu yang sudah dihapus penjual tidak menghalangi penyelesaian rating pesanan|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-014|Riwayat Pesanan|
|PAGE-015|Beri Rating|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|orders|Riwayat pesanan siswa & detail item untuk halaman rating|
|ratings|Cek status sudah/belum rating (`hasRatedOrder`)|

## 10.2 Data Created

|Entity|Description|
|---|---|
|ratings|Baris baru saat pertama kali memberi rating|

## 10.3 Data Updated

|Entity|Description|
|---|---|
|ratings|Ditimpa (`upsert`) saat mengirim ulang rating untuk kombinasi yang sama|

## 10.4 Data Deleted

|Entity|Description|
|---|---|
|None|Tidak ada penghapusan data pada alur ini|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|Siswa|AKSI (ALLOWED) — hanya untuk pesanan miliknya sendiri|
|Penjual|DITOLAK — penjual melihat rating lewat halaman Ulasan (UC-006), bukan memberi rating|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Siswa dapat melihat seluruh riwayat pesanannya dengan status terkini|
|AC-002|Tombol "Beri Rating" muncul otomatis hanya untuk pesanan selesai yang belum dirating|
|AC-003|Siswa dapat memberi bintang + komentar opsional untuk tiap menu dalam pesanan|
|AC-004|Mengirim ulang rating menimpa rating lama, bukan menduplikasi|
|AC-005|Rata-rata rating menu tampil akurat di halaman Detail Menu|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F008|
|F009|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-014|
|PAGE-015|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|1.0|2026-07-11|System Analyst AI|Initial as-built draft|
