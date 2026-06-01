"use client";

import { useEffect, useState } from "react";
import { UI } from "@/lib/copy";
import { useLang } from "@/lib/i18n";

export default function Reading({ durationMs }: { durationMs: number }) {
  const { lang } = useLang();
  const steps = UI[lang].readingSteps;
  const [step, setStep] = useState(0);
  useEffect(() => {
    const each = durationMs / steps.length;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), each);
    return () => clearInterval(id);
  }, [durationMs, steps.length]);

  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full" style={{ animation: "ring-spin 1.4s linear infinite" }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(201,168,106,0.14)" strokeWidth="2" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="70 210"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-gold-bright shadow-[0_0_12px_var(--gold)]" />
        </span>
      </div>

      <p key={step} className="mt-8 text-sm tracking-wide text-mid" style={{ animation: "status-fade 1s ease both" }}>
        {steps[step]}
      </p>
    </section>
  );
}
