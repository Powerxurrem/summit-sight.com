import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#101714" }}>
      <div style={{ width: 112, height: 112, display: "flex", alignItems: "center", justifyContent: "center", border: "13px solid #d4774c", borderRadius: "50%", color: "#f1ead9", fontSize: 70, fontFamily: "serif", lineHeight: 1 }}>o</div>
    </div>,
    size,
  );
}
