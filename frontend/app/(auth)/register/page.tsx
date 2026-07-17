'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import RoleToggle from '@/components/ui/RoleToggle';
import { useSession } from '@/lib/auth/session';
import type { UserRole } from '@/lib/types';

/**
 * Halaman Register — sejak migrasi Supabase, akun beneran dibuat
 * lewat `supabase.auth.signUp`, lalu trigger `handle_new_user()` di
 * database (lihat supabase_schema.sql) otomatis bikin baris di tabel
 * `profiles` dari `name`/`role` yang dikirim di sini.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useSession();

  const [role, setRole] = useState<UserRole>('siswa');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (name.trim().length < 3) next.name = 'Nama minimal 3 karakter';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Email tidak valid';
    if (password.length < 6) next.password = 'Password minimal 6 karakter';
    if (confirmPassword !== password) next.confirmPassword = 'Konfirmasi password tidak cocok';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const { error } = await signUp(email, password, name.trim(), role);
    setIsSubmitting(false);

    if (error) {
      setErrors({ form: error });
      return;
    }

    router.push(role === 'penjual' ? '/dashboard' : '/beranda');
  };

  return (
    <>
      <h1 className="font-headline-md text-headline-md uppercase mb-2">Daftar Akun</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-6">
        Buat akun baru sebagai siswa atau penjual kantin.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <RoleToggle value={role} onChange={setRole} />

        <Input
          label="Nama Lengkap"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder={role === 'siswa' ? 'Nama Siswa' : 'Nama Kantin/Toko'}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="nama@sekolah.sch.id"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
        />
        <Input
          label="Konfirmasi Password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          placeholder="••••••••"
        />

        {errors.form && (
          <p className="font-mono text-label-sm uppercase text-error border-2 border-error px-4 py-3">
            {errors.form}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Daftar'}
        </Button>
      </form>

      <p className="font-body-sm text-body-sm text-center mt-6">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-bold underline decoration-2 underline-offset-4">
          Masuk di sini
        </Link>
      </p>
    </>
  );
}
