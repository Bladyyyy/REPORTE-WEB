import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Hospital de la Mujer | Censo Medico",
  description: "Plataforma premium de reportes, censos e indicadores hospitalarios del turno de la manana.",
  applicationName: "Hospital de la Mujer Reportes",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} bg-radial-premium antialiased`}>{children}</body>
    </html>
  );
}
