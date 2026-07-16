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
  title: "GPT Watch Collector — A Real Collection, Played Five Ways",
  description:
    "Every watch here has a story. Ten real haute-horlogerie pieces — AP, Lange, Daniel Roth, Breguet, independents — plus five free watch games built on them: destiny match, knowledge quiz, tier list, bracket and smash. ｜一位真實藏家的十枚收藏，加五個腕錶遊戲。",
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
    title: "GPT Watch Collector — a real collection, played five ways",
    description:
      "Ten real haute-horlogerie pieces and five free watch games built on them. Every watch here has a story.",
    url: SITE_URL,
    siteName: "GPT Watch Collector",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "GPT Watch Collector" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GPT Watch Collector — a real collection, played five ways",
    description: "Ten real pieces, five free watch games. Every watch here has a story.",
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
