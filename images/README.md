# Product photos

Drop your own inventory photos here and they show up automatically — no code changes.

## How it works

Name each photo after the product's `id` from `products.json`, using any of these
extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`.

Example — this product in `products.json`:

```json
{ "id": "ascended-heroes-etb", "name": "Mega Evolution — Ascended Heroes Elite Trainer Box", ... }
```

…gets its photo by saving a file here named:

```
ascended-heroes-etb.jpg
```

The server lists what's in this folder at `/api/images`, and the storefront swaps the
designed SVG for your photo wherever a matching file exists. Products without a photo keep
the generated art, so you can add pictures gradually.

## Tips

- **Use your own photos.** Photograph your actual sealed boxes / slabs. Don't use images
  scraped from Google, retailers, PSA, or The Pokémon Company — that's copyrighted.
- **Square-ish crops look best** — the card image area is roughly 255×175. A centered
  product on a clean background works well.
- **Keep files reasonably small** (aim for under ~300 KB each) so pages load fast. JPG or
  WebP are good choices.
- To find a product's exact `id`, open `products.json` and look at its `"id"` field.

## Optional: external URLs instead

If you'd rather host a photo elsewhere, add an `"image": "https://…"` field to that product
in `products.json`. An explicit `image` URL takes priority over a file in this folder.
