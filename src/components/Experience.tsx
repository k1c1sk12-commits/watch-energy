"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getReading, parseDOB } from "@/lib/engine";
import { WATCHES } from "@/lib/watches";
import type { Reading as ReadingResult } from "@/lib/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Landing from "./Landing";
import InputScreen, { type RevealData } from "./InputScreen";
import ReadingScreen from "./Reading";
import Result from "./Result";

type Phase = "landing" | "input" | "reading" | "result";

const TEASER = WATCHES.find((w) => w.id === "ap-ro-16202st")!;

export default function Experience() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("landing");
  const [draft, setDraft] = useState<Partial<RevealData>>({});
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = useCallback((d: RevealData) => {
    const parsed = parseDOB(d.iso);
    if (!parsed.ok) return;
    setDraft(d);
    const r = getReading({
      dob: parsed.dob,
      nature: d.nature,
      bias: { metal: d.answers.metal, mind: d.answers.mind, feel: d.answers.feel },
      misread: d.answers.misread,
      name: d.name,
    });
    setReading(r);
    setPhase("reading");
  }, []);

  // auto-advance from the brief reading animation into the result (whose first
  // act is the energy-recipe build-up, so this stays short to avoid two waits).
  useEffect(() => {
    if (phase !== "reading") return;
    const dur = reduced ? 500 : 1300;
    timer.current = setTimeout(() => setPhase("result"), dur);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase, reduced]);

  // keep the viewport at the top on each phase change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [phase, reduced]);

  const READING_MS = reduced ? 700 : 2600;

  return (
    <main className="relative min-h-[100svh] overflow-hidden">
      <div key={phase} className="rise-in">
        {phase === "landing" && <Landing teaser={TEASER} onBegin={() => setPhase("input")} />}
        {phase === "input" && <InputScreen initial={draft} onReveal={reveal} />}
        {phase === "reading" && <ReadingScreen durationMs={READING_MS} />}
        {phase === "result" && reading && (
          <Result reading={reading} onRetry={() => setPhase("input")} />
        )}
      </div>
    </main>
  );
}
