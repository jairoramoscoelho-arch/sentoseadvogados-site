import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#115c4a",
          color: "#c0995a",
          fontSize: 46,
          fontWeight: 700,
        }}
      >
        §
      </div>
    ),
    { ...size },
  );
}
