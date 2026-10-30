import { mkdir } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rotidukaan.com").replace(/\/$/, "");
const downloadUrl = `${siteUrl}/download`;
const outDir = path.join(process.cwd(), "public", "images", "qr");

const options = {
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#163f20", light: "#fbf4e6" },
};

await mkdir(outDir, { recursive: true });
await QRCode.toFile(path.join(outDir, "download-app-qr.png"), downloadUrl, { ...options, width: 512 });
await QRCode.toFile(path.join(outDir, "download-app-qr.svg"), downloadUrl, { ...options, type: "svg" });

const blackOptions = { ...options, color: { dark: "#000000", light: "#ffffff" } };
await QRCode.toFile(path.join(outDir, "download-app-qr-black.png"), downloadUrl, {
  ...blackOptions,
  width: 1024,
});
await QRCode.toFile(path.join(outDir, "download-app-qr-black.svg"), downloadUrl, {
  ...blackOptions,
  type: "svg",
});

console.log(`QR codes for ${downloadUrl} written to ${path.relative(process.cwd(), outDir)}`);
