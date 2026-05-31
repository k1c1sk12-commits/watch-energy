# Watch Energy

A playful, mobile-first web experience: enter your birth date and today's mood, and get **one** haute-horlogerie watch matched to your **energy** — case, dial, and the reading behind it. Built to drive traffic and follows to **[@gptwatchcollector](https://www.instagram.com/gptwatchcollector/)**.

International English · dark-luxe + gold · no sign-up · ~15 seconds to a shareable result.

> For fun. Not financial or astrological advice.

---

## What it does

1. **Two taps** — a birth date and one of five energy vibes (Calm · Bold · Focused · Magnetic · Grounded).
2. **A reading** — a short reveal animation, then a single watch with an animated *energy match %* and a *rarity* stamp.
3. **A reason** — two or three sentences linking your energy + today's vibe to the watch's case material and dial colour.
4. **A share card** — a baked 1080×1920 (9:16) image with the watch, match %, rarity and the `@gptwatchcollector` handle, ready for Instagram Stories via the native share sheet (downloads on desktop). Plus a one-tap *Copy caption*.
5. **A follow CTA** — the result frames the watch as part of a real collection and points to Instagram.

The pool is **22 watches** — the real collection (10 pieces) plus iconic references. Owned pieces surface a little more often, so the payoff ("this is actually his — go see it") lands. Every result is **deterministic**: same date + same vibe always gives the same watch.

## How the engine works (no astrology dependencies)

- **Five energies** — `Verdant · Ember · Terra · Lumen · Tide` — internal mappings of a five-element cycle, surfaced only as "energy". No feng-shui / zodiac vocabulary in the UI.
- **Base energy** is derived deterministically from the birth date (`digitSum(year) + month + day mod 5`).
- **Vibe** biases the match toward a target energy.
- **Scoring** rates each watch's case + dial energies against your base energy and vibe; the result is picked from the top "still a great match" band, seeded by your full date so different people discover different watches.
- **Match %** maps the score into a flattering 80–99 band.

Everything lives in [`src/lib/`](src/lib/): `engine.ts`, `watches.ts`, `types.ts`, `shareCard.ts`.

Run the engine integrity checks (pool balance, distribution, determinism, validation):

```bash
npm run verify
```

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

Stack: **Next.js 16** (App Router) · **React 19** · **Tailwind v4** · `next/font` (Fraunces + Inter) · `next/og` for the link-preview image. The watch illustrations are **generated SVG** — no image assets, no licensing.

## Deploy to Vercel

This is a standard Next.js app — zero config needed.

**Option A — Dashboard**
1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com) → *New Project* → import the repo.
3. (Optional) add the env var `NEXT_PUBLIC_SITE_URL` = your production URL.
4. Deploy.

**Option B — CLI**
```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

After the first deploy, set `NEXT_PUBLIC_SITE_URL` in *Project → Settings → Environment Variables* to your real domain so Open Graph / share links are correct, then redeploy.

## Customising

- **Watches** — edit [`src/lib/watches.ts`](src/lib/watches.ts) (each entry has display fields, `caseEnergy` / `dialEnergy`, a `rarity`, and visual hints for the SVG). Keep all five energies covered on both the case and dial slots — `npm run verify` will flag gaps.
- **Copy / vibes / energy names** — [`src/lib/engine.ts`](src/lib/engine.ts).
- **Look & feel** — design tokens in [`src/app/globals.css`](src/app/globals.css).
- **Instagram handle** — search for `gptwatchcollector` across `src/`.
