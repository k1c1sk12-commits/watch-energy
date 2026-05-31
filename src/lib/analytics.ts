// Thin wrapper over GA4's gtag. No-ops when GA isn't loaded (e.g. local dev with
// no NEXT_PUBLIC_GA_ID), so call sites never need to guard.
type Params = Record<string, string | number | boolean | undefined>;

export function track(event: string, params?: Params): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") w.gtag("event", event, params ?? {});
}
