# CLAUDE.md — PokéVault project guide

> This file is written for a **beginner coder**. It explains what this project is, how it's
> put together, what already works, and what to build next. If you're using Claude Code,
> start by reading this whole file — it's the map of the project.

---

## 1. What this project is

**PokéVault** is a website (an online store) for reselling Pokémon trading-card products:
sealed boxes (like Booster Boxes and Elite Trainer Boxes) and **graded slabs** (single cards
sealed in a plastic case with a grade like "PSA 10").

Customers browse products, add them to a cart, and check out by paying in **cryptocurrency**
(Bitcoin, USDT, USDC, or Solana). The site shows the buyer a wallet address + QR code, records
the order, and emails you the details. It does **not** charge cards or auto-verify payments —
you confirm the crypto arrived, then ship. This keeps it simple and free of payment-processor
fees.

The live site (temporary URL): **https://pokevault-production-b32c.up.railway.app**
Custom domain (finishing DNS setup): **https://thetcgplug.org**

---

## 2. The tech, in plain English

This is a **very simple** project on purpose. There is **no database** and **no build step**.

- **Node.js** runs the website's server. Node is just "JavaScript that runs on a server
  instead of in a browser."
- The server (`server.js`) uses **only Node's built-in tools** — there are **no installed
  packages** (no `npm install` needed). That's why it deploys in seconds.
- The product list is a plain text file (`products.json`), not a database.
- The front end (what people see) is plain **HTML + CSS + JavaScript** — no React, no
  frameworks.

> ⚠️ Important: There is **NO Supabase and NO database** in this project. Product data lives
> in a JSON file. Orders are written to a log file on the server. If you ever want real user
> accounts, saved orders, or inventory that survives restarts, *that's* when you'd add a
> database (see "Next steps").

---

## 3. Project structure (every file, flat — no folders)

```
pokevault/
├─ server.js        # The web server. Serves the pages + a small API. Reads products.json.
├─ index.html       # The storefront page (structure/markup).
├─ styles.css       # All the styling (dark theme, layout, cards).
├─ app.js           # Browser code: loads products, cart, checkout, and the SVG product art.
├─ products.json    # YOUR INVENTORY. Edit this to add/remove/price products.
├─ package.json     # Tells Node how to start the app ("npm start" → node server.js).
├─ .env.example     # A template listing the settings the app expects (no real secrets).
├─ .gitignore       # Files Git should ignore (node_modules, .env, orders.log).
├─ README.md        # Quick project readme.
├─ CLAUDE.md        # This file.
└─ DOMAIN-SETUP.md  # Notes on the custom-domain DNS setup.
```

There are no `public/` or `data/` subfolders — everything sits at the root. `server.js` only
serves `index.html`, `styles.css`, and `app.js` as static files (so source files and logs
stay private).

---

## 4. How the pieces talk to each other

1. A visitor opens the site. `index.html` loads `styles.css` and `app.js`.
2. `app.js` calls the server's API:
   - `GET /api/products` → the full product list (from `products.json`).
   - `GET /api/config` → the store name, support email, and crypto wallet addresses.
3. The visitor adds items to the cart (kept in the browser). At checkout, `app.js` shows the
   wallet address + QR code for the chosen coin.
4. When they click "I've sent payment," `app.js` calls `POST /api/orders`. The server writes
   the order to `orders.log` and returns a reference number.

That's the whole app. Small and understandable on purpose.

---

## 5. Services this project depends on

| Service | What it's for (plain English) | Where you manage it |
|---|---|---|
| **GitHub** | Stores the code and its history. This is the "source of truth." | github.com/thetcgplug/pokevault |
| **Railway** | Runs the website on the internet (the "host"). It watches GitHub and **auto-redeploys every time you push to the `main` branch.** Also stores the app's settings/secrets. | railway.com dashboard → project "grateful-presence" → service "pokevault" |
| **Cloudflare** | Where the domain **thetcgplug.org** is registered, and where its DNS records point the domain at Railway. | dash.cloudflare.com → thetcgplug.org |

There is **no Supabase, no Stripe, no external database, and no other API** wired into the
app right now. The only "backend" is Railway running `server.js`.

---

## 6. Environment variables / secrets (names only — no values here)

These are configured in **Railway → pokevault service → "Variables" tab.** The app reads them
at startup (see the top of `server.js`). None of them are printed in the code or in Git.

| Variable | What it is | Where it lives | Required? |
|---|---|---|---|
| `SUPPORT_EMAIL` | Contact email shown in the site footer | Railway → Variables | Set ✅ |
| `BTC_ADDRESS` | Bitcoin wallet address buyers pay to | Railway → Variables | Set ✅ |
| `USDT_ADDRESS` | Tether (ERC-20) wallet address | Railway → Variables | Set ✅ |
| `USDC_ADDRESS` | USD Coin (ERC-20) wallet address | Railway → Variables | Set ✅ |
| `SOL_ADDRESS` | Solana wallet address | Railway → Variables | Set ✅ |
| `STORE_NAME` | Store name (defaults to "PokéVault" if unset) | Railway → Variables | Optional (not set; using default) |
| `PORT` | Which port the server listens on | **Set automatically by Railway** — do not set by hand | Auto |

Notes for a beginner:
- These crypto **wallet addresses are "receiving" addresses** — they're not passwords, but
  treat them carefully: if a wrong address is entered, payments go to the wrong place.
- The **Cloudflare** and **Railway** account logins themselves are your most sensitive
  secrets. They are not stored in the project; they live only in your head / password manager.
- `.env.example` lists these names as a template. For **local** testing you'd copy it to a
  file named `.env` and fill in values, but `.env` is git-ignored so it never gets committed.

---

## 7. What's built and working so far

- ✅ Full storefront UI: hero, product grid, category filters (All / Sealed / Graded Slabs),
  "why us" trust section, footer.
- ✅ Cart (add/remove/quantity) and a crypto checkout flow with wallet address + QR code for
  BTC, USDT, USDC, SOL.
- ✅ Order submission endpoint that records orders and returns a reference number.
- ✅ 48 products in `products.json` (real sets: Ascended Heroes, Prismatic Evolutions, vintage
  slabs, high-end grails, etc.) with stock levels.
- ✅ Designed **SVG product graphics** (distinct sealed-box vs graded-slab art) generated in
  `app.js` — no external images, so nothing can break or raise copyright issues.
- ✅ Deployed on Railway with auto-deploy from GitHub `main`.
- ✅ Wallet addresses + support email configured in Railway.

---

## 8. What's in progress

- 🔧 **Custom domain (thetcgplug.org).** Added in Railway and DNS records created in
  Cloudflare (CNAME + TXT, set to "DNS only"). Waiting for Railway to verify and issue the SSL
  certificate — after that, https://thetcgplug.org serves the store. See `DOMAIN-SETUP.md`.

---

## 9. Suggested next steps (roughly easiest → hardest)

1. **Product photos.** `app.js` already supports an optional `"image": "https://..."` field on
   any product in `products.json`. Add your own photos of your inventory and each card shows
   the photo instead of the designed graphic. (Use your own photos, not scraped ones.)
2. **Set real prices.** The prices in `products.json` are sensible placeholders — update them
   to your actual asking prices.
3. **`www` redirect.** Make `www.thetcgplug.org` redirect to the root domain (a free Cloudflare
   "Redirect Rule").
4. **Terms & Privacy pages.** Add simple pages before taking real orders.
5. **Email notifications on new orders.** Right now orders only go to `orders.log` + Railway
   logs. Add an email service (e.g. Resend) so you get an email when an order comes in. This is
   the first step that needs an external API key (which would become a new Railway variable).
6. **A real database + admin.** If you outgrow the JSON file (want inventory that updates from
   an admin page, saved order history, etc.), add a database. **This is where Supabase would
   come in** — it's a beginner-friendly hosted Postgres database. Not needed yet.

---

## 10. How to work on this with Claude Code (no manual file handling)

- **Everything lives in GitHub.** Open/clone `https://github.com/thetcgplug/pokevault` in
  Claude Code and you have the whole project. There are no files stuck elsewhere.
- **To deploy a change:** edit files, commit, and push to the `main` branch. Railway sees the
  push and **redeploys automatically** — you don't touch Railway to deploy.
- **To change what settings/secrets the app uses:** that's done in the Railway dashboard
  (Variables tab), not in the code.
- **To test locally** (optional): from the project folder run
  `SUPPORT_EMAIL=you@x.com BTC_ADDRESS=... USDT_ADDRESS=... USDC_ADDRESS=... SOL_ADDRESS=... node server.js`
  then open http://localhost:3000. No `npm install` needed.

Welcome, and have fun building. 🃏
