// PokéVault — zero-dependency Node server (no npm install required).
// Flat single-folder layout so it uploads cleanly to GitHub. Deploys instantly on Railway.
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products.json"), "utf-8")
);

const storeConfig = {
  storeName: process.env.STORE_NAME || "PokéVault",
  supportEmail: process.env.SUPPORT_EMAIL || "support@example.com",
  wallets: {
    BTC: process.env.BTC_ADDRESS || "bc1q-set-your-btc-address-in-env",
    ETH: process.env.ETH_ADDRESS || "0x-set-your-eth-address-in-env",
    USDC: process.env.USDC_ADDRESS || "0x-set-your-usdc-address-in-env",
  },
};

// Only these files are served as static assets (keeps source/logs private).
const STATIC = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8" },
  "/styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
  "/app.js": { file: "app.js", type: "text/javascript; charset=utf-8" },
};

function sendJSON(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "GET" && url === "/healthz") { res.writeHead(200); return res.end("ok"); }
  if (req.method === "GET" && url === "/api/config") return sendJSON(res, 200, storeConfig);
  if (req.method === "GET" && url === "/api/products") return sendJSON(res, 200, products);

  if (req.method === "GET" && url.startsWith("/api/products/")) {
    const id = url.split("/").pop();
    const p = products.find((x) => x.id === id);
    return p ? sendJSON(res, 200, p) : sendJSON(res, 404, { error: "Not found" });
  }

  if (req.method === "POST" && url === "/api/orders") {
    const { items, contact, coin } = await readBody(req);
    if (!Array.isArray(items) || items.length === 0)
      return sendJSON(res, 400, { error: "Cart is empty." });
    if (!contact || !contact.email)
      return sendJSON(res, 400, { error: "A contact email is required." });

    const ref = "PV-" + Date.now().toString(36).toUpperCase();
    const record = { ref, createdAt: new Date().toISOString(), coin: coin || "unspecified", contact, items };
    try { fs.appendFileSync(path.join(__dirname, "orders.log"), JSON.stringify(record) + "\n"); }
    catch (e) { console.error("Failed to log order:", e.message); }
    console.log("New order:", ref, contact.email);
    return sendJSON(res, 200, { ok: true, ref });
  }

  if (req.method === "GET" && STATIC[url]) {
    const { file, type } = STATIC[url];
    return fs.readFile(path.join(__dirname, file), (err, buf) => {
      if (err) { res.writeHead(404); return res.end("Not found"); }
      res.writeHead(200, { "Content-Type": type });
      res.end(buf);
    });
  }

  res.writeHead(404, { "Content-Type": "text/html" });
  res.end("<h1>404 — Not found</h1>");
});

server.listen(PORT, () => console.log(`${storeConfig.storeName} running on port ${PORT}`));
