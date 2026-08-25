import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#101714" }}>
      <div style={{ width: 310, height: 310, display: "flex", alignItems: "center", justifyContent: "center", border: "34px solid #d4774c", borderRadius: "50%", color: "#f1ead9", fontSize: 190, fontFamily: "serif", lineHeight: 1 }}>o</div>
    </div>,
    size,
  );
}
