import type { Metadata } from "next";
import { Libre_Caslon_Text, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";

// Caslon: herança da tipografia jurídica/impressa — distintivo e autoral.
// Hanken Grotesk: sans humanista e clara.
const serif = Libre_Caslon_Text({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif-display",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title: {
    default:
      "Sento-Sé Advogados | Advocacia em Salvador — Trabalhista, Cível e Consumidor",
    template: "%s | Sento-Sé Advogados",
  },
  description: site.description,
  applicationName: site.shortName,
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  publisher: site.legalName,
  keywords: [
    "advogado em Salvador",
    "escritório de advocacia Salvador",
    "advogado trabalhista Salvador",
    "direito do trabalho",
    "direito civil",
    "direito do consumidor",
    "direito médico",
    "Sento-Sé Advogados",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.baseUrl,
    siteName: site.shortName,
    title: site.legalName,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.legalName,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={cn(serif.variable, sans.variable, "h-full antialiased")}
    >
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
