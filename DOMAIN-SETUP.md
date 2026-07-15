# Connecting thetcgplug.com to your store

Your Railway app already has the custom domain **thetcgplug.com** added — it's just waiting for DNS. Once you register the domain and add the two records below, the store will go live at https://thetcgplug.com (Railway auto-issues the SSL certificate).

---

## Step 1 — Register thetcgplug.com on Cloudflare

1. Go to https://dash.cloudflare.com/sign-up and create a free account (verify your email).
2. In the left sidebar, click **Domain Registration → Register Domains**.
3. Search **thetcgplug.com**. If available (~$10–11/yr, at cost), add to cart and complete checkout with your payment method.
   - *(I can't make the purchase for you — this step is yours.)*
4. After purchase, Cloudflare automatically creates a DNS zone for the domain.

---

## Step 2 — Add these two DNS records in Cloudflare

Open your domain in Cloudflare → **DNS → Records → + Add record**, and add BOTH:

### Record 1 — CNAME (points the site at Railway)
| Field | Value |
|-------|-------|
| Type | `CNAME` |
| Name | `@` |
| Target | `pvmxp0pq.up.railway.app` |
| Proxy status | **DNS only** (grey cloud — click the orange cloud to turn it grey) |
| TTL | Auto |

> ⚠️ Set proxy to **DNS only (grey cloud)**. If it's proxied (orange), Railway's SSL can fail. Grey cloud lets Railway handle HTTPS directly.

### Record 2 — TXT (verifies you own the domain)
| Field | Value |
|-------|-------|
| Type | `TXT` |
| Name | `_railway-verify` |
| Content | `railway-verify=a12a1b315c0e771d77b2e9726db5b020b678ec5185d1ba6bc08849cb75cc077b` |
| TTL | Auto |

Save both.

---

## Step 3 — Wait for verification

DNS usually propagates within a few minutes (up to ~1 hour). Railway automatically detects the records, verifies the domain, and issues an SSL certificate. When the yellow "Waiting for DNS update" warning in Railway turns to a green check, **https://thetcgplug.com** is live.

---

## Optional — www redirect

Your current plan is at its custom-domain limit, so `www.thetcgplug.com` isn't added in Railway. If you want `www` to work too, in Cloudflare go to **Rules → Redirect Rules** and create a rule redirecting `www.thetcgplug.com/*` → `https://thetcgplug.com/$1`. (No Railway change needed.)

---

### Your DNS records at a glance
```
CNAME  @                 pvmxp0pq.up.railway.app        (DNS only / grey cloud)
TXT    _railway-verify   railway-verify=a12a1b315c0e771d77b2e9726db5b020b678ec5185d1ba6bc08849cb75cc077b
```
