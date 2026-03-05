import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TradingViewTicker } from "@/components/features/markets/TradingViewWidgets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forex & Crypto News - Your Gateway to Market Intelligence",
  description: "Stay ahead with real-time news, expert analysis, and comprehensive coverage of forex and cryptocurrency markets. Get daily updates, market insights, and breaking news.",
  keywords: ["forex", "crypto", "cryptocurrency", "bitcoin", "trading", "market analysis", "financial news"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <TradingViewTicker />
        </section>
        {children}
        <Footer />
      </body>
    </html>
  );
}
