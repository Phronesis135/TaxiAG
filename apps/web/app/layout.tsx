import type { Metadata, Viewport } from 'next';
import './globals.css';
import SwRegister from './sw-register';

export const metadata: Metadata = {
  title: 'TaxiAG — Compare. Choose. Book.',
  description: 'UK taxi comparison and booking (local MVP)',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'TaxiAG',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#1c1611',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
