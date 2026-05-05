"""
Build the printable catalog (PDF + mirror HTML) for Daniel Serna Garza's
"Monos" series on Solana.

3 A4 pages, black & white only, in the spirit of danielserna.com:
  • Page 1 — biografía + nota de la colección.
  • Pages 2–3 — todas las obras minteadas por monos.sol, en orden.
    Las que ya no están en la wallet llevan la etiqueta "no disponible".

Each NFT thumbnail is clickable → links to its detail page on exchange.art.

Run: python3 scripts/build_pdf.py
"""
from __future__ import annotations
import json
import os
from pathlib import Path

from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "monos-series-full.json"
IMGDIR = ROOT / "build" / "images"
DIST = ROOT / "dist"
PUBLIC = ROOT / "public"
DIST.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

WALLET = "APc8i4qrxUihYW1kCMjnL8aR2ycoNKrS2eQomERo5jpP"
DOMAIN = "monos.sol"
TOTAL_GOAL = 400

def escape(s: str) -> str:
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def short_mint(m: str) -> str:
    return f"{m[:4]}…{m[-4:]}" if len(m) > 10 else m

def card(item: dict, *, for_pdf: bool) -> str:
    name = escape(item["name"])
    mint = item["mint"]
    available = item["available"]
    plate = item["plate"]
    img_path = IMGDIR / f"{mint}.jpg"
    if for_pdf:
        img_src = f"file://{img_path.resolve()}" if img_path.exists() else ""
    else:
        img_src = f"./images/{mint}.jpg" if img_path.exists() else ""
    href = f"https://exchange.art/single/{mint}"
    img_html = (
        f'<img src="{img_src}" alt="{name}" loading="lazy" />'
        if img_src else
        f'<div class="no-img" aria-hidden="true">▢</div>'
    )
    tag = '<span class="tag-na">no disponible</span>' if not available else ""
    return f'''
    <a class="card{' card-na' if not available else ''}" href="{href}" target="_blank" rel="noopener" title="{name} — {short_mint(mint)}">
      <div class="card-img">{img_html}{tag}</div>
      <div class="card-meta">
        <span class="num">{plate:03d}</span>
        <span class="name">{name}</span>
      </div>
    </a>'''

def build_html(items: list[dict], *, for_pdf: bool) -> str:
    available = [it for it in items if it["available"]]
    unavailable = [it for it in items if not it["available"]]
    n_total = len(items)
    n_avail = len(available)
    n_unavail = len(unavailable)

    cards_html = "".join(card(it, for_pdf=for_pdf) for it in items)

    return TEMPLATE.format(
        cards=cards_html,
        n_total=n_total,
        n_avail=n_avail,
        n_unavail=n_unavail,
        total_goal=TOTAL_GOAL,
        domain=DOMAIN,
        wallet=WALLET,
        for_pdf=("yes" if for_pdf else "no"),
    )

TEMPLATE = r"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Monos · Daniel Serna Garza</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Catálogo de la serie Monos de Daniel Serna Garza sobre Solana — 244 piezas minteadas, {n_avail} disponibles en monos.sol.">
<style>
@page {{
  size: A4;
  margin: 14mm 14mm 14mm 14mm;
  @bottom-left  {{ content: "monos.sol — danielserna.com"; font: 8pt 'EB Garamond', Georgia, serif; color: #555; }}
  @bottom-right {{ content: counter(page) " / 4"; font: 8pt 'EB Garamond', Georgia, serif; color: #555; }}
}}

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; background: #ffffff; color: #000; }}
body {{
  font-family: 'Cormorant Garamond', 'EB Garamond', Georgia, 'Times New Roman', serif;
  -webkit-font-smoothing: antialiased;
  line-height: 1.45;
}}
.sans {{ font-family: 'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif; }}

a {{ color: #000; text-decoration: none; }}

/* ---------- PAGE 1: BIO ---------- */
.bio {{
  page-break-after: always;
  width: 100%;
  min-height: calc(297mm - 28mm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20mm 14mm 0;
}}
.bio .top-rule {{ width: 28mm; height: 1px; background: #000; margin-bottom: 10mm; }}
.bio .artist {{
  font-family: 'Cormorant Garamond', serif;
  font-size: 18pt; font-weight: 400; letter-spacing: .01em;
  margin: 0 0 4mm; font-style: italic;
}}
.bio h1 {{
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
  font-size: 78pt;
  line-height: .9;
  letter-spacing: -0.012em;
  margin: 0 0 6mm 0;
}}
.bio .lede {{
  font-size: 14pt; max-width: 130mm; margin: 0 0 6mm; color: #000;
}}
.bio .lede em {{ font-style: italic; }}
.bio .meta-line {{
  font-family: 'Inter', sans-serif;
  font-size: 8pt; letter-spacing: .28em; text-transform: uppercase;
  color: #000; margin: 0 0 8mm;
}}
.bio .meta-line .sep {{ display: inline-block; width: 6mm; }}

.bio .body {{
  text-align: left; max-width: 168mm;
  font-size: 10pt; columns: 2; column-gap: 8mm; column-rule: 0; orphans: 3; widows: 3;
  line-height: 1.4;
}}
.bio .body p {{ margin: 0 0 3mm 0; }}
.bio .body p:first-child::first-line {{ font-variant: small-caps; letter-spacing: .04em; }}
.bio .body p strong {{ font-weight: 600; }}

.bio .stats {{
  margin-top: 6mm; padding-top: 4mm; border-top: 1px solid #000;
  width: 168mm;
  display: grid; grid-template-columns: repeat(4,1fr); gap: 4mm;
  font-family: 'Inter', sans-serif;
}}
.bio .stats > div {{ text-align: center; }}
.bio .stats dt {{ font-size: 6.5pt; letter-spacing: .25em; text-transform: uppercase; color: #000; margin-bottom: 1mm; }}
.bio .stats dd {{ margin: 0; font-family: 'Cormorant Garamond', serif; font-size: 20pt; line-height: 1; }}
.bio .stats dd small {{ font-family: 'Inter', sans-serif; font-size: 7pt; letter-spacing: .15em; color: #555; display: block; margin-top: 0.8mm; }}

.bio .links {{
  margin-top: 5mm; font-family: 'Inter', sans-serif; font-size: 7.5pt;
  letter-spacing: .22em; text-transform: uppercase;
}}
.bio .links a {{ border-bottom: 0.4pt solid #000; padding-bottom: 1px; margin: 0 4mm; }}

/* ---------- PAGES 2–3: GRID ---------- */
.grid-page {{
  page-break-before: always;
}}
.grid-page .head {{
  display: flex; justify-content: space-between; align-items: baseline;
  border-bottom: 1px solid #000;
  padding-bottom: 3mm; margin-bottom: 4mm;
}}
.grid-page .head h2 {{
  font-family: 'Cormorant Garamond', serif; font-weight: 500;
  font-size: 18pt; margin: 0;
}}
.grid-page .head h2 em {{ font-style: italic; }}
.grid-page .head .legend {{
  font-family: 'Inter', sans-serif; font-size: 7.5pt;
  letter-spacing: .15em; text-transform: uppercase; color: #000;
  display: flex; gap: 10mm;
}}
.grid-page .head .legend .swatch {{
  display: inline-block; width: 8px; height: 8px; background: #000;
  margin-right: 4px; vertical-align: middle;
}}
.grid-page .head .legend .swatch.na {{
  background: transparent; border: 1px solid #000; position: relative;
}}
.grid-page .head .legend .swatch.na::after {{
  content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #000;
}}

.grid {{
  display: grid;
  grid-template-columns: repeat(11, 16mm);
  grid-auto-rows: 19mm;
  gap: 1.2mm 1.2mm;
  justify-content: space-between;
}}

/* Cards: 244/2 = 122 per page → 11×12 = 132 cells (room for 122) */
.card {{
  display: block; color: #000; text-decoration: none;
  position: relative;
  width: 16mm; height: 19mm;
  overflow: hidden;
}}
.card-img {{
  width: 16mm;
  height: 16mm;
  background: #fff;
  border: 0.4pt solid #000;
  position: relative;
  overflow: hidden;
}}
.card-img img {{
  width: 100%; height: 100%; object-fit: contain;
}}
.card-img .no-img {{
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  font-size: 14pt; color: #ccc; font-family: 'Cormorant Garamond', serif;
}}
.card-meta {{
  margin-top: 0.4mm;
  display: flex; gap: 1mm; align-items: baseline;
  font-size: 4.4pt; line-height: 1;
  white-space: nowrap; overflow: hidden;
  height: 2.5mm;
}}
.card-meta .num {{
  font-family: 'Inter', monospace; font-weight: 500;
  font-size: 3.8pt; color: #555; letter-spacing: .04em; flex-shrink: 0;
}}
.card-meta .name {{
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: 4.6pt; color: #000;
  text-overflow: ellipsis; overflow: hidden;
}}

/* Unavailable: stripe across image + tag chip */
.card-na .card-img {{
  border-color: #000;
}}
.card-na .card-img::before {{
  content: ""; position: absolute; inset: 0;
  background:
    linear-gradient(135deg, transparent 49.6%, #000 49.6%, #000 50.4%, transparent 50.4%),
    rgba(255,255,255,0.55);
  pointer-events: none;
}}
.card-na .card-img img {{ opacity: 0.30; }}
.card-na .tag-na {{
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(-12deg);
  font-family: 'Inter', sans-serif; font-weight: 600;
  font-size: 4.4pt; letter-spacing: .15em; text-transform: uppercase;
  background: #fff; color: #000; padding: 0.6mm 1.4mm;
  border: 0.6pt solid #000; white-space: nowrap;
}}
.card-na .card-meta .name {{ color: #555; text-decoration: line-through; }}

/* ---------- PAGE 4: PHANTOM MANUAL ---------- */
.manual {{
  page-break-before: always;
  padding: 0;
}}
.manual .head {{
  display: flex; justify-content: space-between; align-items: baseline;
  border-bottom: 1px solid #000;
  padding-bottom: 2mm; margin-bottom: 4mm;
}}
.manual .head h2 {{
  font-family: 'Cormorant Garamond', serif; font-weight: 500;
  font-size: 20pt; margin: 0;
}}
.manual .head h2 em {{ font-style: italic; }}
.manual .head .head-aside {{
  font-size: 7pt; letter-spacing: .2em; text-transform: uppercase; color: #000;
}}
.manual .intro {{
  font-size: 9.5pt; max-width: 100%; margin: 0 0 4mm 0; line-height: 1.4;
}}
.manual .intro strong {{ font-weight: 600; }}
.manual .intro em {{ font-style: italic; }}

.manual ol.steps {{
  list-style: none; margin: 0 0 5mm 0; padding: 0;
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 3mm;
}}
.manual ol.steps li {{
  break-inside: avoid;
  border-top: 0.6pt solid #000; padding-top: 2mm;
  display: flex; flex-direction: column;
}}
.manual ol.steps .num {{
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: 22pt; line-height: 1; color: #000;
  margin-bottom: 1.5mm;
}}
.manual ol.steps h3 {{
  font-family: 'Cormorant Garamond', serif; font-weight: 500;
  font-size: 9.5pt; line-height: 1.2; margin: 0 0 1.5mm 0;
}}
.manual ol.steps p {{
  font-size: 7.8pt; line-height: 1.35; margin: 0;
}}
.manual ol.steps p strong {{ font-weight: 600; }}
.manual ol.steps p em {{ font-style: italic; }}
.manual ol.steps p .mono {{ font-family: 'Inter', monospace; font-size: 7.4pt; }}

.manual .security {{
  border: 0.6pt solid #000;
  padding: 3mm 4mm 3mm;
  margin: 0 0 4mm;
}}
.manual .security h4 {{
  font-size: 7.5pt; letter-spacing: .25em; text-transform: uppercase; font-weight: 600;
  margin: 0 0 2mm 0;
  display: flex; align-items: center; gap: 3mm;
}}
.manual .security h4::before {{
  content: ""; width: 14mm; height: 1px; background: #000;
}}
.manual .security ul {{
  list-style: none; padding: 0; margin: 0;
  font-size: 8.5pt; line-height: 1.4;
  display: grid; grid-template-columns: 1fr 1fr; gap: 0 6mm;
}}
.manual .security ul li {{
  padding: 0.5mm 0; padding-left: 4mm; position: relative;
  break-inside: avoid;
}}
.manual .security ul li::before {{
  content: "—"; position: absolute; left: 0; top: 0.5mm; color: #000;
}}
.manual .security ul li strong {{ font-weight: 600; }}

.manual .signoff {{
  text-align: center; font-size: 10pt; color: #000;
  border-top: 0.4pt solid #000; padding-top: 3mm; margin-top: 0;
  font-style: italic;
}}
.manual .signoff em {{ font-style: italic; }}
.manual a {{ border-bottom: 0.4pt solid #000; }}

/* Web-only tweaks: bigger thumbnails, more breathing room */
@media screen {{
  body {{ background: #fafafa; }}
  .grid-page, .bio, .manual {{
    background: #fff; max-width: 1120px; margin: 24px auto;
    padding: 44px 36px; box-shadow: 0 1px 0 rgba(0,0,0,.06);
  }}
  .bio {{ min-height: auto; padding-top: 64px; padding-bottom: 64px; }}
  .grid {{
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    grid-auto-rows: auto;
    gap: 16px;
  }}
  .card {{ width: auto; }}
  .card-img {{
    width: 100%; height: auto; aspect-ratio: 1/1;
    border-width: 1px;
  }}
  .card-meta {{ font-size: 11px; line-height: 1.2; padding-top: 4px; }}
  .card-meta .num {{ font-size: 10px; }}
  .card-meta .name {{ font-size: 13px; }}
  .card-na .tag-na {{ font-size: 10px; padding: 3px 8px; border-width: 1px; }}
  .grid-page .head {{ position: sticky; top: 0; background: #fff; z-index: 5; padding: 8px 0; }}
  .grid-page, .manual {{ page-break-before: auto; }}
  .manual ol.steps {{ grid-template-columns: 1fr 1fr; }}
  @page {{ /* ignored on screen */ }}
}}
@media screen and (max-width: 720px) {{
  .grid {{ grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }}
  .bio h1 {{ font-size: 18vw; }}
  .manual ol.steps {{ grid-template-columns: 1fr; }}
}}
</style>
</head>
<body>

<section class="bio">
  <div class="top-rule"></div>
  <p class="artist">Daniel Serna Garza</p>
  <h1>Monos.</h1>
  <p class="lede">Boceto de monos diario por <em>un año</em>, iniciado el <em>11 de junio de 2021</em> — los hermanos digitales de los monos de bronce que habitan la Calzada San Pedro.</p>
  <p class="meta-line">Solana <span class="sep"></span> {domain} <span class="sep"></span> Hasta {total_goal} piezas</p>

  <div class="body">
    <p><strong>Daniel Serna Garza</strong> (Monterrey, 1972) es escultor. Estudió arquitectura en el ITESM y desde el año 2000 trabaja la materia: bronce, moldes, soldadura, talla en piedra. En 2003 viajó a Pietrasanta, Italia, donde labró por primera vez el mármol blanco de Carrara y obtuvo el segundo lugar de un Simposio Internacional de Escultura.</p>
    <p>De vuelta en Monterrey, expuso más de veinticinco piezas en mármol negro, regresó a Italia con la casa Henraux, levantó su primera obra de gran formato en 2008 y abrió, en 2010, su propio taller, <em>la Piedra</em>. Desde entonces alterna obra por encargo con series temáticas: <em>Animales</em>, <em>Papel Arrugado</em>, <em>la Urbe</em>, <em>Monos</em>.</p>
    <p>En 2019 instaló cinco esculturas monumentales de ocho toneladas cada una sobre la <strong>Calzada San Pedro</strong>. Esos monos, hijos del mármol y la calle, fueron el origen de esta serie digital: el 11 de junio de 2021 comenzó a dibujar uno cada día.</p>
    <p>El presente volumen reúne las <strong>{n_total}</strong> piezas minteadas hasta hoy de un proyecto que contempla, como máximo, <strong>{total_goal}</strong> obras digitales. <strong>{n_avail}</strong> permanecen bajo custodia de la wallet <em>{domain}</em>; <strong>{n_unavail}</strong> ya fueron adquiridas y se marcan, en estas páginas, como <em>no disponibles</em>. Cada pieza enlaza, al hacer clic, con su ficha en exchange.art.</p>
  </div>

  <dl class="stats">
    <div><dt>Minteadas</dt><dd>{n_total}<small>de {total_goal} máx.</small></dd></div>
    <div><dt>Disponibles</dt><dd>{n_avail}<small>en {domain}</small></dd></div>
    <div><dt>No disponibles</dt><dd>{n_unavail}<small>en otras carteras</small></dd></div>
    <div><dt>Inicio</dt><dd>2021<small>11 de junio</small></dd></div>
  </dl>

  <p class="links sans">
    <a href="https://www.danielserna.com" target="_blank" rel="noopener">danielserna.com</a>
    <a href="https://www.instagram.com/dsgescultor" target="_blank" rel="noopener">@dsgescultor</a>
    <a href="https://www.instagram.com/monosmonosymasmonos" target="_blank" rel="noopener">@monosmonosymasmonos</a>
  </p>
</section>

<section class="grid-page grid-page-1">
  <div class="head">
    <h2>Las <em>{n_total}</em> piezas — i</h2>
    <div class="legend sans">
      <span><span class="swatch"></span>Disponible</span>
      <span><span class="swatch na"></span>No disponible</span>
    </div>
  </div>
  <div class="grid">
    {cards_first_half}
  </div>
</section>

<section class="grid-page grid-page-2">
  <div class="head">
    <h2>Las <em>{n_total}</em> piezas — ii</h2>
    <div class="legend sans">
      <span><span class="swatch"></span>Disponible</span>
      <span><span class="swatch na"></span>No disponible</span>
    </div>
  </div>
  <div class="grid">
    {cards_second_half}
  </div>
</section>

<!-- PAGE 4 — Manual Phantom -->
<section class="manual">
  <div class="head">
    <h2>Para recibir <em>una pieza</em></h2>
    <span class="head-aside sans">Manual breve · Phantom · Solana</span>
  </div>

  <p class="intro">
    Estos coleccionables viven en la red <strong>Solana</strong>.
    Para que Daniel pueda enviarte una pieza, primero necesitas una
    <em>cartera</em> (wallet) en Solana, y compartirle la <em>dirección pública</em>
    de esa cartera. Phantom es la cartera más sencilla y segura para empezar.
    El proceso completo toma cinco minutos.
  </p>

  <ol class="steps">
    <li>
      <span class="num">1</span>
      <div class="body">
        <h3>Descarga Phantom desde el sitio oficial.</h3>
        <p>
          Entra únicamente a <a href="https://phantom.com" target="_blank" rel="noopener"><strong>phantom.com</strong></a>
          (extensión para Chrome / Brave / Firefox y app para iPhone / Android).
          Verifica que el dominio diga exactamente <em>phantom.com</em> antes de descargar
          — existen sitios falsos diseñados para robar contraseñas.
        </p>
      </div>
    </li>
    <li>
      <span class="num">2</span>
      <div class="body">
        <h3>Crea una cartera nueva.</h3>
        <p>
          Abre Phantom, elige <em>“Crear nueva cartera”</em> y define una contraseña
          fuerte para desbloquear la app en este dispositivo. (Esa contraseña
          protege tu computadora; no es tu cartera.)
        </p>
      </div>
    </li>
    <li>
      <span class="num">3</span>
      <div class="body">
        <h3>Guarda tu frase de recuperación. Esto es lo más importante.</h3>
        <p>
          Phantom te mostrará <strong>doce palabras</strong> en orden — es la única llave
          de tu cartera. <em>Apúntalas en papel, dos veces, y guárdalas en sitios
          distintos.</em> No las saques en foto, no las copies a la nube, no las
          escribas en chats. Quien tiene esas doce palabras, tiene tu cartera.
        </p>
      </div>
    </li>
    <li>
      <span class="num">4</span>
      <div class="body">
        <h3>Copia tu dirección pública.</h3>
        <p>
          En la pantalla principal de Phantom verás tu dirección — un texto
          de 32–44 caracteres tipo <span class="mono">7xK9…aB3Q</span>. Haz clic
          sobre ella para copiarla. <em>Esta sí se puede compartir</em>: es como
          el número de cuenta para recibir.
        </p>
      </div>
    </li>
    <li>
      <span class="num">5</span>
      <div class="body">
        <h3>Envíasela a Daniel para que pueda enviarte la pieza.</h3>
        <p>
          Mándale tu dirección pública por mensaje directo a
          <a href="https://www.instagram.com/dsgescultor" target="_blank" rel="noopener"><strong>@dsgescultor</strong></a>
          o <a href="https://www.instagram.com/monosmonosymasmonos" target="_blank" rel="noopener"><strong>@monosmonosymasmonos</strong></a>
          en Instagram. Cuando reciba la transferencia, tu pieza aparecerá en la
          pestaña <em>Coleccionables</em> de Phantom en cuestión de segundos.
        </p>
      </div>
    </li>
  </ol>

  <div class="security">
    <h4 class="sans">Reglas de seguridad — léelas con calma</h4>
    <ul>
      <li><strong>Nadie</strong>, ni Daniel, ni Phantom, ni soporte técnico, te pedirá tu frase de recuperación. Si te la piden, es un fraude.</li>
      <li>Phantom solo se descarga desde <strong>phantom.com</strong>. Cualquier otro dominio (incluso si aparece en buscadores) puede ser falso.</li>
      <li>Antes de firmar cualquier transacción dentro de Phantom, lee el texto: si no entiendes lo que pide, no firmes.</li>
      <li>Si extravías la frase de recuperación pierdes el acceso a la cartera. Nadie puede recuperarla por ti.</li>
    </ul>
  </div>

  <p class="signoff">
    <em>Una vez que tengas tu cartera, escribe a Daniel — la pieza viaja en
    segundos y se queda contigo, en cadena, para siempre.</em>
  </p>
</section>

</body>
</html>
"""

def build():
    items = json.loads(DATA.read_text(encoding="utf-8"))
    items.sort(key=lambda x: x["plate"])

    half = (len(items) + 1) // 2
    cards_first_pdf  = "".join(card(it, for_pdf=True) for it in items[:half])
    cards_second_pdf = "".join(card(it, for_pdf=True) for it in items[half:])
    cards_first_web  = "".join(card(it, for_pdf=False) for it in items[:half])
    cards_second_web = "".join(card(it, for_pdf=False) for it in items[half:])

    n_total = len(items)
    n_avail = sum(1 for it in items if it["available"])
    n_unavail = n_total - n_avail

    common = dict(
        n_total=n_total, n_avail=n_avail, n_unavail=n_unavail,
        total_goal=TOTAL_GOAL, domain=DOMAIN, wallet=WALLET,
    )

    pdf_html = TEMPLATE.format(
        cards_first_half=cards_first_pdf,
        cards_second_half=cards_second_pdf, **common)
    web_html = TEMPLATE.format(
        cards_first_half=cards_first_web,
        cards_second_half=cards_second_web, **common)

    pdf_html_path = DIST / "monos-sol-catalogo.html"
    pdf_html_path.write_text(pdf_html, encoding="utf-8")
    web_html_path = PUBLIC / "catalogo.html"
    web_html_path.write_text(web_html, encoding="utf-8")
    print(f"Wrote {pdf_html_path}")
    print(f"Wrote {web_html_path}")

    pdf_path = DIST / "monos-sol-catalogo.pdf"
    HTML(string=pdf_html, base_url=str(ROOT)).write_pdf(str(pdf_path))
    print(f"Wrote {pdf_path}  ({pdf_path.stat().st_size/1024:.0f} KB)")

if __name__ == "__main__":
    build()
