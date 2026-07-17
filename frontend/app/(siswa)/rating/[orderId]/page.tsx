'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import StarRatingInput from '@/components/ui/StarRating';
import { useSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/data/orders';
import { getMenuItemsByIds } from '@/lib/data/menu';
import { addRating, getRatingsForOrder } from '@/lib/data/ratings';
import type { Order, MenuItem } from '@/lib/types';

interface DraftRating {
  stars: 1 | 2 | 3 | 4 | 5 | 0;
  comment: string;
}

export default function RatingPage({ params }: { params: { orderId: string } }) {
  const { user } = useSession();

  const [order, setOrder] = useState<Order | null | undefined>(undefined); // undefined = masih dicek
  const [menuById, setMenuById] = useState<Record<string, MenuItem>>({});
  const [drafts, setDrafts] = useState<Record<string, DraftRating>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const foundOrder = await getOrderById(params.orderId);
      if (cancelled) return;
      setOrder(foundOrder ?? null);
      if (!foundOrder) return;

      const [menuItems, existingRatings] = await Promise.all([
        getMenuItemsByIds(foundOrder.items.map((i) => i.menuItemId)),
        getRatingsForOrder(params.orderId),
      ]);
      if (cancelled) return;

      const menuMap: Record<string, MenuItem> = {};
      menuItems.forEach((m) => {
        menuMap[m.id] = m;
      });
      setMenuById(menuMap);

      const myRatings = existingRatings.filter((r) => r.studentId === user!.id);
      const initialDrafts: Record<string, DraftRating> = {};
      foundOrder.items.forEach((line) => {
        const existing = myRatings.find((r) => r.menuItemId === line.menuItemId);
        initialDrafts[line.menuItemId] = { stars: existing?.stars ?? 0, comment: existing?.comment ?? '' };
      });
      setDrafts(initialDrafts);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.orderId, user]);

  if (!user) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Login dulu untuk kasih rating.</p>
        <Link href="/login">
          <Button variant="primary">Masuk</Button>
        </Link>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin text-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant animate-pulse">Memuat pesanan...</p>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <p className="font-mono text-label-bold uppercase text-on-surface-variant">Pesanan tidak ditemukan.</p>
        <Link href="/pesanan">
          <Button variant="primary">Lihat Riwayat Pesanan</Button>
        </Link>
      </div>
    );
  }

  const setStars = (menuItemId: string, stars: 1 | 2 | 3 | 4 | 5) => {
    setDrafts((prev) => ({ ...prev, [menuItemId]: { ...prev[menuItemId], stars } }));
  };

  const setComment = (menuItemId: string, comment: string) => {
    setDrafts((prev) => ({ ...prev, [menuItemId]: { ...prev[menuItemId], comment } }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await Promise.all(
      order.items.map((line) => {
        const draft = drafts[line.menuItemId];
        if (draft && draft.stars > 0) {
          return addRating({
            orderId: order.id,
            menuItemId: line.menuItemId,
            studentId: user.id,
            stars: draft.stars as 1 | 2 | 3 | 4 | 5,
            comment: draft.comment.trim() || undefined,
          });
        }
        return Promise.resolve();
      })
    );
    setIsSubmitting(false);
    setSubmitted(true);
  };

  // Cuma menu yang datanya beneran ketemu (dan makanya ditampilkan di
  // layar) yang wajib dirating. Kalau ada menu di pesanan yang datanya
  // sudah hilang (misal dihapus penjual setelah pesanan dibuat), jangan
  // sampai itu bikin tombol kirim rating "macet" selamanya.
  const renderableItems = order.items.filter((line) => menuById[line.menuItemId]);
  const allRated =
    renderableItems.length > 0 && renderableItems.every((line) => (drafts[line.menuItemId]?.stars ?? 0) > 0);

  if (submitted) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col items-center text-center gap-6 min-h-[50vh] justify-center">
        <span className="text-5xl" aria-hidden>
          🙏
        </span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase max-w-md">
          Terima Kasih atas Ratingnya!
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Rating kamu membantu penjual kantin meningkatkan kualitas makanan.
        </p>
        <div className="flex gap-3">
          <Link href="/beranda">
            <Button variant="primary">Kembali ke Beranda</Button>
          </Link>
          <Link href="/pesanan">
            <Button variant="outline">Riwayat Pesanan</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-gutter py-margin flex flex-col gap-margin max-w-2xl">
      <div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-2">Beri Rating Makanan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Pesanan #{order.id.slice(-6).toUpperCase()} — beri bintang untuk tiap menu yang kamu pesan.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {order.items.map((line) => {
          const item = menuById[line.menuItemId];
          if (!item) return null;
          const draft = drafts[line.menuItemId] ?? { stars: 0, comment: '' };

          return (
            <div key={line.menuItemId} className="border-3 border-outline shadow-md bg-surface-container-lowest p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover border-2 border-outline shrink-0" />
                <h3 className="font-headline-md text-lg font-extrabold uppercase">{item.name}</h3>
              </div>
              <StarRatingInput value={draft.stars} onChange={(stars) => setStars(line.menuItemId, stars)} size="large" />
              <textarea
                value={draft.comment}
                onChange={(e) => setComment(line.menuItemId, e.target.value)}
                placeholder="Komentar (opsional)..."
                rows={2}
                className="w-full border-2 border-outline bg-surface-container-lowest px-4 py-3 font-body-md text-body-md outline-none focus:shadow-sm resize-none"
              />
            </div>
          );
        })}
      </div>

      <Button variant="primary" fullWidth disabled={!allRated || isSubmitting} onClick={handleSubmit}>
        {isSubmitting
          ? 'Mengirim...'
          : renderableItems.length === 0
            ? 'Menu di pesanan ini sudah tidak tersedia'
            : allRated
              ? 'Kirim Rating'
              : 'Beri bintang untuk semua menu dulu'}
      </Button>
    </div>
  );
}
