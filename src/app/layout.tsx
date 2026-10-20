import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWARegister from "@/components/PWARegister"; // <-- IMPORTANTE

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
  manifest: "/manifest.json", // <-- Conecta con tu archivo public/manifest.json
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
      <body className={`${cinzel.variable} ${inter.variable} font-sans bg-real-black text-white antialiased selection:bg-real-purple`}>
        <RealtimeRefresher />
        <PWAInstallPrompt />
        <PWARegister /> {/* <-- Registra el Service Worker en el navegador */}
        {children}
      </body>
    </html>
  );
}