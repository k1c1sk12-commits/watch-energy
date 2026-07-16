import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { LangProvider } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import "./globals.css";

// GA4 Measurement ID. Defaults to the live property in production; env var
// overrides if set. Stays off in local dev so it doesn't pollute the data.
const GA_ID =
  process.env.NEXT_PUBLIC_GA_ID ??
  (process.env.NODE_ENV === "production" ? "G-XR7J0QTT61" : undefined);

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gptwatchcollector.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Watch Energy — Meet your destiny watch · 你的命定之錶",
  description:
    "Every collector has one destined watch. Your birth and your nature decide a single haute-horlogerie piece written for you — case, dial, strap, and the energy it carries. Built by a collector. ｜每位藏家都有一枚命定之錶：以你的出生與本質，配對一枚為你而寫的高級腕錶。",
  keywords: [
    "destiny watch",
    "watch energy",
    "luxury watch quiz",
    "watch personality",
    "haute horlogerie",
    "watch recommendation",
    "Audemars Piguet",
    "watch collector",
    "命定之錶",
    "腕錶配對",
    "高級製錶",
    "玩錶",
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
  // Google Search Console ownership verification (renders as
  // <meta name="google-site-verification" ...> in the head).
  // Two tokens: the original watch-energy.vercel.app property and the
  // gptwatchcollector.com property — keep both so neither loses verification.
  verification: {
    google: [
      "2AxlSUUWGzUiHjvSbSH0_u5e53LtgcfENTOD89NOFoA",
      "vi1v1DgcyeqMdTbrEjDnzbDBURfaH4NIZgUMkKQ3Vcw",
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f2ede3",
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
      <body className="min-h-full">
        <LangProvider>
          <LangToggle />
          {children}
        </LangProvider>
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
