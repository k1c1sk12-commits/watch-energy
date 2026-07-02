"use client";

import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { QUIZ_UI } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { drawQuiz, scoreToTitle, type DrawnQuestion } from "@/lib/quiz";
import { shareQuizScore, type ShareOutcome } from "@/lib/shareCard";
import IgPreview from "./IgPreview";

const IG_URL = "https://www.instagram.com/gptwatchcollector/";

type Phase = "intro" | "playing" | "done";

export default function Quiz({ onBack }: { onBack: () => void }) {
  const { lang } = useLang();
  const t = QUIZ_UI[lang];

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<DrawnQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [shareState, setShareState] = useState<"idle" | "working" | ShareOutcome>("idle");
  const [copied, setCopied] = useState(false);

  function start() {
    setQuestions(drawQuiz(10, 2));
    setAnswers([]);
    setIndex(0);
    setPicked(null);
    setShareState("idle");
    setPhase("playing");
    track("begin_quiz");
  }

  function advance() {
    if (picked === null) return;
    const nextAnswers = [...answers, picked];
    setAnswers(nextAnswers);
    if (index + 1 >= questions.length) {
      const finalScore = nextAnswers.reduce(
        (s, a, i) => s + (a === questions[i].shuffledAnswer ? 1 : 0),
        0,
      );
      track("finish_quiz", { score: finalScore, total: questions.length });
      setPhase("done");
    } else {
      setIndex(index + 1);
      setPicked(null);
    }
  }

  const score = useMemo(
    () =>
      answers.reduce(
        (s, a, i) => s + (questions[i] && a === questions[i].shuffledAnswer ? 1 : 0),
        0,
      ),
    [answers, questions],
  );
  const titleLabel = t.titles[scoreToTitle(score)] ?? scoreToTitle(score);

  async function handleShare() {
    setShareState("working");
    const outcome = await shareQuizScore(score, questions.length, titleLabel, lang);
    setShareState(outcome);
    track("save_quiz", { outcome, score });
    if (outcome !== "error") setTimeout(() => setShareState("idle"), 2600);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(t.caption(score, questions.length, titleLabel));
      setCopied(true);
      track("copy_quiz_caption");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const q = questions[index];
  const isLast = index + 1 >= questions.length;

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-[460px] flex-col px-4 pb-16 pt-12">
      <button
        onClick={onBack}
        className="self-start text-sm text-low underline-offset-4 hover:text-mid hover:underline"
      >
        {t.back}
      </button>

      {/* ---------- INTRO ---------- */}
      {phase === "intro" && (
        <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center">
          <p className="eyebrow rise-in">{t.introEyebrow}</p>
          <h2
            className="mt-3 font-display text-[1.8rem] font-light leading-tight text-hi rise-in"
            style={{ animationDelay: "60ms" }}
          >
            {t.introTitle}
          </h2>
          <p className="mt-3 text-[0.95rem] text-mid rise-in" style={{ animationDelay: "120ms" }}>
            {t.introSub}
          </p>
          <p
            className="mt-2 max-w-[320px] text-[0.8rem] leading-relaxed text-low rise-in"
            style={{ animationDelay: "160ms" }}
          >
            {t.introNote}
          </p>
          <button
            onClick={start}
            className="mt-8 rounded-[var(--radius-lg)] bg-gold px-7 py-3.5 text-sm font-semibold text-[#1a1305] shadow-[0_0_30px_var(--gold-glow)] transition-all hover:bg-gold-bright active:scale-[0.98] rise-in"
            style={{ animationDelay: "220ms" }}
          >
            {t.start}
          </button>
        </div>
      )}

      {/* ---------- PLAYING ---------- */}
      {phase === "playing" && q && (
        <div key={index} className="mt-6 flex flex-1 flex-col rise-in">
          {/* progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-low">{t.progress(index + 1, questions.length)}</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-gold transition-all duration-300"
                style={{ width: `${((index + 1) / questions.length) * 100}%` }}
              />
            </span>
          </div>

          <h2 className="mt-6 font-display text-[1.35rem] font-light leading-snug text-hi">
            {q.question}
          </h2>

          <div className="mt-6 flex flex-col gap-2.5">
            {q.shuffledOptions.map((opt, i) => {
              const active = picked === i;
              return (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  className={[
                    "flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3.5 text-left text-[0.95rem] transition-all active:scale-[0.99]",
                    active
                      ? "border-border-gold bg-gold/[0.12] text-hi shadow-[0_0_20px_var(--gold-glow)]"
                      : "border-border bg-raised text-mid hover:border-border-gold/60 hover:bg-hover",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.7rem] font-semibold",
                      active ? "border-gold-bright bg-gold text-[#1a1305]" : "border-border text-low",
                    ].join(" ")}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0 flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={advance}
              disabled={picked === null}
              className="w-full rounded-[var(--radius-lg)] bg-gold px-5 py-3.5 text-sm font-semibold text-[#1a1305] shadow-[0_0_30px_var(--gold-glow)] transition-all hover:bg-gold-bright active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {isLast ? t.finish : t.next}
            </button>
          </div>
        </div>
      )}

      {/* ---------- DONE ---------- */}
      {phase === "done" && (
        <div className="mt-8 flex flex-1 flex-col items-center text-center">
          <p className="eyebrow rise-in">{t.resultEyebrow}</p>
          <p
            className="mt-4 font-display text-[5rem] font-light leading-none text-hi rise-in"
            style={{ animationDelay: "60ms" }}
          >
            {score}
            <span className="text-mid">/{questions.length}</span>
          </p>
          <p
            className="mt-4 font-display text-[1.6rem] font-light text-gold-bright rise-in"
            style={{ animationDelay: "140ms" }}
          >
            {titleLabel}
          </p>
          <p className="mt-2 text-sm text-mid rise-in" style={{ animationDelay: "180ms" }}>
            {t.correctOf(score, questions.length)}
          </p>

          <div
            className="mt-9 flex w-full flex-col gap-2.5 rise-in"
            style={{ animationDelay: "240ms" }}
          >
            <button
              onClick={handleShare}
              disabled={shareState === "working"}
              className="w-full rounded-[var(--radius-lg)] bg-gold px-5 py-3.5 text-sm font-semibold text-[#1a1305] shadow-[0_0_30px_var(--gold-glow)] transition-all hover:bg-gold-bright active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {shareState === "working"
                ? t.shareCreating
                : shareState === "downloaded"
                  ? t.shareSaved
                  : shareState === "shared"
                    ? t.shareShared
                    : shareState === "error"
                      ? t.shareError
                      : t.shareIdle}
            </button>
            <div className="flex gap-2.5">
              <button
                onClick={handleCopy}
                className="flex-1 rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.06] px-4 py-3.5 text-sm font-medium text-gold-bright transition-all hover:bg-gold/[0.14] active:scale-[0.98]"
              >
                {copied ? t.copied : t.copyCaption}
              </button>
              <button
                onClick={start}
                className="flex-1 rounded-[var(--radius-lg)] border border-border bg-overlay px-4 py-3.5 text-sm font-medium text-mid transition-all hover:bg-hover active:scale-[0.98]"
              >
                {t.playAgain}
              </button>
            </div>
          </div>

          {/* IG funnel */}
          <div
            className="mt-7 w-full rounded-[var(--radius-md)] border border-border-gold/60 bg-gold/[0.05] px-5 py-5 text-left rise-in"
            style={{ animationDelay: "300ms" }}
          >
            <p className="text-sm leading-relaxed text-hi">{t.promo}</p>
            <IgPreview />
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("follow_ig", { from: "quiz", score })}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-gold px-6 py-3.5 text-sm font-semibold text-[#1a1305] transition-all duration-300 hover:bg-gold-bright active:scale-[0.98]"
            >
              {t.follow}
              <span aria-hidden>→</span>
            </a>
          </div>

          {/* review — what you got wrong, and the right answer */}
          <div className="mt-12 w-full text-left">
            <p className="eyebrow mb-4 text-center">{t.reviewTitle}</p>
            <div className="flex flex-col gap-3">
              {questions.map((rq, i) => {
                const a = answers[i];
                const right = a === rq.shuffledAnswer;
                return (
                  <div
                    key={rq.id}
                    className="rounded-[var(--radius-md)] border bg-raised px-4 py-3.5"
                    style={{ borderColor: right ? "rgba(138,154,106,0.45)" : "rgba(176,106,106,0.45)" }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs tabular-nums text-low">{i + 1}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold"
                        style={{
                          color: right ? "#9bb07a" : "#cf9090",
                          backgroundColor: right ? "rgba(138,154,106,0.12)" : "rgba(176,106,106,0.12)",
                        }}
                      >
                        {right ? t.correctTag : t.wrongTag}
                      </span>
                    </div>
                    <p className="text-[0.9rem] leading-snug text-hi">{rq.question}</p>
                    {!right && (
                      <p className="mt-2 text-[0.82rem] text-mid">
                        <span className="text-low">{t.yourAnswer}: </span>
                        <span style={{ color: "#cf9090" }}>{rq.shuffledOptions[a]}</span>
                      </p>
                    )}
                    <p className="mt-1 text-[0.82rem] text-mid">
                      <span className="text-low">{t.correctAnswer}: </span>
                      <span style={{ color: "#9bb07a" }}>{rq.shuffledOptions[rq.shuffledAnswer]}</span>
                    </p>
                    {rq.explanation && (
                      <p className="mt-1.5 text-[0.78rem] leading-relaxed text-low">{rq.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
