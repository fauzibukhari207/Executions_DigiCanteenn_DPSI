'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';
import { useCart } from '@/lib/cart/CartContext';
import { createGroupOrder } from '@/lib/data/groups';
import type { GroupOrder } from '@/lib/types';

export default function BuatGroupOrderPage() {
  const router = useRouter();
  const { user } = useSession();
  const { setGroupCode } = useCart();
  const [group, setGroup] = useState<GroupOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    setIsCreating(true);
    const newGroup = await createGroupOrder(user.id);
    setIsCreating(false);
    setGroup(newGroup);
    setGroupCode(newGroup.code);
  };

  const joinUrl =
    group && typeof window !== 'undefined' ? `${window.location.origin}/menu/grup/${group.code}/join` : '';

  const handleCopy = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard bisa gagal di beberapa browser/permission — abaikan dengan tenang
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[60vh] justify-center">
      {!user ? (
        <>
          <p className="font-mono text-label-bold uppercase text-on-surface-variant">
            Kamu harus login dulu untuk membuat Group Order.
          </p>
          <Link href="/login">
            <Button variant="primary">Masuk</Button>
          </Link>
        </>
      ) : !group ? (
        <>
          <span className="text-5xl" aria-hidden>
            👥
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase max-w-md">
            Buat Group Order
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Undang teman satu meja untuk pesan bareng dalam satu grup. Kamu jadi host grup ini.
          </p>
          <Button variant="primary" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Membuat...' : 'Buat Group Sekarang'}
          </Button>
        </>
      ) : (
        <>
          <span className="text-5xl" aria-hidden>
            🎉
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Group Order Dibuat!</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Bagikan kode ini ke teman-temanmu supaya bisa gabung.
          </p>

          <div className="bg-secondary-container border-4 border-outline shadow-lg px-10 py-6">
            <span className="font-mono text-[40px] font-black tracking-[0.3em]">{group.code}</span>
          </div>

          <Button variant="outline" onClick={handleCopy}>
            {copied ? 'Link Disalin ✓' : 'Salin Link Undangan'}
          </Button>

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Button variant="primary" onClick={() => router.push(`/menu/grup/${group.code}`)}>
              Lihat Halaman Grup
            </Button>
            <Link href="/menu">
              <Button variant="outline">Pilih Menu</Button>
            </Link>
          </div>

          <p className="font-mono text-label-sm uppercase text-on-surface-variant max-w-md mt-4">
            Kode ini tersimpan di database, jadi teman kamu bisa gabung dari HP mana pun selama mereka login dan
            buka link undangannya.
          </p>
        </>
      )}
    </div>
  );
}
