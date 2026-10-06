import type { Metadata } from "next";
import { Bebas_Neue, Cormorant_Garamond, DM_Sans, Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "PRESSKIT — Your music deserves more than a link-in-bio",
    template: "%s · PRESSKIT",
  },
  description: "Build a professional artist website and electronic press kit in minutes.",
  openGraph: {
    title: "PRESSKIT",
    description: "Build a professional artist website and electronic press kit in minutes.",
    siteName: "PRESSKIT",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${dm.variable} ${inter.variable} ${bebas.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
