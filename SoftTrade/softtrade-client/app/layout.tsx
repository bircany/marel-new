import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SoftTrade',
    template: '%s | SoftTrade',
  },
  description: 'Modern e-ticaret platformu',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SoftTrade',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        <Navbar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

