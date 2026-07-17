# System Logic: UC-004 Check-in/Check-out Meja & Poin

Document Version: v1.0

Use Case ID: UC-004

Use Case Name: Check-in/Check-out Meja & Poin

Status: As-Built

Last Updated: 2026-07-11

Author: System Analyst AI

---

## 1. Overview

Dokumen ini mendefinisikan logika sistem untuk sesi check-in/check-out meja beserta perhitungan dan penukaran poin. Sumber: `lib/data/checkins.ts`, `lib/data/points.ts`, `lib/types.ts` (`BUSINESS_RULES`).

---

## 2. Sequence Diagram

### 2.1 Check-in

```mermaid
sequenceDiagram
    actor Siswa
    participant Frontend
    participant DB as Supabase (table_checkins)

    Siswa->>Frontend: Masukkan nomor meja, klik "Check-in"
    Frontend->>DB: INSERT {order_id, student_id, table_number}
    DB-->>Frontend: check-in row (check_in_at = now())
    Frontend->>Frontend: redirect ke /meja/checkout?checkinId=...
    Frontend-->>Siswa: halaman check-out menampilkan timer berjalan (update tiap detik, klien-side, dihitung dari check_in_at)
```

### 2.2 Check-out & Kalkulasi Poin

```mermaid
sequenceDiagram
    actor Siswa
    participant Frontend
    participant CheckinsLib as lib/data/checkins.ts
    participant DB as Supabase (table_checkins, orders, profiles)

    Siswa->>Frontend: Klik "Check-out"
    Frontend->>CheckinsLib: completeCheckIn(id)
    CheckinsLib->>DB: SELECT * FROM table_checkins WHERE id = id
    DB-->>CheckinsLib: existing row

    alt existing.check_out_at sudah terisi
        CheckinsLib-->>Frontend: kembalikan data apa adanya
    else belum check-out
        CheckinsLib->>CheckinsLib: elapsedMinutes = (now - check_in_at) / 60000
        CheckinsLib->>CheckinsLib: isOnTime = elapsedMinutes <= 15
        CheckinsLib->>CheckinsLib: pointsEarned = isOnTime ? 10 : 0
        CheckinsLib->>DB: UPDATE table_checkins SET check_out_at, is_on_time, points_earned
        DB-->>CheckinsLib: updated row
        CheckinsLib-->>Frontend: TableCheckIn

        Frontend->>DB: UPDATE orders SET status = 'selesai-disajikan' WHERE id = order_id
        alt pointsEarned > 0
            Frontend->>DB: UPDATE profiles SET points = points + 10 WHERE id = student_id
        end
        Frontend-->>Siswa: halaman sukses + tombol "Beri Rating"
    end
```

### 2.3 Tukar Poin ke Voucher

```mermaid
sequenceDiagram
    actor Siswa
    participant Frontend
    participant PointsLib as lib/data/points.ts
    participant DB as Supabase (vouchers, point_history, profiles)

    Siswa->>Frontend: Klik "Tukar 100 Poin"
    Frontend->>PointsLib: redeemVoucher(studentId, currentPoints)

    alt currentPoints < 100
        PointsLib-->>Frontend: null
        Frontend-->>Siswa: "Poin belum cukup"
    else currentPoints >= 100
        PointsLib->>DB: INSERT INTO vouchers {student_id, points_cost:100, discount_amount:5000, is_used:false}
        DB-->>PointsLib: voucher row
        PointsLib->>DB: INSERT INTO point_history {student_id, points:-100, reason:'Ditukar ke voucher diskon'}
        PointsLib-->>Frontend: Voucher
        Frontend->>DB: UPDATE profiles SET points = points - 100
        Frontend-->>Siswa: tampilkan voucher baru
    end
```

---

## 3. Data Access Contract

### 3.1 `createCheckIn(orderId, studentId, tableNumber): Promise<TableCheckIn>`

INSERT `table_checkins`; `check_in_at` diisi otomatis oleh `DEFAULT NOW()`.

### 3.2 `completeCheckIn(id): Promise<TableCheckIn | undefined>`

Idempoten: jika `checkOutAt` sudah terisi, mengembalikan data tanpa perubahan lagi.

Formula:

```ts
elapsedMinutes = (checkOutAt.getTime() - checkInAt.getTime()) / 60000
isOnTime = elapsedMinutes <= BUSINESS_RULES.CHECKOUT_TIME_LIMIT_MINUTES // 15
pointsEarned = isOnTime ? BUSINESS_RULES.POINTS_PER_ON_TIME_CHECKOUT : 0 // 10 : 0
```

### 3.3 `addPointEntry(studentId, points, reason): Promise<PointHistoryEntry>`

INSERT `point_history`. Nilai `points` positif untuk didapat, negatif untuk ditukar.

### 3.4 `redeemVoucher(studentId, currentPoints): Promise<Voucher | null>`

Menolak (`return null`) jika `currentPoints < BUSINESS_RULES.POINTS_TO_VOUCHER_RATIO` (100). Jika lolos: INSERT `vouchers`, lalu panggil `addPointEntry` dengan nilai negatif.

**Catatan implementasi:** pemanggil (halaman `/poin`) tetap bertanggung jawab mengurangi `profiles.points` di sesi lewat `addPoints(-100)` — `redeemVoucher` sendiri tidak mengubah tabel `profiles`.

---

## 4. Business Rules

| Rule | Description |
| --- | --- |
| BR-001 | `CHECKOUT_TIME_LIMIT_MINUTES = 15` |
| BR-002 | `POINTS_PER_ON_TIME_CHECKOUT = 10` |
| BR-003 | `POINTS_TO_VOUCHER_RATIO = 100` |
| BR-004 | `VOUCHER_DISCOUNT_AMOUNT = 5000` |
| BR-005 | Check-out kedua kali untuk sesi yang sama tidak menghitung ulang poin |

---

## 5. Traceability

| User Flow | Requirement | Data/API |
| --- | --- | --- |
| userflow_uc_004.md | F006, F007 | `table_checkins`, `point_history`, `vouchers`, `profiles` |
