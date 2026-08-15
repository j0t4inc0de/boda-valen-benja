import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valentina & Benjamín",
  description: "¡Nos casamos! Acompáñanos a celebrar nuestra unión el 12 de septiembre de 2026. Confirma tu asistencia aquí.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${montserrat.variable} font-sans bg-[#fdfbf7] text-[#2b2b2b] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
