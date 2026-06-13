import { ImageResponse } from "next/og";

export const alt = "Sento-Sé & Advogados Associados — Advocacia em Salvador";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#08332a",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 4,
            color: "#c0995a",
            textTransform: "uppercase",
          }}
        >
          Advocacia em Salvador — BA
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 700,
            marginTop: 24,
            lineHeight: 1.08,
            maxWidth: 900,
          }}
        >
          Sento-Sé &amp; Advogados Associados
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.72)",
            marginTop: 28,
          }}
        >
          Trabalhista · Cível · Consumidor · Médico
        </div>
        <div style={{ display: "flex", marginTop: 44 }}>
          <div style={{ width: 140, height: 6, background: "#c0995a" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
