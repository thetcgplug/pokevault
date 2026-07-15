# PokéVault 🃏

A modern, dark-themed storefront for reselling **sealed Pokémon product** and **graded slabs**,
with **crypto checkout** (BTC / USDT / USDC / SOL). Zero dependencies — just Node — so it
deploys to Railway in seconds.

> New here or picking this up in Claude Code? **Read [`CLAUDE.md`](./CLAUDE.md) first** — it's a
> beginner-friendly, full explanation of the project, services, secrets, and next steps.

Live site: https://pokevault-production-b32c.up.railway.app
Custom domain (DNS finishing): https://thetcgplug.org

---

## Files (flat — no subfolders)

```
server.js       Zero-dependency Node server (serves the site + a small JSON API)
index.html      Storefront page
styles.css      Dark theme styling
app.js          Cart, crypto checkout, and the SVG product art
products.json   Your inventory — edit this to change listings
package.json    Start script ("npm start" → node server.js)
.env.example    Template of the settings the app expects
CLAUDE.md       Full project guide (start here)
DOMAIN-SETUP.md Custom-domain DNS notes
```

No build step, no `npm install` — the server uses only Node's built-in modules.

## Run locally (optional)

Node 18+ required:

```bash
SUPPORT_EMAIL="you@example.com" \
BTC_ADDRESS="your-btc-address" \
USDT_ADDRESS="your-eth-address" \
USDC_ADDRESS="your-eth-address" \
SOL_ADDRESS="your-solana-address" \
node server.js
```

Then open http://localhost:3000

## Deploying

The project is hosted on **Railway** and auto-deploys on every push to the `main` branch of
`github.com/thetcgplug/pokevault`. Settings (wallet addresses, support email) live in the
Railway **Variables** tab — see `CLAUDE.md` for the full list.

## Editing inventory

Open `products.json`. Each item:

```json
{
  "id": "unique-slug",
  "name": "Charizard — Base Set — PSA 9",
  "category": "slab",            // "slab" or "sealed"
  "set": "Base Set (1999) #4",
  "condition": "PSA 9 Mint",
  "price": 4200.00,              // USD
  "stock": 2,
  "emoji": "🔥",                  // used in the designed product art
  "accent": "#ff7a2f",           // theme color
  "description": "...",
  "image": "https://..."         // OPTIONAL: your own photo; overrides the designed art
}
```

Commit and push — Railway redeploys automatically.

## How payments work

A crypto storefront, not a hosted gateway. At checkout the buyer sees your wallet address +
QR code and sends the USD-equivalent in their chosen coin. The site records the order (with a
reference number) and the buyer's email/shipping to `orders.log`. You verify the transaction
on-chain, then ship.

## Legal

Not affiliated with Nintendo, Game Freak, or The Pokémon Company. Follow your local tax and
consumer-protection rules, and add Terms/Privacy pages before taking real orders.
