"use client";

import { useRef, useState } from "react";
import { QUESTIONS, type QuestionKey } from "@/lib/engine";
import { Q_OPTIONS, Q_PROMPTS, UI, vibeHint, vibeLabel, type Lang } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { VIBES, type Energy, type Vibe } from "@/lib/types";

const TODAY = new Date();
const MAX_DATE = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, "0")}-${String(
  TODAY.getDate(),
).padStart(2, "0")}`;

function formatNice(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (lang === "zh") return `${y}年${m}月${d}日`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}

export interface RevealData {
  name: string;
  iso: string;
  nature: Vibe;
  answers: Record<QuestionKey, Energy>;
}

interface ChipOption {
  id: string;
  label: string;
  hint: string;
}

function ChipGroup({
  labelId,
  prompt,
  sub,
  options,
  selected,
  onSelect,
}: {
  labelId: string;
  prompt: string;
  sub?: string;
  options: ChipOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 block text-sm font-medium text-mid" id={labelId}>
        {prompt}
      </p>
      {sub && <p className="mb-3 text-xs text-low">{sub}</p>}
      {!sub && <div className="mb-3" />}
      <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-2 gap-2.5">
        {options.map((o) => {
          const on = selected === o.id;
          return (
            <button
              key={o.id}
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(o.id)}
              className={[
                "flex min-h-[58px] flex-col items-start justify-center rounded-[var(--radius-sm)] border px-4 py-2.5 text-left transition-all duration-200",
                on
                  ? "border-border-gold bg-gold/[0.1] shadow-[0_0_18px_var(--gold-glow)]"
                  : "border-border bg-overlay hover:border-white/20 hover:bg-hover",
              ].join(" ")}
            >
              <span className={["text-[0.95rem] font-medium leading-tight", on ? "text-gold-bright" : "text-hi"].join(" ")}>
                {o.label}
              </span>
              {o.hint && <span className="mt-0.5 text-xs text-low">{o.hint}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function InputScreen({
  initial,
  onReveal,
}: {
  initial: Partial<RevealData>;
  onReveal: (d: RevealData) => void;
}) {
  const { lang } = useLang();
  const t = UI[lang];
  const [name, setName] = useState(initial.name ?? "");
  const [iso, setIso] = useState(initial.iso ?? "1987-11-01");
  const [nature, setNature] = useState<Vibe | null>(initial.nature ?? null);
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, Energy>>>(initial.answers ?? {});
  const dateRef = useRef<HTMLInputElement>(null);

  const allAnswered = QUESTIONS.every((q) => answers[q.key]);
  const ready = Boolean(iso) && Boolean(nature) && allAnswered;

  function selectAnswer(q: (typeof QUESTIONS)[number], optionId: string) {
    const energy = q.options.find((o) => o.id === optionId)!.energy;
    setAnswers((prev) => ({ ...prev, [q.key]: energy }));
  }

  function submit() {
    if (!ready || !nature) return;
    onReveal({ name: name.trim(), iso, nature, answers: answers as Record<QuestionKey, Energy> });
  }

  // current selected option id per question (map stored energy back to option id)
  const selectedId = (q: (typeof QUESTIONS)[number]) =>
    q.options.find((o) => o.energy === answers[q.key])?.id ?? null;

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-[420px] flex-col justify-center px-5 pb-32 pt-12">
      <p className="eyebrow mb-2 rise-in">{t.inputEyebrow}</p>
      <h2
        className="mb-7 font-display text-[1.7rem] font-light leading-tight text-hi rise-in"
        style={{ animationDelay: "40ms" }}
      >
        {t.inputTitle}
      </h2>

      <div className="flex flex-col gap-7">
        {/* name */}
        <div className="rise-in" style={{ animationDelay: "90ms" }}>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-mid">
            {t.nameLabel}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full rounded-[var(--radius-md)] border border-border bg-overlay px-5 py-4 text-hi placeholder:text-low outline-none transition-colors focus:border-border-gold"
          />
        </div>

        {/* birth date */}
        <div className="rise-in" style={{ animationDelay: "145ms" }}>
          <label htmlFor="dob" className="mb-2 block text-sm font-medium text-mid">
            {t.dobLabel}
          </label>
          <div className="relative flex w-full items-center justify-between rounded-[var(--radius-md)] border border-border bg-overlay px-5 py-4 text-left transition-colors hover:border-border-gold focus-within:border-border-gold">
            <span className={iso ? "text-hi" : "text-low"}>{iso ? formatNice(iso, lang) : t.dobPlaceholder}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gold" aria-hidden>
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={dateRef}
              id="dob"
              type="date"
              value={iso}
              min="1900-01-01"
              max={MAX_DATE}
              onChange={(e) => setIso(e.target.value)}
              onClick={() => {
                try {
                  dateRef.current?.showPicker?.();
                } catch {
                  /* already open */
                }
              }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={t.dobAria}
            />
          </div>
        </div>

        {/* nature */}
        <div className="rise-in" style={{ animationDelay: "200ms" }}>
          <ChipGroup
            labelId="nature-label"
            prompt={t.naturePrompt}
            sub={t.natureSub}
            options={VIBES.map((v) => ({ id: v, label: vibeLabel(v, lang), hint: vibeHint(v, lang) }))}
            selected={nature}
            onSelect={(id) => setNature(id as Vibe)}
          />
        </div>

        {/* extra questions */}
        {QUESTIONS.map((q, i) => (
          <div key={q.key} className="rise-in" style={{ animationDelay: `${255 + i * 55}ms` }}>
            <ChipGroup
              labelId={`q-${q.key}`}
              prompt={Q_PROMPTS[lang][q.key]}
              options={q.options.map((o) => ({
                id: o.id,
                label: Q_OPTIONS[lang][o.id].label,
                hint: Q_OPTIONS[lang][o.id].hint,
              }))}
              selected={selectedId(q)}
              onSelect={(id) => selectAnswer(q, id)}
            />
          </div>
        ))}
      </div>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-base via-base/95 to-transparent px-5 pb-6 pt-8">
        <div className="mx-auto max-w-[420px]">
          <button
            disabled={!ready}
            onClick={submit}
            className={[
              "w-full rounded-[var(--radius-lg)] px-8 py-4 text-[0.98rem] font-semibold tracking-wide transition-all duration-300",
              ready
                ? "bg-gold text-[#1a1305] shadow-[0_0_30px_var(--gold-glow)] hover:bg-gold-bright active:scale-[0.98]"
                : "cursor-not-allowed bg-overlay text-low",
            ].join(" ")}
          >
            {ready ? t.ctaReady : t.ctaNotReady}
          </button>
        </div>
      </div>
    </section>
  );
}
