'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import MenuForm, { MenuFormValues } from '@/components/menu/MenuForm';
import { useSession } from '@/lib/auth/session';
import { createMenuItem } from '@/lib/data/menu';

export default function TambahMenuPage() {
  const router = useRouter();
  const { user } = useSession();

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

  const handleSubmit = async (values: MenuFormValues) => {
    await createMenuItem({ ...values, sellerId: user.id });
    router.push('/kelola-menu');
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin max-w-2xl flex flex-col gap-margin">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Tambah Menu Baru</h1>
      <MenuForm onSubmit={handleSubmit} submitLabel="Simpan Menu" />
    </div>
  );
}
