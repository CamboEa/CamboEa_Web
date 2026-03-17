import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cambo-ea-web.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CamboEA - ច្រកចូលទៅកាន់ទីផ្សារឆ្លាតវៃ",
    template: "%s | CamboEA",
  },
  description:
    "CamboEA ផ្តល់ព័ត៌មានទីផ្សារហិរញ្ញវត្ថុ ជាមួយនឹងព័ត៌មានពិភពលោក ព្រឹត្តិការណ៍សេដ្ឋកិច្ច ការវិភាគ និងសញ្ញាជួញដូរ សម្រាប់អ្នកវិនិយោគនៅកម្ពុជា និងជុំវិញពិភពលោក។",
  keywords: [
    "camboea",
    "cambodia trading",
    "forex",
    "crypto",
    "cryptocurrency",
    "bitcoin",
    "trading",
    "market analysis",
    "financial news",
    "economic calendar",
    "ea trading bot",
    "cambodia",
    "ខ្មែរ",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "CamboEA - ច្រកចូលទៅកាន់ទីផ្សារឆ្លាតវៃ",
    description:
      "ទទួលបានព័ត៌មានទីផ្សារ ព្រឹត្តិការណ៍សេដ្ឋកិច្ច និងការវិភាគជ្រាលជ្រៅ សម្រាប់អ្នកជួញដូរ និងវិនិយោគកម្ពុជា។",
    url: siteUrl,
    siteName: "CamboEA",
    locale: "km_KH",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/seo/og-image.png`,
        width: 1200,
        height: 630,
        alt: "CamboEA - Smart Market Insights for Cambodia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CamboEA - ច្រកចូលទៅកាន់ទីផ្សារឆ្លាតវៃ",
    description:
      "ព័ត៌មានទីផ្សារហិរញ្ញវត្ថុ ព្រឹត្តិការណ៍សេដ្ឋកិច្ច និងការវិភាគជ្រាលជ្រៅ សម្រាប់អ្នកជួញដូរកម្ពុជា។",
    images: [`${siteUrl}/images/seo/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" className={notoSansKhmer.variable}>
      <head>
        <Script
          id="ld-json-organization"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "CamboEA",
            url: siteUrl,
            logo: `${siteUrl}/images/logos/logo.png`,
            sameAs: [
              "https://www.facebook.com",
              "https://www.youtube.com",
              "https://www.telegram.com",
            ],
            description:
              "CamboEA គឺជាក្លីនទទួលព័ត៌មានទីផ្សារហិរញ្ញវត្ថុ និងការវិភាគសម្រាប់អ្នកជួញដូរកម្ពុជា។",
            address: {
              "@type": "PostalAddress",
              addressCountry: "KH",
            },
          })}
        </Script>
        <Script
          id="ld-json-website"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "CamboEA",
            url: siteUrl,
            inLanguage: "km-KH",
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKhmer.variable} font-sans antialiased`}
      >
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
