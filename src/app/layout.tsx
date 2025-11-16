// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from '@/components/app-layout';
import { AuthProvider } from '@/hooks/use-auth';
import Script from 'next/script';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://onbuch.luvvix.it.com';
const ogImage = `${siteUrl}/IMG-20251030-WA0014.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OnBuch : Apprendre avec Intelligence",
    template: '%s | OnBuch',
  },
  description: "OnBuch transforme votre apprentissage : cours, IA, planning et communauté pour réussir à votre rythme, où que vous soyez.",
  keywords: ['OnBuch', 'éducation', 'soutien scolaire', 'IA', 'collège', 'lycée', 'réussite', 'apprentissage'],
  manifest: '/manifest.json',

  // Open Graph pour Facebook, WhatsApp, etc.
  openGraph: {
    title: 'OnBuch : Apprendre avec Intelligence',
    description: 'La plateforme tout-en-un pour un apprentissage efficace et inclusif pour tous les élèves.',
    url: siteUrl,
    siteName: 'OnBuch',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'OnBuch - Apprendre avec Intelligence',
      },
    ],
  },

  // Twitter (utilisé aussi par certaines apps)
  twitter: {
    card: 'summary_large_image',
    title: 'OnBuch : Apprendre avec Intelligence',
    description: 'Une plateforme complète pour un apprentissage efficace et inclusif pour tous les élèves.',
    images: [ogImage],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff9100',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Meta tags essentiels pour WhatsApp et réseaux sociaux */}
        <meta property="og:title" content="OnBuch : Apprendre avec Intelligence" />
        <meta property="og:description" content="OnBuch transforme votre apprentissage : cours, IA, planning et communauté pour réussir à votre rythme, où que vous soyez." />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="OnBuch" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content="OnBuch - Apprendre avec Intelligence" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <Toaster />
        <Script
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}