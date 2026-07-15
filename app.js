// ---------- State ----------
let PRODUCTS = [];
let CONFIG = { storeName: "PokéVault", supportEmail: "", wallets: {} };
let CART = loadCart();
let activeFilter = "all";
let activeCoin = "BTC";

// Coins accepted at checkout. `code` must match a key in the server's wallets config.
const COINS = [
  { code: "BTC", label: "Bitcoin", network: "" },
  { code: "USDT", label: "Tether", network: "ERC-20" },
  { code: "USDC", label: "USD Coin", network: "ERC-20" },
  { code: "SOL", label: "Solana", network: "" },
];

const $ = (s) => document.querySelector(s);
const money = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function loadCart() {
  try { return JSON.parse(localStorage.getItem("pv_cart") || "{}"); }
  catch { return {}; }
}
function saveCart() { localStorage.setItem("pv_cart", JSON.stringify(CART)); }

// ---------- Init ----------
async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  try {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/config"),
    ]);
    PRODUCTS = await pRes.json();
    CONFIG = await cRes.json();
  } catch (e) {
    console.error("Failed to load store data", e);
  }

  document.querySelectorAll("[data-store-name]").forEach((el) => (el.textContent = CONFIG.storeName));
  const fe = document.getElementById("footerEmail");
  if (CONFIG.supportEmail) { fe.href = "mailto:" + CONFIG.supportEmail; fe.textContent = CONFIG.supportEmail; }
  document.getElementById("statCount").textContent = PRODUCTS.length;

  renderProducts();
  renderCart();
  wireEvents();
}

// ---------- Products ----------
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const list = PRODUCTS.filter((p) => activeFilter === "all" || p.category === activeFilter);
  grid.innerHTML = list.map(cardHTML).join("");
  grid.querySelectorAll(".add-btn").forEach((btn) =>
    btn.addEventListener("click", () => addToCart(btn.dataset.id))
  );
}

function cardHTML(p) {
  const badge = p.category === "slab" ? "Graded Slab" : "Sealed";
  const stockTxt = p.stock <= 2 ? `Only ${p.stock} left` : "In stock";
  // If a real photo URL is provided on the product, use it; otherwise render designed art.
  const art = p.image
    ? `<img class="card-photo" src="${p.image}" alt="${p.name}" loading="lazy" />`
    : productArt(p);
  return `
    <article class="card">
      <div class="card-art" style="background: radial-gradient(130% 130% at 50% 0%, ${p.accent}2e, #0d0f18 72%);">
        <span class="card-badge">${badge}</span>
        <span class="card-stock">${stockTxt}</span>
        ${art}
      </div>
      <div class="card-body">
        <span class="card-set">${p.set}</span>
        <span class="card-name">${p.name}</span>
        <span class="card-cond">${p.condition}</span>
        <div class="card-foot">
          <span class="card-price">${money(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`;
}

// ---------- Designed product art (no external images / no copyright issues) ----------
function gradeLabel(p) {
  const m = (p.condition || "").match(/^(PSA|CGC|BGS|SGC)\s*[0-9.]+/i);
  return m ? m[0].toUpperCase() : "GRADED";
}
function setInitials(p) {
  const core = (p.set || "").replace(/\(.*?\)/g, "").replace(/[:#].*$/, "");
  const words = core.split(/[\s&]+/).filter((w) => /[A-Za-z0-9]/.test(w));
  const letters = words.map((w) => w[0]).join("").toUpperCase().slice(0, 4);
  return letters || "TCG";
}
function pokeball(cx, cy, r, stroke) {
  return `
    <g opacity="0.9">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="2"/>
      <path d="M ${cx - r} ${cy} H ${cx + r}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="#0d0f18" stroke="${stroke}" stroke-width="2"/>
    </g>`;
}

function productArt(p) {
  const a = p.accent || "#7b61ff";
  if (p.category === "slab") {
    // Graded card slab
    return `
    <svg class="card-svg" viewBox="0 0 240 175" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g-${p.id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="1" stop-color="#0d0f18"/>
        </linearGradient>
      </defs>
      <rect x="72" y="16" width="96" height="143" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)"/>
      <rect x="80" y="24" width="80" height="26" rx="5" fill="${a}"/>
      <text x="120" y="41" text-anchor="middle" font-family="Sora, sans-serif" font-weight="800" font-size="13" fill="#0d0f18">${gradeLabel(p)}</text>
      <rect x="80" y="56" width="80" height="95" rx="6" fill="url(#g-${p.id})" stroke="rgba(255,255,255,0.22)"/>
      <text x="120" y="112" text-anchor="middle" font-size="40">${p.emoji || "★"}</text>
      ${pokeball(120, 132, 11, "rgba(255,255,255,0.85)")}
    </svg>`;
  }
  // Sealed box / ETB
  return `
    <svg class="card-svg" viewBox="0 0 240 175" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g-${p.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="1" stop-color="#0d0f18"/>
        </linearGradient>
      </defs>
      <rect x="66" y="30" width="108" height="118" rx="9" fill="url(#g-${p.id})" stroke="rgba(255,255,255,0.22)"/>
      <rect x="66" y="30" width="108" height="24" rx="9" fill="rgba(255,255,255,0.14)"/>
      <path d="M66 92 h108" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="120" y="80" text-anchor="middle" font-family="Sora, sans-serif" font-weight="800" font-size="22" fill="#fff" opacity="0.95">${setInitials(p)}</text>
      <text x="120" y="120" text-anchor="middle" font-size="30">${p.emoji || "📦"}</text>
      ${pokeball(120, 138, 10, "rgba(255,255,255,0.8)")}
    </svg>`;
}

// ---------- Cart ----------
function addToCart(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  const cur = CART[id]?.qty || 0;
  if (cur >= p.stock) return;
  CART[id] = { qty: cur + 1 };
  saveCart(); renderCart(); openCart();
}
function setQty(id, delta) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!CART[id]) return;
  let q = CART[id].qty + delta;
  if (q <= 0) delete CART[id];
  else CART[id].qty = Math.min(q, p ? p.stock : q);
  saveCart(); renderCart();
}
function cartEntries() {
  return Object.entries(CART)
    .map(([id, v]) => ({ ...PRODUCTS.find((p) => p.id === id), qty: v.qty }))
    .filter((p) => p.id);
}
function cartTotal() { return cartEntries().reduce((s, p) => s + p.price * p.qty, 0); }
function cartCount() { return cartEntries().reduce((s, p) => s + p.qty, 0); }

function renderCart() {
  document.getElementById("cartCount").textContent = cartCount();
  const items = cartEntries();
  const box = document.getElementById("cartItems");
  if (!items.length) {
    box.innerHTML = `<div class="cart-empty">Your cart is empty.<br/>Add something from the vault.</div>`;
  } else {
    box.innerHTML = items.map((p) => `
      <div class="cart-line">
        <div class="cart-line-art" style="background:${p.accent}22;">${p.emoji}</div>
        <div class="cart-line-info">
          <div class="cart-line-name">${p.name}</div>
          <div class="cart-line-price">${money(p.price)}</div>
          <div class="qty">
            <button data-dec="${p.id}">−</button>
            <span>${p.qty}</span>
            <button data-inc="${p.id}">+</button>
          </div>
        </div>
      </div>`).join("");
    box.querySelectorAll("[data-inc]").forEach((b) => b.addEventListener("click", () => setQty(b.dataset.inc, 1)));
    box.querySelectorAll("[data-dec]").forEach((b) => b.addEventListener("click", () => setQty(b.dataset.dec, -1)));
  }
  document.getElementById("cartTotal").textContent = money(cartTotal());
  document.getElementById("checkoutBtn").disabled = items.length === 0;
}

// ---------- Drawer + modal ----------
function openCart() { $("#cartDrawer").classList.add("open"); $("#drawerOverlay").classList.add("open"); }
function closeCart() { $("#cartDrawer").classList.remove("open"); $("#drawerOverlay").classList.remove("open"); }
function openCheckout() { renderCheckout(); $("#checkoutModal").classList.add("open"); $("#checkoutOverlay").classList.add("open"); }
function closeCheckout() { $("#checkoutModal").classList.remove("open"); $("#checkoutOverlay").classList.remove("open"); }

// ---------- Checkout ----------
function qrURL(text) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=" + encodeURIComponent(text);
}

function renderCheckout() {
  const items = cartEntries();
  const total = cartTotal();
  const addr = (CONFIG.wallets && CONFIG.wallets[activeCoin]) || "address-not-configured";
  const coinObj = COINS.find((c) => c.code === activeCoin) || {};
  const netNote = coinObj.network
    ? `${coinObj.label} on the ${coinObj.network} network only`
    : activeCoin === "SOL"
    ? "Solana network"
    : coinObj.label || activeCoin;
  const content = $("#checkoutContent");

  content.innerHTML = `
    <h3>Checkout</h3>
    <p class="sub">Choose a coin, send the exact USD value in crypto, then confirm your order below.</p>

    <div class="coin-select" id="coinSelect">
      ${COINS.map((c) => `
        <div class="coin-opt ${c.code === activeCoin ? "active" : ""}" data-coin="${c.code}">
          ${c.code}<small>${c.label}${c.network ? " · " + c.network : ""}</small>
        </div>`).join("")}
    </div>

    <div class="pay-box">
      <div class="pay-amount">${money(total)}</div>
      <small class="note">Send the equivalent in <strong>${activeCoin}</strong> — ${netNote} — to:</small>
      <img src="${qrURL(addr)}" alt="Payment QR code" />
      <div class="pay-addr" id="payAddr">${addr}</div>
      <button class="copy-btn" id="copyAddr">Copy address</button>
    </div>

    <div class="order-summary">
      ${items.map((p) => `<div class="row"><span>${p.qty}× ${p.name}</span><span>${money(p.price * p.qty)}</span></div>`).join("")}
      <div class="row total"><span>Total</span><span>${money(total)}</span></div>
    </div>

    <div class="field" style="margin-top:18px;">
      <label>Your email (for order confirmation &amp; shipping)</label>
      <input id="buyerEmail" type="email" placeholder="you@email.com" />
    </div>
    <div class="field">
      <label>Shipping address</label>
      <input id="buyerShip" type="text" placeholder="Full name, street, city, ZIP, country" />
    </div>

    <button class="btn btn-primary btn-block" id="placeOrder">I've sent payment — place order</button>
    <p class="note">After you submit, we verify the transaction on-chain and email you a tracking number. Reference is generated instantly.</p>
  `;

  content.querySelectorAll(".coin-opt").forEach((el) =>
    el.addEventListener("click", () => { activeCoin = el.dataset.coin; renderCheckout(); })
  );
  $("#copyAddr").addEventListener("click", () => {
    navigator.clipboard?.writeText(addr);
    $("#copyAddr").textContent = "Copied ✓";
    setTimeout(() => ($("#copyAddr").textContent = "Copy address"), 1500);
  });
  $("#placeOrder").addEventListener("click", placeOrder);
}

async function placeOrder() {
  const email = $("#buyerEmail").value.trim();
  const ship = $("#buyerShip").value.trim();
  if (!email || !email.includes("@")) { $("#buyerEmail").focus(); $("#buyerEmail").style.borderColor = "var(--danger)"; return; }
  if (!ship) { $("#buyerShip").focus(); $("#buyerShip").style.borderColor = "var(--danger)"; return; }

  const items = cartEntries().map((p) => ({ id: p.id, name: p.name, price: p.price, qty: p.qty }));
  const btn = $("#placeOrder");
  btn.disabled = true; btn.textContent = "Submitting…";

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, coin: activeCoin, contact: { email, shipping: ship } }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Order failed");

    CART = {}; saveCart(); renderCart();
    $("#checkoutContent").innerHTML = `
      <div class="success">
        <div class="check">✅</div>
        <h3>Order received</h3>
        <p class="sub">Thanks! We'll confirm your ${activeCoin} payment on-chain and email shipping details to <strong>${email}</strong>.</p>
        <div class="ref">${data.ref}</div>
        <p class="note">Save this reference number for your records.</p>
        <button class="btn btn-primary btn-block" id="doneBtn" style="margin-top:18px;">Done</button>
      </div>`;
    $("#doneBtn").addEventListener("click", closeCheckout);
  } catch (e) {
    btn.disabled = false; btn.textContent = "I've sent payment — place order";
    alert("Something went wrong placing your order: " + e.message);
  }
}

// ---------- Events ----------
function wireEvents() {
  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("drawerOverlay").addEventListener("click", closeCart);
  document.getElementById("checkoutBtn").addEventListener("click", () => { closeCart(); openCheckout(); });
  document.getElementById("closeCheckout").addEventListener("click", closeCheckout);
  document.getElementById("checkoutOverlay").addEventListener("click", closeCheckout);

  document.querySelectorAll("#filters .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll("#filters .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.filter;
      renderProducts();
    })
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeCart(); closeCheckout(); }
  });
}

init();
