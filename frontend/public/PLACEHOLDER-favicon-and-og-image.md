# Favicon PNGs — manual production required

Chunk 33 shipped the SVG favicon (`favicon.svg`), the OG card (`og-image.png`,
added by the project owner), and the full meta-tag suite in
`frontend/index.html`. The following PNG favicon variants still need to be
produced manually before launch — they could not be generated as binary images
from this chunk.

| Filename                  | Size      | Purpose                              |
| ------------------------- | --------- | ------------------------------------ |
| `favicon-32.png`          | 32×32     | Modern browsers; tab icon            |
| `favicon-16.png`          | 16×16     | Legacy browsers; small tab icon      |
| `apple-touch-icon.png`    | 180×180   | iOS home screen                      |

## Quick path

The fastest way to produce these:

1. Open Figma, Canva, or any design tool you have.
2. A dark rounded square (`#0c0a09`, the `--foreground` token) with the
   buildmap M-mark stroked in `#fafaf9` (the `--background` token) — exactly
   what `BrandMark.tsx` renders in the sidebar header and what
   `frontend/public/favicon.svg` ships in this chunk. Export at 32×32, 16×16,
   and 180×180. The easiest path is to open `favicon.svg` in Figma/Illustrator
   and export the raster sizes from there so the PNGs match the SVG pixel for
   pixel.
3. Save all files into `frontend/public/`.
4. Delete this `PLACEHOLDER-favicon-and-og-image.md` file once the real images
   are in place.

## Verification

After producing the files, verify locally:

- `npm run build && npm run preview` — open `http://localhost:4173` and confirm
  the favicon appears in the tab.
- Paste your production URL into a Slack DM to yourself after deploying to
  verify the OG image preview renders.
- Use https://www.opengraph.xyz/ to debug the link preview without spamming
  chat apps.

## Note on og-image.png

The shipped `og-image.png` is 1731×909 (aspect ratio 1.904) — virtually
identical to the OG spec's 1200×630 (1.905), so social scrapers will render it
correctly. File size is ~1.0 MB. Most scrapers handle this fine, but if you hit
a debugger that rejects oversized images or want faster first-scrape latency,
re-export at 1200×630 to drop under ~200 KB.
