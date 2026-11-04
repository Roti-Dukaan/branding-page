/**
 * One-way sync of customer web (next-frontend) into branding-page/src/shop.
 * Rewrites `@/` imports to `@shop/` so marketing `@/` stays separate.
 *
 * Run from branding-page: node scripts/sync-shop-from-customer-web.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandingRoot = path.join(__dirname, "..");
const customerWebRoot =
  process.env.NEXT_FRONTEND_ROOT?.trim() ||
  path.join(brandingRoot, "..", "next-frontend");
const customerSrc = path.join(customerWebRoot, "src");
const shopRoot = path.join(brandingRoot, "src", "shop");

const COPY_DIRS = ["components", "hooks", "lib", "features", "services"];

const SKIP_DIR_NAMES = new Set(["node_modules", ".next"]);

function shouldCopyFile(relPath) {
  if (relPath.includes(".test.")) return false;
  return /\.(tsx?|css|json)$/.test(relPath);
}

/** Map next-frontend warm tans → branding cream tokens (survives resync). */
function applyBrandingColorRewrites(text) {
  return (
    text
      .replace(/bg-\[#e8d9c8\]/gi, "bg-cream")
      .replace(/bg-amber-50\/40/g, "bg-cream/40")
      .replace(/bg-amber-50\/30/g, "bg-cream/30")
      .replace(/bg-amber-50/g, "bg-cream-deep")
      .replace(/border-amber-100\/60/g, "border-sand/60")
      .replace(/border-amber-100\/50/g, "border-sand/50")
      .replace(/border-amber-100\/30/g, "border-sand/30")
      .replace(/border-amber-50/g, "border-sand")
      .replace(/hover:bg-amber-50/g, "hover:bg-cream-deep")
  );
}

function rewriteContent(text) {
  return applyBrandingColorRewrites(text.replace(/@\//g, "@shop/"));
}

function copyDir(srcDir, destDir, rel = "") {
  if (!fs.existsSync(srcDir)) {
    console.warn("Missing:", srcDir);
    return;
  }
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    if (SKIP_DIR_NAMES.has(name)) continue;
    const srcPath = path.join(srcDir, name);
    const destPath = path.join(destDir, name);
    const relPath = path.join(rel, name);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, relPath);
    } else if (shouldCopyFile(relPath)) {
      const raw = fs.readFileSync(srcPath, "utf8");
      fs.writeFileSync(destPath, rewriteContent(raw), "utf8");
    }
  }
}

function rmShop() {
  if (fs.existsSync(shopRoot)) {
    fs.rmSync(shopRoot, { recursive: true, force: true });
  }
}

console.log("Syncing customer web → src/shop …");
rmShop();
fs.mkdirSync(shopRoot, { recursive: true });

for (const dir of COPY_DIRS) {
  copyDir(path.join(customerSrc, dir), path.join(shopRoot, dir), dir);
}

const customerGlobals = path.join(customerSrc, "app", "globals.css");
const shopGlobals = path.join(brandingRoot, "src", "app", "(shop)", "customer-globals.css");
const customerTheme = path.join(brandingRoot, "src", "app", "customer-theme.css");

/** Split next-frontend globals so we never @import tailwindcss twice (breaks all utilities). */
function transformCustomerGlobals(raw) {
  let css = raw.replace(/@import\s+"tailwindcss"\s*;\s*\n?/g, "");

  const variantBlock =
    css.match(/(@custom-variant[^\n]+\n)+/)?.[0]?.trim() ?? "";
  if (variantBlock) css = css.replace(variantBlock, "").trimStart();

  const themeMatch = css.match(/@theme inline\s*\{[\s\S]*?\n\}/);
  const themeBlock = [variantBlock, themeMatch?.[0] ?? ""].filter(Boolean).join("\n\n");
  if (themeMatch) css = css.replace(themeMatch[0], "");

  css = css.replace(
    /@layer base\s*\{\s*html\s*\{[\s\S]*?\}\s*body\s*\{/,
    "@layer base {\n  .customer-web {",
  );

  return { themeBlock: themeBlock ? `${themeBlock}\n` : "", shellCss: css.trim() + "\n" };
}

/** Match marketing site cream instead of next-frontend #FFFDF7. */
function applyBrandingThemeTokens(themeCss) {
  return themeCss
    .replace(/#FFFDF7/gi, "#fbf4e6")
    .replace(/#F5F5F4/gi, "#f4e7cf");
}

if (fs.existsSync(customerGlobals)) {
  const raw = fs.readFileSync(customerGlobals, "utf8");
  const { themeBlock, shellCss } = transformCustomerGlobals(raw);
  const themed = applyBrandingThemeTokens(themeBlock);
  fs.writeFileSync(
    customerTheme,
    `/* Synced from next-frontend — do not edit; run npm run sync:shop */\n${themed}`,
    "utf8",
  );
  fs.writeFileSync(shopGlobals, shellCss, "utf8");
  console.log("Wrote src/app/customer-theme.css + src/app/(shop)/customer-globals.css");
}

/** Static assets referenced by synced UI (login modal, menu placeholders). */
const PUBLIC_ASSET_PATHS = [
  "auth/login-brand.png",
  "foods/placeholder.jpg",
  "about/our-kitchen.png",
];

const customerPublic = path.join(customerWebRoot, "public");
const brandingPublic = path.join(brandingRoot, "public");

for (const rel of PUBLIC_ASSET_PATHS) {
  const src = path.join(customerPublic, rel);
  const dest = path.join(brandingPublic, rel);
  if (!fs.existsSync(src)) {
    console.warn("Missing public asset:", src);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("Copied public/", rel);
}

console.log("Done. src/shop is ready (local only — see .gitignore).");
console.log("Next: node scripts/sync-shop-app-routes.mjs");
