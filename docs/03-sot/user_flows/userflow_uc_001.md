# User Flow Specification

Document Version: v1.0

Use Case ID: UC-001
Use Case Name: Registrasi & Login

Status: As-Built
Last Updated: 2026-07-11
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Siswa atau Penjual mendaftarkan akun baru (memilih peran) atau masuk ke akun yang sudah ada memakai Supabase Auth (email & password). Peran (`role`) tidak dipilih manual saat login — sistem membacanya otomatis dari tabel `profiles` yang terhubung ke akun Auth.

## 1.2 Goal

Pengguna ingin memiliki akses ke area aplikasi yang sesuai perannya (area Siswa atau area Penjual) dengan aman.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F001|Registrasi & Login|
|BR (Security)|Autentikasi via Supabase Auth, peran dari tabel `profiles`|

## 1.4 Primary Actor

Siswa, Penjual

## 1.5 Supporting Actors

Supabase Auth, Sistem (RequireAuth guard)

---

# 2. TRIGGER

Pengguna mengakses `/` tanpa sesi aktif dan menekan "Masuk"/"Daftar", atau `RequireAuth` me-redirect pengguna tanpa sesi ke `/login`.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Untuk Login: pengguna sudah memiliki akun terdaftar di Supabase Auth + baris `profiles` terkait|
|PRE-002|Untuk Register: email yang dipakai belum terdaftar|
|PRE-003|`.env.local` sudah diisi kredensial Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)|

---

# 4. MAIN FLOW (Login)

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna membuka `/login`|Sistem menampilkan form email & password (layout `fixed inset-0`, tanpa sidebar)|
|2|Pengguna mengisi email & password, klik "Masuk"|Frontend memanggil `supabase.auth.signInWithPassword({ email, password })`|
|3||Supabase Auth memverifikasi kredensial|
|4||Sistem mengambil profil dari tabel `profiles` (`fetchProfile`) berdasarkan `user.id`|
|5||Sistem menyimpan `user` di `SessionContext` dan redirect: `role='siswa'` → `/beranda`, `role='penjual'` → `/dashboard`|

---

# 4B. MAIN FLOW (Register)

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna membuka `/register`|Sistem menampilkan form nama, email, password, konfirmasi password, dan `RoleToggle` (Siswa/Penjual)|
|2|Pengguna mengisi form dan klik "Daftar"|Frontend memvalidasi: email valid, password ≥ 6 karakter, konfirmasi password cocok|
|3||Frontend memanggil `supabase.auth.signUp({ email, password, options: { data: { name, role } } })`|
|4||Jika `data.session` langsung ada (email confirmation nonaktif) → ambil profil & set sesi. Jika tidak → sistem mencoba `signInWithPassword` otomatis sekali|
|5||Sukses → redirect sesuai peran. Gagal karena email confirmation aktif → tampilkan pesan agar cek email|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Login dengan Kredensial Salah

### Condition

Email atau password tidak sesuai data Supabase Auth.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna klik "Masuk"|`signInWithPassword` mengembalikan error|
|2||Sistem menampilkan pesan error dari Supabase (mis. "Invalid login credentials") di bawah form|
|3|Pengguna memasukkan ulang kredensial|Kembali ke Main Flow step 2|

---

## AF-002: Registrasi dengan Email Sudah Terdaftar

### Condition

Email yang didaftarkan sudah dipakai akun lain.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna klik "Daftar"|`signUp` mengembalikan error dari Supabase|
|2||Sistem menampilkan pesan error terkait email sudah terdaftar|

---

## AF-003: Sesi Login Sudah Aktif

### Condition

Pengguna yang sudah login mengakses `/login` atau `/register` secara langsung.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna mengakses `/login` atau `/register`|Landing/halaman auth mendeteksi sesi aktif dari `SessionContext`|
|2||Sistem redirect otomatis ke `/beranda` (siswa) atau `/dashboard` (penjual)|

---

# 6. EXCEPTION FLOWS

## EF-001: Supabase Belum Dikonfigurasi

### Condition

`.env.local` kosong (`isSupabaseConfigured = false`).

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna klik "Masuk"/"Daftar"|Sistem mendeteksi `!supabase`|
|2||Sistem menampilkan pesan "Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu."|

---

## EF-002: Verifikasi Email Masih Aktif

### Condition

Fitur "Confirm email" masih aktif di project Supabase, sehingga `signUp` tidak langsung memberi sesi.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna mendaftar|`signUp` sukses tapi tanpa `session`|
|2||Sistem mencoba `signInWithPassword` sekali; jika gagal, tampilkan pesan untuk cek email konfirmasi atau matikan "Confirm email" di dashboard Supabase (mode dev)|

---

## EF-003: Halaman Terproteksi Diakses Sebelum Sesi Selesai Dibaca

### Condition

Sesi baru selesai dibaca dari Supabase beberapa saat setelah halaman dimuat (`isLoading = true`).

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna refresh halaman terproteksi|`RequireAuth` menampilkan shell "Memuat..." selama `isLoading`|
|2||Setelah sesi terbaca, sistem baru memutuskan redirect atau menampilkan konten (mencegah "kedip" balik ke Login)|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Pengguna memiliki sesi Supabase Auth aktif|
|POST-002|`SessionContext.user` terisi (id, name, role, email, walletBalance, points)|
|POST-003|Pengguna diarahkan ke area sesuai peran (`/beranda` atau `/dashboard`)|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-001|Password minimal 6 karakter (validasi frontend saat registrasi)|
|BR-002|Peran (`role`) ditentukan saat registrasi dan disimpan di `profiles`; tidak dapat dipilih ulang saat login|
|BR-003|Semua halaman siswa/penjual wajib login, dijaga `RequireAuth`|
|BR-004|Role salah yang mengakses area lain otomatis di-redirect ke area yang benar|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-001|Landing|
|PAGE-002|Login|
|PAGE-003|Register|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|profiles|Membaca profil (name, role, wallet_balance, points) setelah autentikasi berhasil|

## 10.2 Data Created

|Entity|Description|
|---|---|
|auth.users (Supabase Auth)|Akun baru saat registrasi|
|profiles|Baris profil baru terhubung ke `auth.users.id`|

## 10.3 Data Updated

|Entity|Description|
|---|---|
|None|Tidak ada data yang diupdate pada alur ini|

## 10.4 Data Deleted

|Entity|Description|
|---|---|
|None|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|Guest|AKSI (ALLOWED) — akses `/login`, `/register`|
|Siswa|AKSI (ALLOWED) — login/register, redirect ke `/beranda`|
|Penjual|AKSI (ALLOWED) — login/register, redirect ke `/dashboard`|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Pengguna dapat login dengan email & password valid dan diarahkan ke area sesuai perannya|
|AC-002|Pengguna dapat mendaftar akun baru dengan memilih peran Siswa/Penjual|
|AC-003|Sistem menampilkan pesan error yang jelas untuk kredensial salah atau email terdaftar|
|AC-004|Pengguna dengan sesi aktif yang mengakses `/login`/`/register` otomatis di-redirect|
|AC-005|Halaman terproteksi tidak "kedip" ke Login saat sesi masih dalam proses dibaca|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F001|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-001|
|PAGE-002|
|PAGE-003|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|1.0|2026-07-11|System Analyst AI|Initial as-built draft|
