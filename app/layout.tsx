import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import { ClientShell } from "@/components/layout/ClientShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKhmer = Noto_Sans_Khmer({
  variable: "--font-khmer",
  subsets: ["khmer"],
});

export const metadata: Metadata = {
  title: "CamboEA - ច្រកចូលទៅកាន់ទីផ្សារឆ្លាតវៃ",
  description: "ព័ត៌មានពិភពលោកដែលអាចផ្តល់ឥទ្ធិពលដល់គូប្រាក់ មាស និងគ្រីបធ័។ នៅចម្ងាយមុខជាមួយព្រឹត្តិការណ៍សកល ការវិភាគអ្នកជំនាញ និងសញ្ញាធ្វើដូច។",
  keywords: ["camboea", "forex", "crypto", "cryptocurrency", "bitcoin", "trading", "market analysis", "financial news", "cambodia", "ខ្មែរ"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" className={notoSansKhmer.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKhmer.variable} font-sans antialiased`}
      >
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
