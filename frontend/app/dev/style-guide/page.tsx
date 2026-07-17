'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import SideNav from '@/components/layout/SideNav';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Chip from '@/components/ui/Chip';
import Checkbox from '@/components/ui/Checkbox';
import QuantityStepper from '@/components/ui/QuantityStepper';
import { useSession } from '@/lib/auth/session';

const CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'lunch', label: 'Lunch', icon: '🍱' },
  { id: 'snacks', label: 'Snacks', icon: '🍪' },
  { id: 'drinks', label: 'Drinks', icon: '🥤' },
];

/**
 * Halaman ini BUKAN bagian dari alur aplikasi untuk pengguna akhir.
 * Ini adalah "living style guide" internal untuk cek cepat apakah
 * semua komponen dasar (Button, Card, Badge, dst) masih terpasang &
 * berfungsi sesuai Design_System__DS_.md v3.0. Sengaja ditaruh di
 * /dev/style-guide (bukan di "/") supaya tidak tertukar dengan
 * halaman landing yang beneran dilihat siswa/penjual.
 */
export default function StyleGuidePage() {
  const [qty, setQty] = useState(1);
  const { user, logout } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader cartCount={2} />

      <div className="flex flex-1 max-w-container-max w-full mx-auto">
        <SideNav items={CATEGORIES} />

        <main className="flex-1 px-gutter py-margin flex flex-col gap-margin">
          <div>
            <span className="inline-block font-mono text-label-sm uppercase bg-error-container border-2 border-outline px-3 py-1 mb-4">
              Halaman Dev — Living Style Guide, bukan halaman final
            </span>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase leading-none">
              Komponen Dasar DigiCanteen
            </h1>
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md uppercase">Status Sesi (Auth Batch 2)</h2>
            {user ? (
              <div className="flex flex-wrap items-center gap-4 border-3 border-outline shadow-md p-4 bg-surface-container-lowest">
                <span className="font-mono text-label-bold uppercase">
                  Login sebagai <strong>{user.name}</strong> ({user.role}) — {user.email}
                </span>
                <Button variant="outline" onClick={logout}>
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4 border-3 border-outline shadow-md p-4 bg-surface-container-lowest">
                <span className="font-mono text-label-bold uppercase">Belum login</span>
                <Link href="/login">
                  <Button variant="primary">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Daftar</Button>
                </Link>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md uppercase">Halaman Siswa (Batch 3-5)</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/beranda">
                <Button variant="primary">Buka Beranda</Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline">Buka Daftar Menu</Button>
              </Link>
              <Link href="/keranjang">
                <Button variant="outline">Buka Keranjang</Button>
              </Link>
              <Link href="/poin">
                <Button variant="outline">Buka Halaman Poin</Button>
              </Link>
              <Link href="/pesanan">
                <Button variant="outline">Buka Riwayat Pesanan</Button>
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md uppercase">Halaman Penjual (Batch 7-8)</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button variant="primary">Buka Dasbor</Button>
              </Link>
              <Link href="/kelola-menu">
                <Button variant="outline">Buka Kelola Menu</Button>
              </Link>
              <Link href="/pesanan-masuk">
                <Button variant="outline">Buka Pesanan Masuk</Button>
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md uppercase">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Add to Order</Button>
              <Button variant="secondary">Filter Aktif</Button>
              <Button variant="outline">Secondary Action</Button>
              <Button variant="danger">Hapus</Button>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md uppercase">Badges</h2>
            <div className="flex flex-wrap gap-3">
              <Badge tone="tertiary">Best Seller</Badge>
              <Badge tone="secondary">Kids Favorite</Badge>
              <Badge tone="primary">Healthy Choice</Badge>
              <Badge tone="error">Habis</Badge>
              <Badge tone="neutral">450 kcal</Badge>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md uppercase">Filter Chips</h2>
            <div className="flex flex-wrap gap-3">
              <Chip active>All Items</Chip>
              <Chip>🔥 Spicy</Chip>
              <Chip>🌱 Vegetarian</Chip>
              <Chip>⚡ Quick Grab</Chip>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md uppercase">Quantity Stepper &amp; Checkbox</h2>
            <div className="flex items-center gap-10 flex-wrap">
              <QuantityStepper value={qty} onChange={setQty} />
              <Checkbox label="Healthy Choice" defaultChecked />
              <Checkbox label="Halal Certified" />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md uppercase">Menu Card (contoh)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Spicy Chicken Crunch', price: 'Rp 28.000', tone: 'tertiary' as const, badge: 'Best Seller' },
                { name: 'Happy Chicken Bento', price: 'Rp 25.000', tone: 'secondary' as const, badge: 'Kids Favorite' },
                { name: 'Tomato Basil Pasta', price: 'Rp 20.000', tone: 'primary' as const, badge: 'Healthy Choice' },
              ].map((item) => (
                <Card key={item.name} className="flex flex-col">
                  <div className="h-32 bg-gradient-to-br from-secondary-container to-primary-container border-b-2 border-outline relative">
                    <Badge tone={item.tone} className="absolute top-2 left-2">
                      {item.badge}
                    </Badge>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <h3 className="font-headline-md text-lg font-extrabold uppercase">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-primary bg-surface-container-lowest border-2 border-outline px-2 py-1">
                        {item.price}
                      </span>
                      <button className="squishy w-9 h-9 bg-primary-container text-on-primary border-2 border-outline flex items-center justify-center font-black">
                        +
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
