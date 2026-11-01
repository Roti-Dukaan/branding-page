# Local web ordering on the branding site

Full **next-frontend** customer experience on the same origin (`/menu`, cart, checkout, profile, subscriptions, orders). UI is synced from `next-frontend` — not restyled.

## One-time setup

```bash
cd branding-page
npm install
npm run sync:shop
```

That also copies shop static files from next-frontend (e.g. `public/auth/login-brand.png` for the sign-in modal).

Create `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://backend-dev.rotidukaan.com
NEXT_PUBLIC_SHOW_DEV_OTP=true
# Razorpay (same keys as next-frontend if testing payments)
# NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

## Run

```bash
npm run dev
```

If styles look unstyled (bullet lists, no layout), the shop sync was loading **two** Tailwind bundles. Re-run `npm run sync:shop`, then clear cache and restart:

```bash
Remove-Item -Recurse -Force .next   # PowerShell
npm run dev
```

- Marketing home: **http://localhost:3000/**
- Order flow: **http://localhost:3000/menu** (sign in via navbar, cart, checkout)

After **next-frontend** changes:

```bash
npm run sync:shop
```

## Architecture

| Path | Role |
|------|------|
| `src/shop/` | Synced copy of `next-frontend/src` (components, features, lib…) — **gitignored** |
| `src/app/(shop)/` | Synced app routes + `layout.tsx` (customer Navbar/Footer/theme) |
| `src/app/` (outside shop) | Marketing, legal, contact, invite |

## Notes

- **Do not push** until you have tested locally and decided to ship.
- `subscriptions/[id]` uses the full customer package page (share-only landing removed to avoid route clash).
- Shop CSS is loaded on shop routes only (`customer-globals.css`); visiting `/menu` applies next-frontend tokens.
