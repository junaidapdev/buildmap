

| Filename                  | Size      | Purpose                              |
| ------------------------- | --------- | ------------------------------------ |
| `favicon-32.png`          | 32×32     | Modern browsers; tab icon            |
| `favicon-16.png`          | 16×16     | Legacy browsers; small tab icon      |
| `apple-touch-icon.png`    | 180×180   | iOS home screen                      |


## Quick path

The fastest way to produce these:

1. Open Figma, Canva, or any design tool you have.

   `frontend/public/favicon.svg` ships in this chunk. Export at 32×32, 16×16,
   and 180×180. The easiest path is to open `favicon.svg` in Figma/Illustrator
   and export the raster sizes from there so the PNGs match the SVG pixel for
   pixel.

   are in place.

## Verification

After producing the files, verify locally:

- `npm run build && npm run preview` — open `http://localhost:4173` and confirm
  the favicon appears in the tab.
- Paste your production URL into a Slack DM to yourself after deploying to
  verify the OG image preview renders.
- Use https://www.opengraph.xyz/ to debug the link preview without spamming
  chat apps.

