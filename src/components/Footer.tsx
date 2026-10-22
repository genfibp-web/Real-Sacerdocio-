import Link from "next/link";
import { MapPin, UserPlus } from "lucide-react"; // <-- Agregamos UserPlus
import PWAInstallButton from "./PWAInstallButton"; 

export default function Footer() {
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=18.44795697205258,-69.01268224147996";
  const instagramUrl = "https://www.instagram.com/realsacerdocio_1/?hl=es";

  return (
    <footer className="bg-black pt-6 pb-4 md:pt-16 md:pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-12 text-center md:text-left">
        
        {/* Columna 1: Logo y Redes */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-serif text-xl md:text-3xl font-bold text-white mb-1 md:mb-4">REAL SACERDOCIO</h4>
          <p className="text-gray-500 text-[11px] md:text-sm leading-tight mb-3 md:mb-6 max-w-[250px]">
            Un lugar de encuentro con Dios, donde cada persona puede encontrar propósito, comunidad y restauración.
          </p>
          
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 bg-white/5 hover:bg-real-purple rounded-full transition-colors group"
            title="Síguenos en Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-white transition-colors">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>

        {/* Columna 2: Horarios */}
        <div>
          <h5 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-4 uppercase tracking-wider">Horarios</h5>
          <ul className="text-gray-500 text-[11px] md:text-sm space-y-1.5 md:space-y-3">
            <li className="flex justify-between md:justify-start md:gap-4 border-b border-white/5 pb-1 md:pb-2">
              <span>Domingos:</span> 
              <span className="text-gray-300 whitespace-nowrap">05:00 PM</span>
            </li>
            <li className="flex justify-between md:justify-start md:gap-4 border-b border-white/5 pb-1 md:pb-2">
              <span>Martes (Damas/Caballeros):</span> 
              <span className="text-gray-300 whitespace-nowrap">7:00 PM</span>
            </li>
            <li className="flex justify-between md:justify-start md:gap-4 border-b border-white/5 pb-1 md:pb-2">
              <span>Sábados (Jóvenes):</span> 
              <span className="text-gray-300 whitespace-nowrap">7:00 PM</span>
            </li>
            <li className="flex justify-between md:justify-start md:gap-4">
              <span>Viernes (Parejas):</span> 
              <span className="text-gray-300 whitespace-nowrap">7:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Columna 3: Ubicación */}
        <div className="flex flex-col items-center md:items-start">
          <h5 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-4 uppercase tracking-wider">Ubicación</h5>
          <p className="text-gray-500 text-[11px] md:text-sm mb-2 md:mb-4">Villa Hermosa / La Romana</p>
          
          <a 
            href={googleMapsUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-real-purple hover:text-real-gold text-[11px] md:text-sm font-medium transition-all"
          >
            <MapPin size={12} className="md:w-4 md:h-4" /> Ver Mapa
          </a>
        </div>
      </div>

      {/* Franja inferior: Copyright y Botones */}
      <div className="max-w-7xl mx-auto px-5 mt-6 md:mt-16 pt-4 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        
        {/* Copyright y Desarrollador */}
        <p className="text-gray-600 text-[9px] md:text-sm order-2 md:order-1 text-center md:text-left flex flex-col gap-1">
          <span>© 2026 Real Sacerdocio. Todos los derechos reservados.</span>
          <span className="text-gray-500">Desarrollado por Genfi Bencosme.</span>
        </p>
        
        {/* Contenedor de los Botones */}
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 order-1 md:order-2">
          
          <Link 
            href="/registro" 
            className="inline-flex items-center gap-1 bg-real-purple hover:bg-real-blue text-white px-3 py-1 md:px-5 md:py-2.5 rounded-full border border-real-purple/50 shadow-[0_0_15px_rgba(76,29,149,0.3)] transition-all text-[10px] md:text-xs font-bold transform hover:scale-105"
          >
            <UserPlus size={14} /> Únete a la Familia
          </Link>

          <PWAInstallButton />
          
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1 md:px-5 md:py-2.5 rounded-full border border-white/10 transition-all text-[10px] md:text-xs font-medium"
          >
            Panel Líderes
          </Link>
        </div>
      </div>
    </footer>
  );
}