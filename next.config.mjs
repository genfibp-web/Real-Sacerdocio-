/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Aquí le damos permiso a tu proyecto de Supabase
        protocol: 'https',
        hostname: 'ddsnzeirvlvsmlabpzcd.supabase.co', 
      },
    ],
  },
};

export default nextConfig;