/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pas de configuration d'images pour le MVP (on utilise <img> standard)
  reactStrictMode: true,
  // Configuration pour Vercel
  output: 'standalone',
  // Optimisations PWA
  headers: async () => [
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/manifest+json',
        },
      ],
    },
  ],
}

module.exports = nextConfig
