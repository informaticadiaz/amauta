const withPWA = require('@ducanh2912/next-pwa').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para Docker
  output: 'standalone',

  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Transpilación de packages del monorepo
  transpilePackages: ['@amauta/shared', '@amauta/types'],
};

const runtimeCaching = [
  {
    urlPattern: /^https?:\/\/.*\/_next\/static\/.*$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'next-static',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
    },
  },
  {
    urlPattern: /^https?:\/\/.*\/api\/auth\/.*$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-auth',
      networkTimeoutSeconds: 10,
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60,
      },
    },
  },
  {
    urlPattern: /^https?:\/\/.*\/api\/(cursos|lecciones|image)\/.*$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'api-public',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60,
      },
    },
  },
  {
    urlPattern: ({ request }) => request.destination === 'image',
    handler: 'CacheFirst',
    options: {
      cacheName: 'image-cache',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
    },
  },
];

const withPWAConfig = withPWA({
  dest: 'public',
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
  workboxOptions: {
    disableDevLogs: true,
  },
});

module.exports = withPWAConfig(nextConfig);
