import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Piggy Back — Shopee cashback";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const mascot = await readFile(join(process.cwd(), "public", "logo_full.png"));
  const wordmark = await readFile(join(process.cwd(), "public", "brand-wordmark.png"));
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "60px 75px",
        background: "#fffaf6",
        color: "#30212a",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "55%" }}>
        <span style={{ fontSize: 20, letterSpacing: 6, color: "#a8245e" }}>
          SHOPPING & CASHBACK
        </span>
        {/* Satori requires a native image element inside ImageResponse. */}
        <img
          src={`data:image/png;base64,${wordmark.toString("base64")}`}
          alt="Piggy Back"
          width={550}
          height={138}
          style={{ marginTop: 45 }}
        />
        <span style={{ fontSize: 27, marginTop: 32 }}>Shopee</span>
      </div>
      <div
        style={{
          display: "flex",
          width: 500,
          height: 500,
          borderRadius: 250,
          background: "#f8e5e8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Satori requires a native image element inside ImageResponse. */}
        <img
          src={`data:image/png;base64,${mascot.toString("base64")}`}
          alt=""
          width={500}
          height={500}
        />
      </div>
    </div>,
    size,
  );
}
