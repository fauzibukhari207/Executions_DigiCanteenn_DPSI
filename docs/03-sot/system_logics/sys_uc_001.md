# System Logic: UC-001 Registrasi & Login

Document Version: v1.0

Use Case ID: UC-001

Use Case Name: Registrasi & Login

Status: As-Built

Last Updated: 2026-07-11

Author: System Analyst AI

---

## 1. Overview

Dokumen ini mendefinisikan logika sistem untuk registrasi dan login memakai Supabase Auth, termasuk pembacaan profil dan penjagaan akses halaman (`RequireAuth`). Sumber: `lib/auth/session.tsx`, `lib/auth/RequireAuth.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`.

---

## 2. Sequence Diagram

### 2.1 Login

```mermaid
sequenceDiagram
    actor User as Siswa/Penjual
    participant Frontend
    participant SupabaseAuth
    participant DB as Supabase (profiles)

    User->>Frontend: Buka /login, isi email+password
    Frontend->>SupabaseAuth: signInWithPassword(email, password)
    alt Kredensial valid
        SupabaseAuth-->>Frontend: session + user.id
        Frontend->>DB: SELECT * FROM profiles WHERE id = user.id
        DB-->>Frontend: profile row
        Frontend->>Frontend: setUser(mapProfileRow(row))
        Frontend-->>User: redirect /beranda atau /dashboard
    else Kredensial salah
        SupabaseAuth-->>Frontend: error
        Frontend-->>User: tampilkan pesan error
    end
```

### 2.2 Register

```mermaid
sequenceDiagram
    actor User as Siswa/Penjual
    participant Frontend
    participant SupabaseAuth
    participant DB as Supabase (profiles)

    User->>Frontend: Buka /register, isi form + pilih role
    Frontend->>Frontend: Validasi (email, password >= 6, konfirmasi cocok)
    Frontend->>SupabaseAuth: signUp(email, password, {data:{name, role}})
    alt session langsung tersedia
        SupabaseAuth-->>Frontend: session + user
        Frontend->>DB: SELECT profile by user.id
        DB-->>Frontend: profile row (dibuat via trigger DB)
        Frontend-->>User: redirect sesuai role
    else email confirmation aktif (tanpa session)
        Frontend->>SupabaseAuth: signInWithPassword(email, password) [retry]
        alt retry sukses
            SupabaseAuth-->>Frontend: session
            Frontend-->>User: redirect sesuai role
        else retry gagal
            Frontend-->>User: "cek email verifikasi / matikan Confirm Email"
        end
    end
```

### 2.3 Session Restore & Route Guard

```mermaid
sequenceDiagram
    actor User
    participant Page as Halaman Terproteksi
    participant RequireAuth
    participant SessionContext
    participant SupabaseAuth

    User->>Page: Akses halaman (mis. /beranda)
    Page->>RequireAuth: render dengan role opsional
    RequireAuth->>SessionContext: baca isLoading, user
    SessionContext->>SupabaseAuth: getSession() (saat mount)
    SupabaseAuth-->>SessionContext: session (jika ada)
    SessionContext->>SessionContext: fetchProfile() jika session ada
    SessionContext-->>RequireAuth: isLoading=false, user

    alt isLoading
        RequireAuth-->>User: tampilkan "Memuat..."
    else !user
        RequireAuth-->>User: router.replace('/login')
    else role mismatch
        RequireAuth-->>User: router.replace('/beranda' atau '/dashboard')
    else allowed
        RequireAuth-->>Page: render children
    end
```

---

## 3. Data Access Contract

### 3.1 `supabase.auth.signInWithPassword({ email, password })`

**Response sukses:** `{ data: { user, session }, error: null }`

**Response gagal:** `{ data: { user: null, session: null }, error: { message } }`

### 3.2 `supabase.auth.signUp({ email, password, options: { data: { name, role } } })`

**Catatan (terkonfirmasi dari komentar kode `app/(auth)/register/page.tsx`):** baris `profiles` dibuat otomatis lewat trigger database bernama **`handle_new_user()`** yang didefinisikan di `supabase_schema.sql`, dipicu begitu `auth.users` baru terbentuk, mengambil `name`/`role` dari `user_metadata` yang dikirim saat `signUp()`. Ini bukan lagi dugaan — disebutkan eksplisit di komentar kode, walau isi persis triggernya sendiri tidak ikut ter-upload.

### 3.3 `supabase.from('profiles').select('*').eq('id', userId).maybeSingle()`

**Mapping baris → `User`:**

```ts
{
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,            // 'siswa' | 'penjual'
  walletBalance: row.wallet_balance,
  points: row.points,
}
```

### 3.4 `supabase.from('profiles').update({ name }).eq('id', user.id)`

Dipakai saat edit nama profil di `/profil` — optimistic update di client, rollback ke nama lama jika query gagal.

### 3.5 `supabase.auth.signOut()`

Dipanggil dari tombol "Logout" di NavDrawer/Profil; `setUser(null)` setelahnya.

---

## 4. Business Rules

| Rule | Description |
| --- | --- |
| BR-001 | Password minimal 6 karakter (validasi frontend, bukan constraint database) |
| BR-002 | Role tidak dapat diganti sendiri oleh pengguna setelah registrasi lewat form login |
| BR-003 | `RequireAuth` menunggu `isLoading` selesai sebelum memutuskan redirect, mencegah "kedip" ke halaman Login |
| BR-004 | Perubahan nama minimal 3 karakter (validasi di `updateName`) |

---

## 5. Traceability

| User Flow | Requirement | Data/API |
| --- | --- | --- |
| userflow_uc_001.md | F001 | `supabase.auth.*`, tabel `profiles` |
