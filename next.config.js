/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Active les images optimisées de Next.js
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },

  // Active les expérimentations utiles (optionnel, tu peux retirer si pas nécessaire)
  experimental: {
    appDir: true, // si tu utilises le dossier `app/`
  },
};

module.exports = nextConfig;
