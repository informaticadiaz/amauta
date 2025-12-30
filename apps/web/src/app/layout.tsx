import type { Metadata, Viewport } from 'next';
import { SessionProvider } from '@/components/auth/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amauta - Sistema Educativo',
  description: 'Sistema educativo para la gestión del aprendizaje',
  keywords: ['educación', 'aprendizaje', 'gestión educativa', 'LMS'],
  authors: [{ name: 'Amauta Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
