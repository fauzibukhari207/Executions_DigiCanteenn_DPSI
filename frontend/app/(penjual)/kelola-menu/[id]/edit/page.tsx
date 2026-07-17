'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import MenuForm, { MenuFormValues } from '@/components/menu/MenuForm';
import { useSession } from '@/lib/auth/session';
import { getMenuItemById, updateMenuItem } from '@/lib/data/menu';
import type { MenuItem } from '@/lib/types';

export default function EditMenuPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useSession();
  const [item, setItem] = useState<MenuItem | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getMenuItemById(params.id).then((found) => {
      if (!cancelled) setItem(found ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (!user) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Login dulu sebagai penjual.</p>
        <Link href="/login">
          <Button variant="primary">Masuk</Button>
        </Link>
      </div>
    );
  }

  if (item === undefined) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin text-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat menu...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Menu tidak ditemukan.</p>
        <Link href="/kelola-menu">
          <Button variant="primary">Kembali ke Kelola Menu</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (values: MenuFormValues) => {
    await updateMenuItem(item.id, values);
    router.push('/kelola-menu');
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin max-w-2xl flex flex-col gap-margin">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Edit Menu</h1>
      <MenuForm initial={item} onSubmit={handleSubmit} submitLabel="Simpan Perubahan" />
    </div>
  );
}
