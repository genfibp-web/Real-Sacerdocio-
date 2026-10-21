import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 🛡️ Bloqueamos el admin, la API y el feed para que no salgan en Google
      disallow: ['/admin/', '/api/', '/feed/'], 
    },
    // Aquí le decimos a Google dónde está nuestro mapa del sitio
    sitemap: 'https://real-sacerdocio.vercel.app/sitemap.xml',
  }
}