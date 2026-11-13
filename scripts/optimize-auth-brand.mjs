#!/usr/bin/env node
/** Resize + WebP for login modal brand art (~2MB PNG → ~150KB WebP). */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/auth/login-brand.png");
const out = path.join(root, "public/auth/login-brand.webp");

if (!fs.existsSync(src)) {
  console.error("Missing", src);
  process.exit(1);
}

await sharp(src)
  .resize({ width: 960, withoutEnlargement: true })
  .webp({ quality: 82, effort: 4 })
  .toFile(out);

const before = fs.statSync(src).size;
const after = fs.statSync(out).size;
console.log(`login-brand: ${(before / 1024).toFixed(0)} KiB PNG → ${(after / 1024).toFixed(0)} KiB WebP`);
