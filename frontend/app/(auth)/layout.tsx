import Link from 'next/link';

/**
 * Layout auth (Login/Register). Sengaja pakai `fixed inset-0` +
 * `overflow-y-auto` (bukan `min-h-screen`) supaya benar-benar
 * center relatif ke viewport asli browser -- beberapa browser
 * (termasuk Arc dengan sidebar-nya) menghitung `100vh` sedikit
 * berbeda dari tinggi area konten yang benar-benar terlihat, yang
 * bikin `min-h-screen` kadang meleset dan kontennya nempel ke atas.
 * `overflow-y-auto` tetap menjaga formnya bisa di-scroll kalau
 * layar sangat pendek (mis. HP dengan keyboard terbuka).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-background">
      <div className="min-h-full flex flex-col items-center justify-center px-gutter py-margin">
        <Link
          href="/"
          className="mb-8 font-headline-md text-headline-md font-black uppercase italic bg-secondary-container border-2 border-outline shadow-sm px-4 py-1"
        >
          DigiCanteen
        </Link>
        <div className="w-full max-w-md bg-surface-container-lowest border-3 border-outline shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
