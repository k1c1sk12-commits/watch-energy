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
  title: "GPT Watch Collector Playground — Six Free Watch Games · 玩錶遊樂場",
  description:
    "Six free watch games built on one real collection: Bone Eater (the AD allocation game), a Watch Knowledge Quiz, Watch Smash, the Destiny Watch match, a Watch Bracket and a Tier List. By a real collector — no ads, no sign-up. ｜六個建基於真實收藏的玩錶遊戲：食骨模擬器、腕錶知識測驗、腕錶亂打、命定之錶、腕錶對決、tier list。",
  keywords: [
    "watch games",
    "GPT watch collector",
    "watch collector playground",
    "watch allocation game",
    "AD game watches",
    "luxury watch quiz",
    "keyboard smash watch game",
    "destiny watch",
    "watch energy",
    "haute horlogerie",
    "watch collector",
    "腕錶遊戲",
    "食骨",
    "命定之錶",
    "玩錶",
  ],
  authors: [{ name: "@gptwatchcollector" }],
  openGraph: {
    title: "GPT Watch Collector Playground",
    description:
      "Six free watch games, one real collection — from the AD-allocation satire Bone Eater to the Destiny Watch match. No ads, no sign-up.",
    url: SITE_URL,
    siteName: "Watch Energy",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "GPT Watch Collector Playground" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GPT Watch Collector Playground",
    description:
      "Six free watch games, one real collection — from the AD-allocation satire Bone Eater to the Destiny Watch match.",
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
