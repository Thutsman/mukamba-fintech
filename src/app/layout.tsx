import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SuccessPopupProvider } from "@/components/providers/SuccessPopupProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mukamba Gateway | Your Path to Home Ownership",
  description: "Mukamba Gateway is a property purchasing platform designed to serve Zimbabweans locally and in the diaspora. We make it easier to buy and manage the process of owning your dream home with rent-to-buy options, competitive offers, and seamless property transactions.",
  keywords: [
    "property purchase Zimbabwe",
    "rent to buy Zimbabwe",
    "Mukamba Gateway",
    "Zimbabwe real estate",
    "diaspora property purchase",
    "home ownership Zimbabwe",
    "property platform Zimbabwe",
    "buy property Zimbabwe",
    "installment property purchase",
    "Zimbabwean property market"
  ],
  authors: [{ name: "Mukamba FinTech" }],
  creator: "Mukamba FinTech",
  publisher: "Mukamba FinTech",
  metadataBase: new URL('https://www.mukambagateway.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Mukamba Gateway | Your Path to Home Ownership",
    description: "Mukamba Gateway is a property purchasing platform designed to serve Zimbabweans locally and in the diaspora. Find your dream home with rent-to-buy options and seamless transactions.",
    url: 'https://www.mukambagateway.com',
    siteName: 'Mukamba Gateway',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Mukamba Gateway - Your Path to Home Ownership',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mukamba Gateway | Your Path to Home Ownership",
    description: "Property purchasing platform for Zimbabweans locally and in the diaspora. Rent-to-buy options and seamless property transactions.",
    images: ['/logo.svg'],
    creator: '@mukambagateway',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
        <link rel="shortcut icon" href="/favicon.svg?v=2" />
        <link rel="icon" href="/favicon.svg?v=2" sizes="32x32" />
        <link rel="icon" href="/favicon.svg?v=2" sizes="16x16" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Mukamba Gateway',
              alternateName: 'Mukamba FinTech',
              url: 'https://www.mukambagateway.com',
              logo: 'https://www.mukambagateway.com/logo.svg',
              description: 'Property purchasing platform for Zimbabweans locally and in the diaspora',
              sameAs: [
                'https://www.facebook.com/mukambagateway',
                'https://twitter.com/mukambagateway',
                'https://www.linkedin.com/company/mukambagateway',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+263-77-000-0000',
                contactType: 'customer service',
                email: 'support@mukamba.com',
                areaServed: ['ZW', 'ZA', 'GB', 'US'],
                availableLanguage: ['en'],
              },
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'ZW',
                addressLocality: 'Harare',
              },
            }),
          }}
        />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Force app-controlled light theme regardless of device or previous storage
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  try { localStorage.setItem('theme', 'light'); } catch (_) {}
                  // Override any system preference
                  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-white text-slate-900`}>
        <SuccessPopupProvider>
          {children}
        </SuccessPopupProvider>
      </body>
    </html>
  );
}
