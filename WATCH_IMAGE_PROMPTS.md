# Watch illustration prompts (AI, cartoon, no brand logo)

Generate one cartoon-style illustration per watch, drop it into
`public/watches/<id>.png`, and it appears automatically on the result page and
the share card. No code changes needed — the build regenerates the manifest.
Any watch without a PNG keeps using the built-in SVG, so you can add them a few
at a time.

## How to use

1. Pick a tool that keeps a **consistent style** across images:
   - **ChatGPT (GPT-4o / "gpt-image-1")** — easiest; generate the first one, then say "same style, next watch: …".
   - **Midjourney** — use `--sref <url>` (style reference) or `--sref random` then reuse the seed to lock the look.
   - **Flux** (via Leonardo.ai / Freepik) — fix the style block + seed.
2. For each watch, paste the **STYLE BLOCK** + that watch's **[config]** line (below).
3. Save as **`<id>.png`** (exact id from the table) into `public/watches/`.
4. Commit + push (or `npm run build`) — done.

## Specs

- **Square 1:1**, ideally **1024×1024** (or larger).
- **Transparent background preferred** (PNG); a flat dark `#0a0a0b` background also works.
- Watch **centred**, front view, filling ~80% of the frame.
- **No text, no numbers, no brand logo, no markings** on the dial.
- Keep all 35 in the **same illustration style** so the cards look like one set.

## STYLE BLOCK (paste before every watch)

```
Flat minimalist vector-style illustration of a luxury wristwatch, front view,
perfectly centred, soft studio lighting, elegant and premium, warm gold accents,
clean cartoon look, transparent background, NO text, NO numbers, NO brand logo,
NO markings — a generic unbranded watch. Consistent illustration style across a set.
Watch details: [config]
```

## The 35 watches — id → `[config]`

> Filename = the **id** + `.png` (e.g. `ap-ro-16202st.png`).

### Owned collection
| id | watch (for your reference) | `[config]` |
|----|----|----|
| `ap-ro-16202st` | AP Royal Oak Jumbo | octagonal steel case with eight hexagonal screws on the bezel, deep blue grid-textured dial, integrated steel bracelet |
| `ap-ro-26240st` | AP Royal Oak Chrono | octagonal steel case with bezel screws, green grid dial with two small chronograph sub-dials, integrated steel bracelet |
| `ap-ro-77450st` | AP Royal Oak Selfwinding | slim octagonal steel case with bezel screws, clean white grid dial, integrated steel bracelet |
| `ap-code-15210qt` | AP Code 11.59 | round steel case with a black ceramic middle and curved arched lugs, smoked grey dial, black rubber strap |
| `ap-code-15212nb` | AP Code 11.59 Starwheel | round white-gold case with arched lugs, deep blue starry aventurine dial with small rotating wandering-hour discs, blue leather strap |
| `lange-1-moonphase` | Lange 1 Moonphase | round rose-gold case, silver asymmetric dial with off-centre time, a large date window and a small moon-phase, brown leather strap |
| `daniel-roth-447` | Daniel Roth Skeleton Chrono | oval double-ellipse yellow-gold case, salmon skeletonised dial showing the gears, brown leather strap |
| `chronoswiss-regulator` | Chronoswiss Regulator | round steel case with a big onion crown, white regulator dial with separate hour, minute and seconds sub-dials, black leather strap |
| `cw-bel-canto` | Christopher Ward Bel Canto | round titanium case, salmon dial with an exposed chiming hammer and a curved gong, green textile strap |
| `breguet-3357ba` | Breguet Tourbillon | oval yellow-gold case with a finely fluted caseband, silver hand-engraved guilloché dial with a tourbillon opening, brown leather strap |

### Iconic references
| id | watch | `[config]` |
|----|----|----|
| `rolex-sub-126610ln` | Rolex Submariner | round steel dive case with a black rotating bezel, glossy black dial with round luminous markers, steel bracelet |
| `patek-nautilus-5711` | Patek Nautilus | rounded-octagon steel case with small side "ears", blue horizontally-embossed dial, integrated steel bracelet |
| `omega-speedmaster` | Omega Speedmaster | round steel case with a black tachymeter bezel, black dial with three chronograph sub-dials, steel bracelet |
| `cartier-tank-louis` | Cartier Tank | rectangular yellow-gold tank case with vertical brancards, silver dial, brown leather strap |
| `vc-overseas-4500v` | VC Overseas | round steel case with a six-sided bezel, blue sunburst dial, integrated steel bracelet |
| `jlc-reverso-tribute` | JLC Reverso | rectangular art-deco steel case with three horizontal gadroon lines, blue sunray dial, black leather strap |
| `gs-snowflake` | Grand Seiko Snowflake | round titanium case, textured snowy-white dial with a small power-reserve arc, steel bracelet |
| `panerai-luminor` | Panerai Luminor | cushion-shaped steel case with a hinged crown-protecting bridge, black dial, brown leather strap |
| `vc-patrimony-platinum` | VC Patrimony | ultra-thin round platinum case, minimalist silver dial with slim baton markers, black leather strap |
| `lange-zeitwerk` | Lange Zeitwerk | round platinum case, black dial with bold jumping digital hour and minute windows across the centre, black leather strap |
| `iwc-big-pilot` | IWC Big Pilot | large round steel pilot case with a conical crown, black dial with a triangle at the top, brown leather strap |

### Independents
| id | watch | `[config]` |
|----|----|----|
| `fpjourne-bleu` | F.P. Journe Chronomètre Bleu | round blue-grey tantalum case, vivid electric-blue dial with an off-centre small-seconds sub-dial, black leather strap |
| `fpjourne-octa-lune` | F.P. Journe Octa Lune | round red-gold case, silver guilloché dial with a date arc, a power-reserve gauge and a small moon-phase, brown leather strap |
| `moser-endeavour-fume` | H. Moser Endeavour | round steel case, smoky blue fumé gradient dial with absolutely no markers and no text, black leather strap |
| `laurent-ferrier-origin` | Laurent Ferrier Classic Origin | round titanium case with gently curved lugs, green gradient opaline dial, brown leather strap |
| `debethune-db28` | De Bethune DB28 | round polished-titanium case with floating articulated lugs on the sides, mirror-polished blued steel dial, black leather strap |
| `czapek-antarctique` | Czapek Antarctique | round steel case with a fluted integrated bezel, salmon dial with subtle hobnail texture, integrated steel bracelet |
| `mbf-lm101` | MB&F LM101 | round rose-gold case, white lacquer dial with a large balance wheel suspended and floating above the dial plus a small time sub-dial, brown leather strap |
| `voutilainen-vingt8` | Voutilainen Vingt-8 | round white-gold case with teardrop lugs, finely hand-engraved silver-grey guilloché dial, black leather strap |
| `gronefeld-1941` | Grönefeld 1941 | round steel case with stepped lugs, warm salmon dial with a small seconds sub-dial, brown leather strap |
| `akrivia-cc2` | Akrivia Chronomètre Contemporain | round platinum case with a stepped bezel, glossy white grand-feu enamel dial with a small seconds, black leather strap |
| `lange-datograph` | Lange Datograph | round platinum case, black dial with two chronograph sub-dials and a small power-reserve, black leather strap |
| `breguet-tradition` | Breguet Tradition | round rose-gold case, an off-centre silver chapter ring with the bare symmetric movement bridges exposed across the dial, brown leather strap |
| `patek-calatrava-5226` | Patek Calatrava 5226G | round white-gold case, charcoal-grey dial with a hobnail-guilloché centre and a smooth grained outer ring, black calf strap |
| `greubel-balancier` | Greubel Forsey Balancier | round white-gold case, silver-grey dial with a large inclined balance wheel visible in an opening, black leather strap |

## Tips for a cohesive set

- Generate **one** watch first, lock the look you like, then reuse the **same
  seed / style reference** for the rest — consistency is what makes the shared
  cards feel like one brand.
- If a watch comes out with a logo or text, regenerate with "NO text, NO logo"
  emphasised — those must stay off for trademark safety.
- You don't need all 35 at once. Add what you have; the rest stay on the clean
  SVG fallback until you replace them.
