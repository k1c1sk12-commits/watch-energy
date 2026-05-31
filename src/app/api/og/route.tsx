import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

const GOLD = "#c9a86a";
const GOLD_HI = "#e6c98f";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(201,168,106,0.18), transparent 55%), linear-gradient(180deg, #101015 0%, #08080a 100%)",
          color: "#f5f3ee",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* frame */}
        <div
          style={{
            position: "absolute",
            top: "28px",
            left: "28px",
            right: "28px",
            bottom: "28px",
            border: `1.5px solid rgba(201,168,106,0.30)`,
            borderRadius: "22px",
            display: "flex",
          }}
        />

        {/* decorative dial rings */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            width: "360px",
            height: "360px",
            borderRadius: "9999px",
            border: `1px solid rgba(201,168,106,0.16)`,
            top: "135px",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: "26px",
            letterSpacing: "12px",
            color: GOLD,
            fontFamily: "sans-serif",
            marginBottom: "28px",
          }}
        >
          WATCH ENERGY
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "72px",
            fontWeight: 400,
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "900px",
            justifyContent: "center",
          }}
        >
          Meet your destiny watch.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "30px",
            fontSize: "30px",
            color: "#b5b2ab",
            fontFamily: "sans-serif",
            textAlign: "center",
            maxWidth: "760px",
            justifyContent: "center",
          }}
        >
          Your birth and your nature, channelled into one luxury watch.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "44px",
            fontSize: "26px",
            color: GOLD_HI,
            fontFamily: "sans-serif",
          }}
        >
          @gptwatchcollector
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
