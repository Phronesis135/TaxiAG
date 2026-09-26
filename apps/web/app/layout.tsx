import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaxiAG — Compare. Choose. Book.',
  description: 'UK taxi comparison and booking (local MVP)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
