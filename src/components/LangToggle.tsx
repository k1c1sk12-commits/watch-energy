"use client";

import { useLang } from "@/lib/i18n";

// Fixed corner EN / 繁 switch. Updates every screen live (all copy is rendered
// from the current language, never baked in).
export default function LangToggle() {
  const { lang, setLang } = useLang();
  const opts: { id: "en" | "zh"; label: string }[] = [
    { id: "en", label: "EN" },
    { id: "zh", label: "繁" },
  ];
  return (
    <div className="fixed right-3 top-3 z-50 flex overflow-hidden rounded-full border border-border-gold/60 bg-base/70 backdrop-blur-sm">
      {opts.map((o) => {
        const on = lang === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setLang(o.id)}
            aria-pressed={on}
            className={[
              "px-3 py-1.5 text-xs font-medium transition-colors",
              on ? "bg-gold/[0.16] text-gold-bright" : "text-low hover:text-mid",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
