import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pariwar Wastraley | परिवार वस्त्रालय",
  description:
    "Pariwar Wastraley — परिवार वस्त्रालय, Roh, Nawada, Bihar. Traditional and modern clothing for the whole family.",
  keywords: ["saree", "kurti", "kurta", "clothing store", "Nawada", "Bihar", "ethnic wear"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi" className="scroll-smooth">
      <body
        className={`${cormorant.variable} ${sourceSans.variable} ${notoDevanagari.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
