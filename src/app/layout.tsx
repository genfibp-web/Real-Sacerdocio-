import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import RealtimeRefresher from "@/components/RealtimeRefresher"; // <-- 1. IMPORTAMOS EL COMPONENTE

// ESTAS DOS LÍNEAS SON LA MAGIA PARA EL ECOSISTEMA COMPLETO
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Real Sacerdocio",
  description: "Iglesia Real Sacerdocio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${cinzel.variable} ${inter.variable} font-sans bg-real-black text-white antialiased selection:bg-real-purple`}>
        
        {/* 2. COLOCAMOS EL COMPONENTE AQUÍ */}
        <RealtimeRefresher /> 
        
        {children}
      </body>
    </html>
  );
}