import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'SesomNod Engine',
  description: 'Elite sports betting analytics — precision over chaos.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SesomNod Engine',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" className="dark">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
          <main className="flex-1 pb-20 overflow-y-auto">
            {children}
          </main>
          <BottomNav />
        </div>
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
