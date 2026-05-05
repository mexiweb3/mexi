"""
Build the printable catalog PDF for monos.sol.

Layout (gallery / catalogue raisonné aesthetic):
  - Cover (title, wallet, date, count)
  - Colophon / note
  - Index of plates
  - Plates: 2 NFTs per A4 page, large image, plate number, title, mint hash
  - Closing page

Run: python3 scripts/build_pdf.py
Output: dist/monos-sol-catalogo.pdf
"""
from __future__ import annotations
import json
import os
import sys
import unicodedata
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "monos-sol-nfts.json"
IMGDIR = ROOT / "build" / "images"
OUTDIR = ROOT / "dist"
OUTDIR.mkdir(parents=True, exist_ok=True)

WALLET = "APc8i4qrxUihYW1kCMjnL8aR2ycoNKrS2eQomERo5jpP"
DOMAIN = "monos.sol"

def fold(s: str) -> str:
    s = s.lower()
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")

def load_items():
    with open(DATA, encoding="utf-8") as f:
        items = json.load(f)
    out = []
    for it in items:
        local = IMGDIR / f"{it['mint']}.jpg"
        if local.exists() and local.stat().st_size > 1000:
            out.append({
                "name": it["name"],
                "mint": it["mint"],
                "image": str(local.resolve()),
                "image_url": it["image"],
            })
    out.sort(key=lambda x: fold(x["name"]))
    for i, it in enumerate(out, start=1):
        it["plate"] = i
    return out

def short_mint(m: str) -> str:
    return f"{m[:6]}…{m[-6:]}" if len(m) > 14 else m

def build_html(items):
    today = datetime.date.today().strftime("%d.%m.%Y")
    total = len(items)

    # Index entries: 3-column flow
    index_rows = "\n".join(
        f'<li><span class="plate-num">{it["plate"]:03d}</span><span class="plate-name">{escape(it["name"])}</span></li>'
        for it in items
    )

    # Plates: 2 per page
    plate_blocks = []
    for it in items:
        plate_blocks.append(f"""
        <figure class="plate">
          <div class="plate-frame">
            <img src="file://{it['image']}" alt="{escape(it['name'])}" />
          </div>
          <figcaption>
            <div class="cap-num">Plancha N.º {it['plate']:03d}</div>
            <h3 class="cap-title">{escape(it['name'])}</h3>
            <div class="cap-mint">mint · {short_mint(it['mint'])}</div>
          </figcaption>
        </figure>
        """)
    # Group into pages of 2
    pages = []
    for i in range(0, len(plate_blocks), 2):
        pair = plate_blocks[i:i+2]
        pages.append(f'<section class="plate-page">{"".join(pair)}</section>')
    plate_pages_html = "\n".join(pages)

    return TEMPLATE.format(
        domain=DOMAIN,
        wallet=WALLET,
        wallet_short=short_mint(WALLET),
        total=total,
        date=today,
        index=index_rows,
        plates=plate_pages_html,
    )

def escape(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;")
             .replace(">", "&gt;").replace('"', "&quot;"))

TEMPLATE = r"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Catálogo · {domain}</title>
<style>
@page {{
  size: A4;
  margin: 18mm 16mm 20mm 16mm;
  @bottom-left  {{ content: "monos.sol — catálogo de obra digital"; font: 8pt 'EB Garamond', Georgia, serif; color: #6b5a44; }}
  @bottom-right {{ content: counter(page) " / " counter(pages); font: 8pt 'EB Garamond', Georgia, serif; color: #6b5a44; }}
}}
@page :first {{ margin: 0; @bottom-left {{ content: ""; }} @bottom-right {{ content: ""; }} }}
@page cover-back {{ margin: 0; @bottom-left {{ content: ""; }} @bottom-right {{ content: ""; }} }}

@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; }}
body {{
  font-family: 'EB Garamond', 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  color: #1c150d;
  background: #f6efe1;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}}
.sans {{ font-family: 'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif; }}

/* ---------- COVER ---------- */
.cover {{
  page: cover-back;
  page-break-after: always;
  width: 210mm; height: 297mm;
  background:
    radial-gradient(120% 80% at 80% 10%, rgba(176, 74, 31, 0.08), transparent 60%),
    radial-gradient(110% 90% at 10% 100%, rgba(28, 21, 13, 0.06), transparent 60%),
    #efe4cf;
  padding: 32mm 22mm;
  position: relative;
  overflow: hidden;
}}
.cover::before {{
  content: "";
  position: absolute; left: 22mm; right: 22mm; top: 30mm; height: 1px;
  background: #1c150d;
}}
.cover::after {{
  content: "";
  position: absolute; left: 22mm; right: 22mm; bottom: 30mm; height: 1px;
  background: #1c150d;
}}
.cover .eyebrow {{
  font-family: 'Inter', sans-serif;
  font-size: 9pt; letter-spacing: .35em; text-transform: uppercase;
  color: #5a4a32; font-weight: 500;
  margin: 0 0 4mm 0;
}}
.cover h1 {{
  font-family: 'EB Garamond', serif;
  font-weight: 500;
  font-size: 88pt;
  line-height: 0.95;
  margin: 0 0 6mm 0;
  letter-spacing: -0.01em;
  color: #1c150d;
}}
.cover h1 em {{ font-style: italic; color: #b04a1f; }}
.cover .subtitle {{
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 16pt;
  color: #2b2418;
  margin: 0 0 14mm 0;
  max-width: 130mm;
}}
.cover .meta {{
  position: absolute; bottom: 36mm; left: 22mm; right: 22mm;
  display: flex; justify-content: space-between;
  font-family: 'Inter', sans-serif; font-size: 9pt;
  color: #2b2418; letter-spacing: .04em;
}}
.cover .meta dt {{ font-size: 7.5pt; letter-spacing: .25em; text-transform: uppercase; color: #6b5a44; margin-bottom: 1.5mm; }}
.cover .meta dd {{ margin: 0; font-size: 10pt; }}
.cover .meta dd.mono {{ font-family: 'JetBrains Mono', 'Menlo', monospace; font-size: 8.5pt; }}
.cover .corner {{ position: absolute; top: 18mm; right: 22mm; font-family: 'Inter', sans-serif; font-size: 8pt; letter-spacing: .35em; text-transform: uppercase; color: #6b5a44; }}
.cover .corner .dot {{ display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #b04a1f; vertical-align: middle; margin-right: 6px; }}
.cover .ornament {{
  position: absolute; left: 22mm; bottom: 70mm;
  font-family: 'EB Garamond', serif; font-style: italic; color: #6b5a44;
  font-size: 11pt;
}}

/* ---------- COLOPHON ---------- */
.colophon {{ page-break-after: always; padding-top: 8mm; }}
.colophon h2 {{
  font-family: 'EB Garamond', serif; font-weight: 500;
  font-size: 28pt; line-height: 1.05; margin: 0 0 8mm 0; color: #1c150d;
}}
.colophon h2 em {{ color: #b04a1f; font-style: italic; }}
.colophon p {{ font-size: 12pt; max-width: 145mm; margin: 0 0 4mm 0; color: #2b2418; }}
.colophon .rule {{ height: 1px; background: #1c150d; opacity: .5; margin: 10mm 0; }}
.colophon .signature {{ font-style: italic; color: #6b5a44; }}
.colophon .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 8mm; }}
.colophon .grid h4 {{ font-family: 'Inter', sans-serif; font-size: 8pt; letter-spacing: .25em;
  text-transform: uppercase; color: #6b5a44; margin: 0 0 2mm 0; font-weight: 600; }}
.colophon .grid p {{ font-size: 10.5pt; margin: 0 0 1mm 0; }}
.colophon .grid .mono {{ font-family: 'JetBrains Mono', 'Menlo', monospace; font-size: 8.5pt; word-break: break-all; }}

/* ---------- INDEX ---------- */
.index {{ page-break-after: always; }}
.index .head {{ display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #1c150d; padding-bottom: 4mm; margin-bottom: 8mm; }}
.index .head h2 {{
  font-family: 'EB Garamond', serif; font-weight: 500; font-size: 26pt;
  margin: 0; color: #1c150d;
}}
.index .head h2 em {{ color: #b04a1f; font-style: italic; }}
.index .head .count {{ font-family: 'Inter', sans-serif; font-size: 9pt; color: #6b5a44; letter-spacing: .2em; text-transform: uppercase; }}
.index ol {{
  list-style: none; padding: 0; margin: 0;
  column-count: 3; column-gap: 7mm;
}}
.index ol li {{
  display: flex; align-items: baseline; gap: 2.5mm;
  font-family: 'EB Garamond', serif; font-size: 9pt;
  padding: 0.5mm 0;
  border-bottom: 1px dotted rgba(28,21,13,.15);
  line-height: 1.25;
}}
.index .plate-num {{
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-size: 7pt; color: #b04a1f; letter-spacing: .04em;
  min-width: 9mm;
}}
.index .plate-name {{ flex: 1; color: #1c150d; }}

/* ---------- PLATES ---------- */
.plate-page {{
  page-break-after: always;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 8mm;
}}
.plate {{
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 70mm;
  gap: 8mm;
  align-items: center;
}}
.plate-frame {{
  background: #fffaf0;
  padding: 4mm;
  box-shadow: 0 0 0 1px rgba(28,21,13,.18), 0 0.6mm 0 rgba(28,21,13,.14);
  display: flex; align-items: center; justify-content: center;
  height: 118mm;
}}
.plate-frame img {{
  max-width: 100%; max-height: 100%;
  object-fit: contain;
}}
.plate figcaption {{
  border-left: 1px solid rgba(28,21,13,.4);
  padding: 2mm 0 2mm 8mm;
  height: 100mm;
  display: flex; flex-direction: column; justify-content: center;
}}
.cap-num {{
  font-family: 'Inter', sans-serif;
  font-size: 8pt; letter-spacing: .3em; text-transform: uppercase;
  color: #b04a1f;
  margin-bottom: 5mm;
}}
.cap-title {{
  font-family: 'EB Garamond', serif;
  font-weight: 500; font-style: italic;
  font-size: 22pt; line-height: 1.1;
  margin: 0 0 6mm 0;
  color: #1c150d;
  letter-spacing: -0.005em;
}}
.cap-mint {{
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-size: 7.5pt; color: #6b5a44; letter-spacing: .04em;
  margin-top: auto;
}}

/* ---------- BACK COVER ---------- */
.back-cover {{
  page: cover-back;
  page-break-before: always;
  width: 210mm; height: 297mm;
  background: #1c150d;
  color: #efe4cf;
  padding: 60mm 22mm;
  position: relative;
}}
.back-cover h2 {{
  font-family: 'EB Garamond', serif; font-style: italic; font-weight: 400;
  font-size: 34pt; line-height: 1.15;
  max-width: 150mm; margin: 0 0 14mm 0;
}}
.back-cover h2 em {{ color: #d98a4f; font-style: normal; }}
.back-cover p {{
  font-family: 'EB Garamond', serif; font-size: 11pt;
  max-width: 130mm; color: #c9b896;
}}
.back-cover .stamp {{
  position: absolute; bottom: 30mm; left: 22mm; right: 22mm;
  display: flex; justify-content: space-between; align-items: flex-end;
  font-family: 'Inter', sans-serif; font-size: 8pt;
  letter-spacing: .25em; text-transform: uppercase; color: #c9b896;
}}
.back-cover .stamp .domain {{
  font-family: 'EB Garamond', serif; font-style: italic; text-transform: none;
  font-size: 18pt; letter-spacing: 0; color: #efe4cf;
}}
</style>
</head>
<body>

<!-- COVER -->
<section class="cover">
  <div class="corner"><span class="dot"></span> Solana · Catálogo</div>
  <p class="eyebrow">Catálogo de obra digital · {date}</p>
  <h1>Monos<br><em>en cadena.</em></h1>
  <p class="subtitle">Una compilación impresa de las {total} obras alojadas en la wallet <strong>{domain}</strong>, autoría y resguardo de Daniel Serna Garza sobre la red Solana.</p>
  <div class="ornament">— de la serie <em>Monos</em> y obras afines —</div>
  <dl class="meta">
    <div>
      <dt>Dominio</dt>
      <dd>{domain}</dd>
    </div>
    <div>
      <dt>Wallet</dt>
      <dd class="mono">{wallet_short}</dd>
    </div>
    <div>
      <dt>Total de planchas</dt>
      <dd>{total}</dd>
    </div>
    <div>
      <dt>Compilado</dt>
      <dd>{date}</dd>
    </div>
  </dl>
</section>

<!-- COLOPHON -->
<section class="colophon">
  <h2>Nota <em>del compilador</em></h2>
  <p>El presente volumen reúne, en forma de catálogo impreso, las obras digitales firmadas y custodiadas por la wallet <strong>{domain}</strong> sobre la red Solana al día de la compilación. Cada plancha conserva su título original tal como fue acuñado por el artista, junto con la huella criptográfica (<em>mint address</em>) que la identifica de manera única en el libro mayor de la cadena.</p>
  <p>El orden seguido es el del alfabeto castellano. Las imágenes proceden directamente del almacenamiento descentralizado al que apunta cada token; en el remoto caso de que alguna obra no aparezca en estas páginas, se debe a una indisponibilidad temporal de su nodo de origen al momento de imprimir.</p>
  <p>Este catálogo es un homenaje editorial al trabajo de <strong>Daniel Serna Garza</strong> y no sustituye, ni pretende suplantar, la obra original ni los derechos de autor que la acompañan.</p>

  <div class="rule"></div>

  <div class="grid">
    <div>
      <h4>Dominio</h4>
      <p>{domain}</p>
      <h4 style="margin-top:5mm">Wallet</h4>
      <p class="mono">{wallet}</p>
    </div>
    <div>
      <h4>Cadena</h4>
      <p>Solana · Mainnet</p>
      <h4 style="margin-top:5mm">Total compilado</h4>
      <p>{total} planchas</p>
      <h4 style="margin-top:5mm">Fecha</h4>
      <p>{date}</p>
    </div>
  </div>

  <p class="signature" style="margin-top:14mm">— compilado para el archivo personal del coleccionista.</p>
</section>

<!-- INDEX -->
<section class="index">
  <div class="head">
    <h2>Índice <em>de planchas</em></h2>
    <span class="count">{total} obras</span>
  </div>
  <ol>{index}</ol>
</section>

<!-- PLATES -->
{plates}

<!-- BACK COVER -->
<section class="back-cover">
  <h2>“El mono en la cadena<br>es el mismo de siempre:<br>solo cambia la <em>vitrina</em>.”</h2>
  <p>Esta edición es un objeto único, generado a partir del estado de la wallet en la fecha indicada. Las obras que la habitan pueden, con el tiempo, mudarse a otras manos; el catálogo, en cambio, se queda quieto.</p>
  <div class="stamp">
    <span>Solana · {date}</span>
    <span class="domain">{domain}</span>
  </div>
</section>

</body>
</html>
"""

def main():
    items = load_items()
    print(f"Items with images: {len(items)}")
    html = build_html(items)
    html_path = OUTDIR / "monos-sol-catalogo.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"HTML written: {html_path}")

    from weasyprint import HTML
    pdf_path = OUTDIR / "monos-sol-catalogo.pdf"
    HTML(string=html, base_url=str(ROOT)).write_pdf(str(pdf_path))
    print(f"PDF written: {pdf_path}  ({pdf_path.stat().st_size/1024:.0f} KB)")

if __name__ == "__main__":
    main()
