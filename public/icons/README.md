# Pianitos PWA icons

This folder contains the SVG icons used by `public/manifest.webmanifest`.

## Status

- `icon-192.svg`, `icon-512.svg`, `icon-maskable-512.svg` are production-ready SVG fallbacks. They are referenced by the manifest with `type: "image/svg+xml"` so installable PWA support works today on browsers that accept SVG icons (Chromium-based browsers and modern Safari).
- The manifest **also** references `icon-192.png` and `icon-512.png`. These raster files do **not** yet exist in the repo and **must be generated and committed before public launch** to maximize compatibility with all install prompts and OS-level icon caches.

## How to generate the PNGs

Use any of the following before launch:

```bash
# With librsvg
rsvg-convert -w 192 -h 192 icon-192.svg > icon-192.png
rsvg-convert -w 512 -h 512 icon-512.svg > icon-512.png

# Or with ImageMagick
magick -background none -resize 192x192 icon-192.svg icon-192.png
magick -background none -resize 512x512 icon-512.svg icon-512.png
```

Optionally also export `icon-maskable-512.png` and add it to the manifest with `purpose: "maskable"`.

## Brand

Background: `#ffb01f` (brand-400). Foreground: white piano keys + black key + white note.
