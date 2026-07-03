import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/features";
import { HUNT_LIST } from "@/lib/wishlist";

const IG_URL = "https://www.instagram.com/gptwatchcollector/";

export const metadata: Metadata = {
  title: "The Hunt — Watches I'm Looking to Buy | Watch Energy",
  description:
    "A real collector's want-to-buy list: the haute-horlogerie and independent pieces I'm hunting for my own collection. If you have one you'd part with, DM @gptwatchcollector on Instagram. Nothing here is for sale.",
  alternates: { canonical: "/hunt" },
  openGraph: {
    title: "The Hunt — watches a real collector is looking to buy",
    description:
      "The pieces I'm hunting for my own collection. Have one you'd part with? DM me on Instagram.",
    type: "website",
  },
};

export default function HuntPage() {
  if (!FEATURES.hunt) notFound();

  return (
    <main className="mx-auto min-h-[100svh] max-w-[560px] px-5 pb-20 pt-14">
      <p className="eyebrow">Watch to buy</p>
      <h1 className="mt-4 font-display text-[1.9rem] font-light leading-[1.14] text-hi">
        The Hunt
      </h1>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-mid">
        Every collector keeps a quiet list. This is mine — the pieces I&apos;m
        looking to buy for my own collection, to keep and to wear. I&apos;m not
        a dealer and nothing on this site is for sale; I&apos;d simply rather
        hear from a fellow collector than fight for these at auction.
      </p>

      <ul className="mt-10 flex flex-col gap-4">
        {HUNT_LIST.map((w) => (
          <li
            key={w.id}
            className="rounded-[var(--radius-lg)] border border-border bg-raised px-5 py-4"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-low">{w.brand}</p>
            <p className="mt-1 font-display text-[1.18rem] font-light leading-tight text-hi">
              {w.model}
              {w.reference ? (
                <span className="ml-2 text-[0.8rem] text-low">Ref. {w.reference}</span>
              ) : null}
            </p>
            <p className="mt-1.5 text-[0.82rem] leading-snug text-mid">{w.detail}</p>
            <p className="mt-2.5 text-[0.85rem] italic leading-relaxed text-gold-bright/90">
              “{w.why}”
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.06] px-5 py-5 text-center">
        <p className="text-[0.95rem] leading-relaxed text-hi">
          Have one of these you&apos;d part with?
        </p>
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.1] px-6 py-3 text-sm font-medium text-gold-bright transition-all hover:bg-gold/[0.18] active:scale-[0.98]"
        >
          DM @gptwatchcollector
        </a>
        <p className="mt-3 text-[0.78rem] leading-relaxed text-low">
          Collector to collector. Honest examples over full sets, stories over
          speculation — these are keepers, not flips.
        </p>
      </div>

      <p className="mt-10 text-center text-[0.82rem] text-mid">
        <Link href="/" className="text-gold-bright underline underline-offset-4">
          ← Back to the games
        </Link>
      </p>
    </main>
  );
}
