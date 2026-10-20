"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true); // Iniciamos en true para revisar sesión
  const [error, setError] = useState("");
  const router = useRouter();

  // 🔥 AQUÍ ESTÁ LA MAGIA: Revisar si ya hay sesión activa
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Si ya hay sesión, pasamos directo al dashboard sin pedir contraseña
        router.replace("/admin/dashboard");
      } else {
        // Si no hay sesión, mostramos el formulario
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      setLoading(false);
    } else {
      router.refresh(); 
      router.push("/admin/dashboard"); 
    }
  };

  // Mientras revisa la sesión, mostramos una pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-real-black">
        <Loader2 className="animate-spin text-real-purple" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-real-black relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-real-purple/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-real-blue/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <Image src="/logo_Rs.png" alt="Logo" width={100} height={40} className="mx-auto mb-6 object-contain" />
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Panel de Líderes</h1>
          <p className="text-gray-400 text-sm">Ingresa para administrar tu comunidad.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com" 
                className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-real-purple transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-real-purple transition-colors"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-real-purple to-real-blue hover:from-real-blue hover:to-real-purple text-white py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(76,29,149,0.4)] flex justify-center items-center gap-2"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}