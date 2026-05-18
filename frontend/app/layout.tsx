import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import Navigation from '@/components/Navigation';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NBA Draft Model 2026',
  description: 'Data-driven NBA draft prospect analysis powered by machine learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans flex flex-col min-h-screen`}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
