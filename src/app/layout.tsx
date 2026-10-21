import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWARegister from "@/components/PWARegister";
import PWARecovery from "@/components/PWARecovery";

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
      {/* 👇 ESTA ES LA SECCIÓN QUE FALTABA */}
      <head>
        <link rel="icon" href="/apple-icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      
      <body className={`${cinzel.variable} ${inter.variable} font-sans bg-real-black text-white antialiased selection:bg-real-purple`}>
        <RealtimeRefresher />
        <PWAInstallPrompt />
        <PWARegister /> 
        <PWARecovery /> 
        {children}
      </body>
    </html>
  );
}