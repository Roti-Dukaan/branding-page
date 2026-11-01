/**
 * Copy next-frontend app routes into src/app/(shop)/ with @shop imports.
 * Skips root layout/globals and home page.tsx (marketing owns /).
 *
 * Run: node scripts/sync-shop-app-routes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandingRoot = path.join(__dirname, "..");
const customerApp = path.join(brandingRoot, "..", "next-frontend", "src", "app");
const shopApp = path.join(brandingRoot, "src", "app", "(shop)");

const SKIP_FILES = new Set(["layout.tsx", "globals.css", "page.tsx"]);
const SKIP_DIRS = new Set(["node_modules", ".next"]);

/** Marketing site already owns these URLs (branding layout / copy). */
const SKIP_ROUTE_PREFIXES = [
  "about",
  "cancellation-refund-policy",
  "contact",
  "faqs",
  "help",
  "privacy-policy",
  "shipping-delivery-policy",
  "subscription-policy",
  "terms-and-conditions",
];

function shouldSkipRoute(relPosix) {
  const segment = relPosix.split("/")[0];
  return SKIP_ROUTE_PREFIXES.includes(segment);
}

function rewriteContent(text) {
  return text.replace(/@\//g, "@shop/");
}

const SKIP_ROUTE_FILES = new Set(["subscriptions/page.tsx"]);

function shouldSkipFile(relPosix) {
  const base = path.posix.basename(relPosix);
  if (SKIP_ROUTE_FILES.has(relPosix)) return true;
  if (base === "page.tsx" && !relPosix.includes("/")) return true;
  if (SKIP_FILES.has(base) && relPosix.split("/").length === 1) return true;
  return false;
}

function copyRoutes(srcDir, destDir, rel = "") {
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    if (SKIP_DIRS.has(name)) continue;
    const srcPath = path.join(srcDir, name);
    const destPath = path.join(destDir, name);
    const relPath = rel ? `${rel}/${name}` : name;
    const relPosix = relPath.replace(/\\/g, "/");
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      if (shouldSkipRoute(relPosix)) continue;
      copyRoutes(srcPath, destPath, relPath);
      continue;
    }

    if (!/\.(tsx?|css|json)$/.test(name)) continue;
    if (shouldSkipFile(relPosix)) continue;
    if (shouldSkipRoute(relPosix)) continue;

    const raw = fs.readFileSync(srcPath, "utf8");
    fs.writeFileSync(destPath, rewriteContent(raw), "utf8");
  }
}

/** Remove shop routes that will be replaced (keep shop layout + customer globals import). */
function cleanShopAppExceptLayout() {
  if (!fs.existsSync(shopApp)) fs.mkdirSync(shopApp, { recursive: true });
  for (const name of fs.readdirSync(shopApp)) {
    if (
      name === "layout.tsx" ||
      name === "customer-globals.css" ||
      name === "shop-branding-overrides.css"
    ) {
      continue;
    }
    if (name === "subscriptions") {
      const subDir = path.join(shopApp, "subscriptions");
      if (fs.existsSync(subDir)) {
        for (const child of fs.readdirSync(subDir)) {
          if (child === "page.tsx") continue;
          fs.rmSync(path.join(subDir, child), { recursive: true, force: true });
        }
      }
      continue;
    }
    fs.rmSync(path.join(shopApp, name), { recursive: true, force: true });
  }
}

console.log("Syncing next-frontend app routes → src/app/(shop)/ …");
cleanShopAppExceptLayout();
copyRoutes(customerApp, shopApp);
console.log("Done.");
