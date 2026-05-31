import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://watch-energy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Watch Energy — Meet your destiny watch",
  description:
    "Every collector has one destined watch. Your birth and your nature decide a single haute-horlogerie piece written for you — case, dial, strap, and the energy it carries. Built by a collector.",
  keywords: [
    "destiny watch",
    "watch energy",
    "luxury watch quiz",
    "watch personality",
    "haute horlogerie",
    "watch recommendation",
    "Audemars Piguet",
    "watch collector",
  ],
  authors: [{ name: "@gptwatchcollector" }],
  openGraph: {
    title: "Watch Energy — Meet your destiny watch",
    description:
      "Every collector has one destined watch. Your birth and your nature decide it. Not a horoscope — a horological match.",
    url: SITE_URL,
    siteName: "Watch Energy",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Watch Energy" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch Energy — Meet your destiny watch",
    description: "Every collector has one destined watch. Meet yours.",
    images: ["/api/og"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
