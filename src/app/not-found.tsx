import Link from "next/link";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-center items-center px-4 text-center font-sans">
      <Heart className="h-12 w-12 text-gold mb-4 animate-pulse" />
      <h1 className="text-4xl font-serif text-olive font-light mb-2">404</h1>
      <h2 className="text-xl font-serif text-olive mb-4">Página no encontrada</h2>
      <p className="text-xs text-olive-light font-sans max-w-sm mb-6">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="border border-gold text-olive py-2.5 px-6 rounded-lg text-xs font-semibold hover:bg-cream-dark transition-colors"
      >
        Volver a la Invitación
      </Link>
    </div>
  );
}
