export default function Footer() {
  return (
    <footer className="w-full bg-surface-dim border-t-4 border-outline mt-auto">
      <div className="max-w-container-max mx-auto px-gutter py-margin grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div>
          <h2 className="font-headline-md text-headline-md font-black uppercase text-primary mb-2 inline-block bg-surface-container-lowest border-2 border-outline shadow-sm px-3 py-1">
            DigiCanteen
          </h2>
          <p className="font-mono text-label-sm uppercase mt-4">
            © 2026 DigiCanteen — SMAN 1 Prambanan
          </p>
        </div>
        <div className="flex flex-wrap md:justify-end gap-6">
          <a className="font-mono text-label-bold uppercase hover:underline decoration-2 underline-offset-4" href="#">
            Lacak Pesanan
          </a>
          <a className="font-mono text-label-bold uppercase hover:underline decoration-2 underline-offset-4" href="#">
            Info Sekolah
          </a>
          <a className="font-mono text-label-bold uppercase hover:underline decoration-2 underline-offset-4" href="#">
            Bantuan
          </a>
        </div>
      </div>
    </footer>
  );
}
