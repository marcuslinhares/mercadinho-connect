import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ofertas.marcuslinhares.com'),
  title: "Mercadinho Connect",
  description: "As melhores ofertas do bairro no seu bolso!",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  keywords: ['ofertas', 'mercadinho', 'promoções', 'supermercado', 'economia'],
  authors: [{ name: 'Mercadinho Connect' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Mercadinho Connect',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mercadinho Connect',
    description: 'Ofertas e promoções diárias do mercadinho do bairro',
    url: 'https://ofertas.marcuslinhares.com',
  }

  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
