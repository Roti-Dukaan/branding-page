/**
 * Vercel/CI: populate gitignored src/shop before `next build`.
 * Clones next-frontend if the monorepo sibling folder is missing.
 * Does NOT run sync-shop-app-routes (would overwrite branding-owned routes).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandingRoot = path.join(__dirname, "..");
const shopMarker = path.join(brandingRoot, "src", "shop", "components", "MenuPage.tsx");

if (fs.existsSync(shopMarker)) {
  console.log("ensure-shop: src/shop already present");
  process.exit(0);
}

function resolveNextFrontendRoot() {
  const fromEnv = process.env.NEXT_FRONTEND_ROOT?.trim();
  if (fromEnv && fs.existsSync(path.join(fromEnv, "src"))) {
    return fromEnv;
  }

  const sibling = path.join(brandingRoot, "..", "next-frontend");
  if (fs.existsSync(path.join(sibling, "src"))) {
    return sibling;
  }

  const cacheDir = path.join(brandingRoot, ".cache", "next-frontend");
  const branch = process.env.NEXT_FRONTEND_BRANCH || "development";
  const repo =
    process.env.NEXT_FRONTEND_REPO || "https://github.com/Roti-Dukaan/next-frontend.git";

  if (!fs.existsSync(path.join(cacheDir, "src"))) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(cacheDir), { recursive: true });
    console.log(`ensure-shop: cloning ${repo} (branch ${branch})…`);
    execSync(`git clone --depth 1 --branch "${branch}" "${repo}" "${cacheDir}"`, {
      stdio: "inherit",
    });
  }

  return cacheDir;
}

const nextRoot = resolveNextFrontendRoot();
console.log("ensure-shop: syncing from", nextRoot);

execSync("node scripts/sync-shop-from-customer-web.mjs", {
  cwd: brandingRoot,
  stdio: "inherit",
  env: { ...process.env, NEXT_FRONTEND_ROOT: nextRoot },
});

console.log("ensure-shop: done");
