'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';

/**
 * Halaman Login — sejak migrasi Supabase, ini sudah auth beneran.
 * Role TIDAK dipilih manual lagi di sini (beda dari versi mock) --
 * role sudah ditentukan saat Register dan disimpan di tabel `profiles`,
 * jadi otomatis dipakai untuk menentukan halaman tujuan setelah login.
 */
export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Email tidak valid';
    if (password.length < 6) next.password = 'Password minimal 6 karakter';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const { error, role } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrors({ form: 'Email atau password salah. Coba lagi.' });
      return;
    }

    router.push(role === 'penjual' ? '/dashboard' : '/beranda');
  };

  return (
    <>
      <h1 className="font-headline-md text-headline-md uppercase mb-2">Masuk</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-6">
        Masuk untuk memesan makanan atau mengelola tokomu.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
        />

        {errors.form && (
          <p className="font-mono text-label-sm uppercase text-error border-2 border-error px-4 py-3">
            {errors.form}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>

      <p className="font-body-sm text-body-sm text-center mt-6">
        Belum punya akun?{' '}
        <Link href="/register" className="font-bold underline decoration-2 underline-offset-4">
          Daftar di sini
        </Link>
      </p>
    </>
  );
}
