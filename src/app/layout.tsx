import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ofertas.marcuslinhares.com'),
  title: "Mercadinho Connect",
  description: "As melhores ofertas do bairro no seu bolso!",
  manifest: "/manifest.json", // Futuro PWA
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Trava zoom no celular pra parecer app
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
