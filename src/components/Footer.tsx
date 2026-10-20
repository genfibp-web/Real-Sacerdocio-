import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Footer() {
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=18.44795697205258,-69.01268224147996";
  const instagramUrl = "https://www.instagram.com/realsacerdocio_1/?hl=es";

  return (
    <footer className="bg-black py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        
        {/* Columna 1: Logo y Redes */}
        <div>
          <h4 className="font-serif text-3xl font-bold text-white mb-4">REAL SACERDOCIO</h4>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Un lugar de encuentro con Dios, donde cada persona puede encontrar propósito, comunidad y restauración.
          </p>
          
          <div className="flex justify-center md:justify-start gap-4">
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 bg-white/5 hover:bg-real-purple rounded-full transition-colors group"
              title="Síguenos en Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-white transition-colors">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>

        {/* Columna 2: Horarios */}
        <div>
          <h5 className="text-white font-semibold mb-4">Horarios de Culto</h5>
          <ul className="text-gray-500 text-sm space-y-3">
            <li className="flex flex-col md:flex-row md:justify-between border-b border-white/5 pb-2">
              <span>Domingos (Culto Evangelístico):</span> 
              <span className="text-gray-300">05:00 PM</span>
            </li>
            <li className="flex flex-col md:flex-row md:justify-between border-b border-white/5 pb-2">
              <span>Martes (Damas y Caballeros):</span> 
              <span className="text-gray-300">7:00 PM</span>
            </li>
            <li className="flex flex-col md:flex-row md:justify-between">
              <span>Sábados (Jóvenes):</span> 
              <span className="text-gray-300">7:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Columna 3: Ubicación */}
        <div>
          <h5 className="text-white font-semibold mb-4">Ubicación</h5>
          <p className="text-gray-500 text-sm mb-4">Villa Hermosa / La Romana, República Dominicana.</p>
          
          <a 
            href={googleMapsUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-real-purple hover:text-real-gold text-sm font-medium transition-all"
          >
            <MapPin size={16} /> Ver en Google Maps
          </a>
        </div>
      </div>

      {/* Franja inferior: Copyright y Botón Panel */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-gray-600 text-sm">© 2026 Real Sacerdocio. Todos los derechos reservados.</p>
        
        {/* NUEVO BOTÓN AL PANEL */}
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-5 py-2.5 rounded-full border border-white/10 transition-all text-xs font-medium"
        >
          Panel Líderes
        </Link>
      </div>
    </footer>
  );
}