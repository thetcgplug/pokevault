# PokéVault 🃏

A modern, dark-themed storefront for reselling **sealed Pokémon product** and **graded slabs**, with **crypto checkout** (BTC / ETH / USDC). Zero dependencies — just Node — so it deploys to Railway in about two minutes.

---

## What's inside

```
pokevault/
├─ server.js            # Zero-dependency Node server (static site + JSON API)
├─ package.json         # start script + Node engine
├─ data/products.json   # Your inventory — edit this to change listings
├─ public/
│  ├─ index.html        # Storefront markup
│  ├─ styles.css        # Modern sleek dark theme
│  └─ app.js            # Cart + crypto checkout logic
├─ .env.example         # Copy to .env and add your wallet addresses
├─ .gitignore
└─ README.md
```

No build step, no `npm install` — the server uses only Node's built-in modules.

---

## Run it locally (optional)

You need [Node 18+](https://nodejs.org). From this folder:

```bash
STORE_NAME="PokéVault" \
BTC_ADDRESS="your-btc-address" \
ETH_ADDRESS="your-eth-address" \
USDC_ADDRESS="your-usdc-address" \
node server.js
```

Then open http://localhost:3000

---

## Deploy: GitHub → Railway

You said you don't have accounts yet — here's the whole path, start to finish.

### 1. Create a GitHub account & repo
1. Go to https://github.com and sign up (free).
2. Click the **+** (top right) → **New repository**.
3. Name it `pokevault`, keep it **Public** or Private, and **don't** add a README (we already have one). Click **Create repository**.

### 2. Push this code to GitHub
Install [Git](https://git-scm.com/downloads) if you don't have it, then from this folder run:

```bash
git init
git add .
git commit -m "Initial commit — PokéVault storefront"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/pokevault.git
git push -u origin main
```

(GitHub will prompt you to log in — use a Personal Access Token if asked; GitHub shows a link to create one.)

> Prefer no command line? On the new repo page, click **uploading an existing file** and drag every file/folder from this project into the browser.

### 3. Create a Railway account & deploy
1. Go to https://railway.app and **Login with GitHub** (easiest — links the accounts automatically).
2. Click **New Project** → **Deploy from GitHub repo** → pick **pokevault**.
3. Railway auto-detects Node and runs `npm start`. First deploy takes ~1–2 min.
4. When it's live, open **Settings → Networking → Generate Domain** to get your public URL (e.g. `pokevault-production.up.railway.app`).

### 4. Add your crypto wallet addresses ⚠️ IMPORTANT
Until you do this, checkout shows placeholder addresses and **you won't receive payments.**

In Railway: open your service → **Variables** tab → **New Variable**, and add each of these with **your real wallet addresses**:

| Variable        | Value (example)                    |
|-----------------|------------------------------------|
| `STORE_NAME`    | PokéVault                          |
| `SUPPORT_EMAIL` | you@youremail.com                  |
| `BTC_ADDRESS`   | bc1q...your real BTC address       |
| `ETH_ADDRESS`   | 0x...your real ETH address         |
| `USDC_ADDRESS`  | 0x...your real USDC address (ERC-20)|

Railway redeploys automatically when you save. Done — the QR codes and addresses at checkout now point to your wallets.

---

## Editing your inventory

Open `data/products.json`. Each listing looks like:

```json
{
  "id": "unique-slug",
  "name": "Charizard — Base Set — PSA 9",
  "category": "slab",           // "slab" or "sealed"
  "set": "Base Set (1999) #4",
  "condition": "PSA 9 Mint",
  "price": 4200.00,             // USD
  "stock": 1,
  "emoji": "🔥",                 // shown as the product art
  "accent": "#ff7a2f",          // card glow color
  "description": "..."
}
```

Add, remove, or edit entries, commit, and push — Railway redeploys on every push to `main`.

---

## How payments work

This is a **crypto storefront**, not a hosted payment gateway. At checkout the buyer sees your wallet address + a QR code and sends the USD-equivalent in their chosen coin. When they click *"I've sent payment,"* the site records the order (with a reference number) and their email + shipping address. Orders are logged server-side in `orders.log` and printed to Railway's deploy logs.

**Your process:** when an order comes in, verify the incoming transaction on-chain (a block explorer, or your wallet), then ship. This keeps things simple and free — no processor accounts or fees. If you later want automated payment verification, a service like Coinbase Commerce or NOWPayments can be added.

> ⚠️ Note: crypto prices move. The site charges the USD amount and asks buyers to send the equivalent — for large slabs you may want to confirm the exact coin amount with the buyer by email before shipping.

---

## Legal / housekeeping

Not affiliated with Nintendo, Game Freak, or The Pokémon Company. Make sure your reselling complies with your local tax and consumer-protection rules, and consider adding Terms and a Privacy page before taking real orders.
