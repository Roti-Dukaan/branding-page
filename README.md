# Roti Dukaan — Branding Page

Marketing landing page for Roti Dukaan, built with Next.js (App Router), TypeScript and Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start
```

## Structure

- `src/app` — layout, global theme (colours, fonts, animations) and the page entry.
- `src/components` — one component per page section (`Hero`, `FeatureStrip`, `MadeWithCare`, `HowItWorks`, `WholesomeMeals`, `DownloadApp`, `Footer`) plus shared UI in `ui.tsx`.
- `src/lib/site.ts` — navigation, store and social links.
- `public/images` — web-ready artwork.

## Assets

The artwork in `public/images` is generated from the raw exports in `../brandingpage assets`. The script crops off sheet labels and neighbouring art that bled into the exports:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/prepare-assets.ps1 -Source "<path to brandingpage assets>"
```

## Share links (mobile app & WhatsApp)

Production domain **www.rotidukaan.com** is this repo (marketing + share landings), not `next-frontend`.

| Path | Purpose |
| --- | --- |
| `/menu/[slug]` | Product preview from API + “Open in app” / Play Store |
| `/subscriptions/[id]` | Meal plan preview + app CTAs |
| `/privacy-policy` | Privacy policy (same copy as next-frontend) |
| `/contact` | Contact form + FAQs |

The customer app shares `https://www.rotidukaan.com/menu/...` and `/subscriptions/...`. Deploy this project to Vercel for those URLs to work.

Set `NEXT_PUBLIC_API_URL=https://api.rotidukaan.com` in Vercel **Production**.

Full ordering site: `next-frontend` (e.g. `user-dev.rotidukaan.com`).

## Configuration

Optional environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for Open Graph metadata |
| `NEXT_PUBLIC_API_URL` | Roti Dukaan API for share landing pages |
| `NEXT_PUBLIC_PLAY_STORE_URL` | Google Play listing (defaults to `com.rotidukaan.user`) |
| `NEXT_PUBLIC_APP_STORE_URL` | App Store listing |
| `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_YOUTUBE_URL` | Social profile links |
