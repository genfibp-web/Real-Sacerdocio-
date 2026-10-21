import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWARegister from "@/components/PWARegister";
import PWARecovery from "@/components/PWARecovery";
import VisitorTracker from "@/components/VisitorTracker"; // <-- 1. IMPORTAMOS EL RADAR
import { LayoutDashboard, CalendarDays, Image as ImageIcon, LogOut, MessageSquare, FileText, Users, Menu, X, Globe, Activity } from "lucide-react";
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
  description: "Un lugar de encuentro con Dios.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Real Sacerdocio",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
      </head>
      
      <body className={`${cinzel.variable} ${inter.variable} font-sans bg-real-black text-white antialiased selection:bg-real-purple`}>
        <VisitorTracker /> {/* <-- 2. AQUÍ ESTÁ LA MAGIA DEL RADAR */}
        <RealtimeRefresher />
        <PWAInstallPrompt />
        <PWARegister /> 
        <PWARecovery /> 
        {children}
      </body>
    </html>
  );
}