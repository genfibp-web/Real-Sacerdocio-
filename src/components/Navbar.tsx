"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Inicio", href: "/" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Comunidades", href: "/#comunidades" },
    { name: "Feed General", href: "/feed" },
    { name: "Prédicas", href: "/predicas" },
    { name: "Galería", href: "/galeria" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-black/40 border-b border-white/5 transition-all">
        
        {/* LOGO CON ANIMACIÓN */}
        <Link href="/" className="relative flex items-center z-50 group">
          <Image 
            src="/logo_Rs.png" 
            alt="Logo Real Sacerdocio" 
            width={120} 
            height={40} 
            className="object-contain w-auto h-8 md:h-10 animate-logo-spin" 
            priority
          />
        </Link>
        
        {/* Menú de escritorio */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300 absolute left-1/2 transform -translate-x-1/2">
          {links.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-white transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Botón de menú móvil */}
        <button 
          className="md:hidden text-white p-2 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Menú desplegable móvil */}
      <div className={`fixed inset-0 bg-real-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-6 transition-all duration-300 md:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {links.map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            onClick={() => setIsOpen(false)}
            className="text-2xl font-serif font-bold text-gray-300 hover:text-real-gold transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </>
  );
}