import type { Metadata, Viewport } from 'next';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { SyncManagerClient } from '@/components/offline/SyncManagerClient';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amauta - Sistema Educativo',
  description: 'Sistema educativo para la gestión del aprendizaje',
  keywords: ['educación', 'aprendizaje', 'gestión educativa', 'LMS'],
  authors: [{ name: 'Amauta Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Amauta',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
          <OfflineBanner />
          <SyncManagerClient />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
