# Favicon and OG image — manual production required

Chunk 33 shipped the SVG favicon (`favicon.svg`) and the full meta-tag suite in
`frontend/index.html`. The following PNG files still need to be produced manually
before launch — they could not be generated as binary images from this chunk.

| Filename                  | Size      | Purpose                              |
| ------------------------- | --------- | ------------------------------------ |
| `favicon-32.png`          | 32×32     | Modern browsers; tab icon            |
| `favicon-16.png`          | 16×16     | Legacy browsers; small tab icon      |
| `apple-touch-icon.png`    | 180×180   | iOS home screen                      |
| `og-image.png`            | 1200×630  | Social share preview card            |

## Quick path

The fastest way to produce these:

1. Open Figma, Canva, or any design tool you have.
2. For the favicons: a dark rounded square (`#0c0a09`, the `--foreground` token)
   with the buildmap M-mark stroked in `#fafaf9` (the `--background` token) —
   exactly what `BrandMark.tsx` renders in the sidebar header and what
   `frontend/public/favicon.svg` ships in this chunk. Export at 32×32, 16×16,
   and 180×180. The easiest path is to open `favicon.svg` in Figma/Illustrator
   and export the raster sizes from there so the PNGs match the SVG pixel for
   pixel.
3. For the OG image: a 1200×630 canvas with
   - `#0c0a09` background (matches the favicon and the BrandMark badge).
   - The `buildmap` wordmark in `#fafaf9`, centered or top-left.
   - The tagline `Plan the project so the agent can ship it.` below the wordmark.
   - A subtle grid pattern in the background (optional; matches the landing page hero).
4. Save all files into `frontend/public/`.
5. Delete this `PLACEHOLDER-favicon-and-og-image.md` file once the real images
   are in place.

## Verification

After producing the files, verify locally:

- `npm run build && npm run preview` — open `http://localhost:4173` and confirm
  the favicon appears in the tab.
- Paste your production URL into a Slack DM to yourself after deploying to
  verify the OG image preview renders.
- Use https://www.opengraph.xyz/ to debug the link preview without spamming
  chat apps.
