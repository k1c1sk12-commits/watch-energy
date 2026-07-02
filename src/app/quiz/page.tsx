import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/features";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import QuizClient from "./QuizClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://watch-energy.vercel.app";
const IG_URL = "https://www.instagram.com/gptwatchcollector/";

export const metadata: Metadata = {
  title: "Watch Knowledge Quiz — Test Your Horology Knowledge | Watch Energy",
  description:
    "Ten multiple-choice questions per round, drawn from an original bank of 100+ covering watch history, complications, movements, materials, brands and finishing. Free, no sign-up — how well do you really know watches? ｜腕錶知識測驗：十題一局，逾百條原創題庫。",
  keywords: [
    "watch quiz",
    "horology quiz",
    "watch knowledge test",
    "watch trivia",
    "watchmaking quiz",
    "horology questions",
    "test your watch knowledge",
    "watch complications quiz",
    "腕錶測驗",
    "鐘錶知識",
    "腕錶知識測驗",
  ],
  alternates: { canonical: "/quiz" },
  openGraph: {
    title: "Watch Knowledge Quiz — how well do you really know watches?",
    description:
      "Ten questions per round from a 100+ original bank: history, complications, movements, materials, brands, finishing. Free, no sign-up.",
    url: `${SITE_URL}/quiz`,
    siteName: "Watch Energy",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Watch Energy — Watch Knowledge Quiz" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch Knowledge Quiz — Watch Energy",
    description: "Ten questions, 100+ bank. How well do you really know watches?",
    images: ["/api/og"],
  },
};

// Deterministic sample questions for the crawlable section + JSON-LD (fixed
// ids — never random at render time, so the static build stays stable).
const SAMPLE_IDS = ["q001", "q014", "h06"] as const;
const SAMPLES = SAMPLE_IDS.map((id) => QUIZ_QUESTIONS.find((q) => q.id === id)!).filter(Boolean);

function quizJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "Watch Knowledge Quiz",
    url: `${SITE_URL}/quiz`,
    description:
      "A free horology quiz: ten multiple-choice questions per round, drawn from an original bank of 100+ covering watch history, complications, movements, case materials, brands and hand-finishing.",
    educationalLevel: "Beginner",
    inLanguage: "en",
    provider: {
      "@type": "Person",
      name: "gptwatchcollector",
      url: IG_URL,
    },
    hasPart: SAMPLES.map((q) => ({
      "@type": "Question",
      name: q.question,
      eduQuestionType: "Multiple choice",
      suggestedAnswer: q.options
        .filter((_, i) => i !== q.answer)
        .map((text) => ({ "@type": "Answer", text })),
      acceptedAnswer: { "@type": "Answer", text: q.options[q.answer] },
    })),
  };
}

export default function QuizPage() {
  if (!FEATURES.quiz) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd()) }}
      />

      {/* The interactive game (client-rendered, full viewport). */}
      <QuizClient />

      {/* Crawlable companion content for search engines. Visually hidden
          (sr-only, same pattern as the home page) because it is static
          English+Chinese text that cannot follow the client language toggle —
          showing both languages below the game read as a bug to visitors. */}
      <section className="sr-only">
        <h1>Watch Knowledge Quiz — test your horology knowledge</h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-mid">
          Ten multiple-choice questions per round, drawn from an original bank of more than 100.
          Every round is a fresh mix across seven areas of watchmaking: history, complications,
          movements, case materials, brands, hand-finishing and terminology. Free, no sign-up,
          about two minutes — and at the end you get your score, a collector title, and a review
          of every answer you missed.
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-mid">
          The questions are original and beginner-friendly, with a couple of harder ones in each
          round. If you are warming up for a formal horology course or certification, treat this
          as a friendly first checkpoint; if you are simply into watches, it is a quick way to
          find out how much has rubbed off.
        </p>

        <h2 className="mt-8 font-display text-[1.15rem] font-light text-hi">Sample questions</h2>
        <ul className="mt-3 flex flex-col gap-3 text-[0.9rem] leading-relaxed text-mid">
          {SAMPLES.map((q) => (
            <li key={q.id} className="rounded-[var(--radius-md)] border border-border bg-raised px-4 py-3">
              <p className="text-hi">{q.question}</p>
              <p className="mt-1.5 text-[0.82rem] text-low">
                Answer: <span className="text-mid">{q.options[q.answer]}</span>
                {q.explanation ? ` — ${q.explanation}` : null}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[0.95rem] leading-relaxed text-mid">
          Built by the collector behind{" "}
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-bright underline underline-offset-4"
          >
            @gptwatchcollector
          </a>
          , where the real collection — haute horlogerie, independents and complications — lives.
          The quiz is one of four free games on Watch Energy, alongside the Destiny Watch match,
          the Watch Tier List and the Watch Bracket.
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-mid">
          腕錶知識測驗：十題一局，逾百條原創題庫，涵蓋製錶歷史、複雜功能、機芯、物料、品牌與打磨工藝。
          免費、無需登記，完成後可重溫每一條答錯的題目。由 @gptwatchcollector 背後的真實藏家打造。
        </p>
      </section>
    </>
  );
}
