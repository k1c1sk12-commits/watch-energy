"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "./copy";

export type { Lang } from "./copy";

const STORAGE_KEY = "we-lang";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  // Default English (the app's "International English" positioning); the visitor
  // can switch to 繁中, and we remember the choice for next time.
  const [lang, setLangState] = useState<Lang>("en");

  // One-time sync from the persisted choice on mount. We start from "en" so the
  // server-rendered markup is stable, then adopt the saved language on the
  // client — a deliberate read from an external store, not a render cascade.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "zh" || saved === "en") setLangState(saved);
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  return useContext(Ctx);
}
