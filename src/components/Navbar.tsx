import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-black/40 border-b border-white/5 transition-all">
      {/* Logo a la izquierda */}
      <Link href="/" className="relative flex items-center">
        <Image 
          src="/logo_Rs.png" 
          alt="Logo Real Sacerdocio" 
          width={120} 
          height={40} 
          className="object-contain w-auto h-8 md:h-10" 
          priority
        />
      </Link>
      
      {/* Menú de enlaces (Centrado o a la derecha) */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300 absolute left-1/2 transform -translate-x-1/2">
        <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
        <Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link>
        <Link href="/#comunidades" className="hover:text-white transition-colors">Comunidades</Link>
        <Link href="/predicas" className="hover:text-white transition-colors">Prédicas</Link>
        <Link href="/galeria" className="hover:text-white transition-colors">Galería</Link>
      </div>

      {/* Espacio vacío para mantener el balance (opcional) */}
      <div className="w-10 hidden md:block"></div>
    </nav>
  );
}