import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Mukamba Gateway | Your Path to Home Ownership",
  description: "Learn about Mukamba Gateway, a buyer-focused, fintech-powered real estate platform that makes owning a home in Zimbabwe simple, transparent, and secure.",
  keywords: [
    "about Mukamba Gateway",
    "property platform Zimbabwe",
    "real estate fintech",
    "home ownership Zimbabwe",
    "property investment platform",
    "diaspora property purchase"
  ],
  openGraph: {
    title: "About Mukamba Gateway | Your Path to Home Ownership",
    description: "Learn about Mukamba Gateway, a buyer-focused, fintech-powered real estate platform that makes owning a home in Zimbabwe simple, transparent, and secure.",
    url: 'https://www.mukambagateway.com/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Mukamba Gateway | Your Path to Home Ownership",
    description: "Learn about Mukamba Gateway, a buyer-focused, fintech-powered real estate platform that makes owning a home in Zimbabwe simple, transparent, and secure.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
