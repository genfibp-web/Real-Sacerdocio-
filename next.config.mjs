import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Desactivado en local
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ddsnzeirvlvmlabpzcd.supabase.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
};

export default withPWA(nextConfig);import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Desactivado en local
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ddsnzeirvlvmlabpzcd.supabase.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
};

export default withPWA(nextConfig);