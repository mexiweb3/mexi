# mexi
Meximalist

## Catálogo monos.sol — obra digital de Daniel Serna sobre Solana

Compilación impresa en PDF de las obras NFT alojadas en la wallet
[`monos.sol`](https://www.danielserna.com/) (Solana mainnet,
`APc8i4qrxUihYW1kCMjnL8aR2ycoNKrS2eQomERo5jpP`).

El PDF emula la estética de catálogo de galería que utiliza Daniel Serna en
[danielserna.com](https://www.danielserna.com): papel crema, tipografía serif
(EB Garamond) con acento terracota, planchas numeradas y huella criptográfica
de cada obra como pie de foto.

### Entregable

- `dist/monos-sol-catalogo.pdf` — catálogo final (49 páginas A4, 89 obras).

### Estructura

- `data/monos-sol-nfts.json` — listado normalizado (nombre, imagen, mint).
- `build/images/<mint>.jpg` — imágenes descargadas y normalizadas.
- `scripts/fetch_nfts.py` — resuelve `monos.sol` vía SNS y baja el listado de
  Magic Eden.
- `scripts/fetch_images.py` — baja todas las imágenes (Arweave / IPFS) con
  fallback de gateways y las normaliza a JPEG 900 px.
- `scripts/build_pdf.py` — genera el HTML y el PDF con WeasyPrint.

### Reproducir

```bash
pip install requests pillow weasyprint
python3 scripts/fetch_nfts.py
python3 scripts/fetch_images.py
python3 scripts/build_pdf.py
```

El PDF queda en `dist/monos-sol-catalogo.pdf`.

> Este catálogo es un homenaje editorial al trabajo de Daniel Serna Garza y
> no sustituye, ni pretende suplantar, la obra original ni los derechos de
> autor que la acompañan.
