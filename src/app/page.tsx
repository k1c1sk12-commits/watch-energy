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
        <h1>Watch Energy — Meet your destiny watch · 你的命定之錶</h1>
        <p>
          Every collector has one destined watch. Watch Energy reads your birth
          and your nature and matches you to a single haute-horlogerie piece —
          its case, dial, strap, and the energy it carries. Not a horoscope; a
          horological match, built by a watch collector.
        </p>
        <p>
          The matching pool spans independent and grande-maison haute
          horlogerie: Audemars Piguet Royal Oak and Code 11.59, A. Lange &amp;
          Söhne, Breguet, Daniel Roth, Chronoswiss, Christopher Ward, Patek
          Philippe, Vacheron Constantin, Jaeger-LeCoultre, Rolex, Cartier, Omega
          and Grand Seiko.
        </p>
        <p>
          每位藏家都有一枚命定之錶。Watch Energy 以你的出生與本質，配對一枚為你而寫的
          高級腕錶 —— 錶殼、錶面、錶帶，以及它承載的能量。這不是星座占卜，而是一場製錶
          層面的配對，由一位真正的玩錶人打造。
        </p>
        <p>
          Four free games: the Destiny Watch match, a{" "}
          <a href="/quiz">Watch Knowledge Quiz</a> (ten questions per round from
          an original bank of 100+ covering watch history, complications,
          movements, materials, brands and finishing), a Watch Tier List, and a
          Watch Bracket.
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
