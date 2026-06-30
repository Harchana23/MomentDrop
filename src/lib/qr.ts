import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const QRCode = require("qrcode") as typeof import("qrcode");

/** PNG data URL for a QR code of `text`. Server-only. */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 320,
    color: { dark: "#1f1b16", light: "#ffffff" },
  });
}
