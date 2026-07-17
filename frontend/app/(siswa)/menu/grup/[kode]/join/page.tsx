'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';
import { useCart } from '@/lib/cart/CartContext';
import { getGroupOrder, joinGroupOrder } from '@/lib/data/groups';
import type { GroupOrder } from '@/lib/types';

export default function JoinGroupOrderPage({ params }: { params: { kode: string } }) {
  const router = useRouter();
  const { user } = useSession();
  const { setGroupCode } = useCart();
  const [group, setGroup] = useState<GroupOrder | null | undefined>(undefined); // undefined = belum dicek
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGroupOrder(params.kode).then((found) => {
      if (!cancelled) setGroup(found ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [params.kode]);

  const handleJoin = async () => {
    if (!user) return;
    setIsJoining(true);
    const updated = await joinGroupOrder(params.kode, user.id);
    setIsJoining(false);
    if (updated) {
      setGroup(updated);
      setGroupCode(updated.code);
      setHasJoined(true);
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[60vh] justify-center">
      {group === undefined ? (
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Mengecek kode grup...</p>
      ) : group === null ? (
        <>
          <span className="text-5xl" aria-hidden>
            😕
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">Kode Tidak Ditemukan</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Kode <strong className="font-mono">{params.kode.toUpperCase()}</strong> tidak ditemukan. Pastikan kode
            yang kamu masukkan sudah benar.
          </p>
          <Link href="/menu/grup/buat">
            <Button variant="primary">Buat Group Order Baru</Button>
          </Link>
        </>
      ) : !user ? (
        <>
          <p className="font-mono text-label-bold uppercase text-on-surface-variant">
            Kamu harus login dulu untuk gabung Group Order.
          </p>
          <Link href="/login">
            <Button variant="primary">Masuk</Button>
          </Link>
        </>
      ) : (
        <>
          <span className="text-5xl" aria-hidden>
            🙋
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">
            Gabung Group <span className="font-mono">{group.code}</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            {group.memberIds.length} orang sudah bergabung di grup ini.
          </p>

          {hasJoined ? (
            <Button variant="primary" onClick={() => router.push(`/menu/grup/${group.code}`)}>
              Lihat Halaman Grup
            </Button>
          ) : (
            <Button variant="primary" onClick={handleJoin} disabled={isJoining}>
              {isJoining ? 'Bergabung...' : 'Gabung Sekarang'}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
