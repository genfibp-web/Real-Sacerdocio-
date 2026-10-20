import Image from "next/image";

export default function PastorsSection() {
  return (
    <section className="py-24 bg-real-black relative border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <p className="text-real-purple font-semibold tracking-wider text-sm mb-2 uppercase">Liderazgo</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Nuestros Pastores</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-real-purple to-real-blue mx-auto"></div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-32">
          
          {/* Pastor Horton */}
          <div className="group text-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-6 border-2 border-white/20 shadow-[0_0_30px_rgba(76,29,149,0.3)]">
              <Image 
                src="/pastor.webp" 
                alt="Pastor Horton Bautista" 
                fill 
                className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mb-1">Horton Bautista</h3>
            <p className="text-real-gold font-medium text-sm tracking-widest uppercase">Pastor</p>
          </div>

          {/* Pastora Karina */}
          <div className="group text-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-6 border-2 border-white/20 shadow-[0_0_30px_rgba(76,29,149,0.3)]">
              <Image 
                src="/pastora.webp" 
                alt="Pastora Karina Rodriguez" 
                fill 
                className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mb-1">Karina Rodriguez</h3>
            <p className="text-real-gold font-medium text-sm tracking-widest uppercase">Pastora</p>
          </div>

        </div>
      </div>
    </section>
  );
}