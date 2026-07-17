import type { Metadata } from 'next';
import { Archivo_Narrow, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/lib/auth/session';
import { CartProvider } from '@/lib/cart/CartContext';

// Archivo Narrow hanya tersedia sampai weight statis 700 di Google
// Fonts. Supaya font-black/font-extrabold (800/900) yang dipakai di
// banyak komponen tetap tampil sesuai desain, kita load versi
// "variable" fontnya (mendukung seluruh rentang weight 100-900),
// bukan array weight tetap.
const archivo = Archivo_Narrow({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DigiCanteen',
  description: 'Solusi modern untuk pemesanan makanan kantin sekolah.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${archivo.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <CartProvider>{children}</CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
