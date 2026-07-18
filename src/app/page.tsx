import Experience from "@/components/Experience";

export default function Home() {
  return (
    <>
      {/*
        Server-rendered, crawlable description. The interactive Experience below
        is fully client-rendered, so without this block search engines and
        screen readers would see an empty shell. Visually hidden (sr-only) but
        present in the initial HTML — genuine descriptive content, not stuffing.
      */}
      <section className="sr-only">
        <h1>GPT Watch Collector Playground — six free watch games · 玩錶遊樂場</h1>
        <p>
          Six free watch games built on one real collection:{" "}
          <a href="/bone">Bone Eater</a> — a satirical tycoon about the AD
          allocation game, where you bundle the shelf sitters, build purchase
          history and wait for the boutique&apos;s call; a{" "}
          <a href="/quiz">Watch Knowledge Quiz</a> (ten questions per round from
          an original bank of 100+ covering watch history, complications,
          movements, materials, brands and finishing);{" "}
          <a href="/smash">Watch Smash</a> — a keyboard-smash game where every
          letter throws out a real watch brand; the Destiny Watch match; a
          Watch Bracket; and a Watch Tier List.
        </p>
        <p>
          The Destiny Watch match reads your birth and your nature and matches
          you to a single haute-horlogerie piece — its case, dial, strap, and
          the energy it carries. The matching pool spans independent and
          grande-maison haute horlogerie: Audemars Piguet Royal Oak and Code
          11.59, A. Lange &amp; Söhne, Breguet, Daniel Roth, Chronoswiss,
          Christopher Ward, Patek Philippe, Vacheron Constantin,
          Jaeger-LeCoultre, Rolex, Cartier, Omega and Grand Seiko.
        </p>
        <p>
          六個建基於真實收藏的玩錶遊戲：食骨模擬器（配貨求生遊戲）、腕錶知識測驗、
          腕錶亂打、命定之錶、腕錶對決、腕錶 tier list。由一位真正的玩錶人打造 ——
          無廣告、無註冊、不賣任何東西。
        </p>
        <p>
          By @gptwatchcollector — a watch collector and KOL sharing haute
          horlogerie, complications, and independent watchmaking.
        </p>
      </section>
      <Experience />
    </>
  );
}
