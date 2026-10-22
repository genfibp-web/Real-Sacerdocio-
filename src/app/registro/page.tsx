"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { UserPlus, Loader2, CheckCircle, AlertTriangle, ArrowLeft, Heart, Users } from "lucide-react";

export default function RegistroPublico() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    fecha_nacimiento: "",
    comunidad_slug: "jovenes",
  });

  const formatPhoneInput = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) cleaned = cleaned.substring(1);
    cleaned = cleaned.substring(0, 10);
    
    if (cleaned.length > 6) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    } else if (cleaned.length > 3) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}`;
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      nombre: formData.nombre,
      telefono: formData.telefono || null,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      comunidad_slug: formData.comunidad_slug,
    };

    const { error } = await supabase.from('miembros').insert([payload]);

    if (error) {
      setError("Hubo un problema al registrarte. Por favor, intenta de nuevo.");
      console.error(error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  // FUNCIÓN PARA LIMPIAR Y REGISTRAR A OTRO
  const handleRegisterAnother = () => {
    setSuccess(false);
    setFormData({
      nombre: "",
      telefono: "",
      fecha_nacimiento: "",
      comunidad_slug: "jovenes",
    });
  };

  // PANTALLA DE ÉXITO
  if (success) {
    return (
      <main className="min-h-screen bg-real-black flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/fondo_grande.webp')] bg-cover bg-center opacity-10 blur-sm"></div>
        
        <div className="relative z-10 max-w-md w-full bg-real-dark border border-white/10 rounded-3xl p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-4">¡Registro Exitoso!</h1>
          <p className="text-gray-400 mb-8">
            <strong className="text-white">{formData.nombre}</strong> ha sido registrado en la comunidad de {formData.comunidad_slug}. 
            ¡Bienvenido a la familia!
          </p>

          <div className="space-y-3">
            <button 
              onClick={handleRegisterAnother}
              className="w-full bg-real-purple hover:bg-real-blue text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Users size={20} /> Registrar a otra persona
            </button>
            
            <Link 
              href="/"
              className="w-full bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <ArrowLeft size={18} /> Volver a la página principal
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // PANTALLA DEL FORMULARIO
  return (
    <main className="min-h-screen bg-real-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/fondo_grande.webp')] bg-cover bg-center opacity-10 blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-real-black via-real-black/80 to-transparent"></div>

      <div className="relative z-10 max-w-md w-full">
        
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <div className="bg-real-dark border border-white/10 rounded-3xl p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Image src="/logo_Rs.png" alt="Logo" fill className="object-contain" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-2">Únete a la Familia</h1>
            <p className="text-gray-400 text-sm">Déjanos tus datos para conocerte y acompañarte en tu caminar con Dios.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Nombre Completo</label>
              <div className="relative">
                <UserPlus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  required 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:border-real-purple outline-none" 
                  placeholder="Ej: Juan Pérez" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Teléfono (Opcional)</label>
              <input 
                type="tel" 
                value={formData.telefono} 
                onChange={(e) => setFormData({...formData, telefono: formatPhoneInput(e.target.value)})} 
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple outline-none" 
                placeholder="Ej: 809-555-1234" 
                maxLength={12}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Fecha de Nacimiento (Opcional)</label>
              <input 
                type="date" 
                value={formData.fecha_nacimiento} 
                onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} 
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple outline-none [color-scheme:dark]" 
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">¿A qué comunidad perteneces?</label>
              <select 
                value={formData.comunidad_slug} 
                onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} 
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple outline-none appearance-none"
              >
                <option value="jovenes">Generación Kehunah (Jóvenes)</option>
                <option value="caballeros">Hombres de la Realeza</option>
                <option value="damas">Mujeres de Buena Voluntad</option>
                <option value="ninos">Niños y Adolescentes</option>
                <option value="parejas">Ministerio de Parejas</option>
                <option value="general">Solo quiero estar en contacto general</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-real-purple to-real-blue hover:from-real-blue hover:to-real-purple text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Heart size={20} /> Registrarme</>}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}