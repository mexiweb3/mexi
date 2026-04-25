# Pianitos

Tu primer teclado, ahora con maestro propio.

App educativa para que niñas y niños de 7 a 12 años aprendan a tocar el
teclado en casa, validada con su instrumento físico vía MIDI USB.

> Estado: **MVP en construcción · semana 1/8.** Este repo contiene el
> esqueleto navegable. Para el plan completo y el cronograma ver
> [`PLAN.md`](PLAN.md).

## Cómo correrlo en local

Requisitos: Node 22+, pnpm 10+.

```bash
pnpm install
cp .env.example .env.local   # rellenar cuando se enchufen Supabase/Stripe/etc.
pnpm dev
# http://localhost:3000
```

Páginas disponibles esta semana:

- `/` · landing.
- `/teclado` · teclado virtual jugable con audio (Tone.js) y detección
  de teclado MIDI USB (Chrome/Edge en escritorio).
- `/registro`, `/ingresar` · stubs de auth (UI sin backend aún).
- `/precios`, `/para-padres`, `/privacidad`, `/terminos` · páginas estáticas.

## Atajos del teclado virtual

Conecta tu teclado USB y toca: si el navegador soporta Web MIDI lo verás
arriba como "¡Tu teclado *Nombre* está listo!". Si no:

- Toca con el ratón o el dedo.
- Teclas blancas: `A S D F G H J K L ; '`
- Teclas negras: `W E T Y U`

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Tone.js · Web MIDI ·
Zustand · Framer Motion. Auth/DB con Supabase y pagos con Stripe llegan
en semana 2 y 5 respectivamente.

## Estructura

```
app/                # rutas (landing, teclado, auth stubs, legales)
components/piano/   # VirtualKeyboard, MidiStatus, KeyboardMidiBridge, PianoStage
lib/audio/          # motor Tone.js
lib/midi/           # motor Web MIDI + parser
lib/types/          # tipos compartidos de música
store/              # zustand stores (midi por ahora)
archive/            # versiones previas (sandbox-piano y linktree)
```

Ver [`PLAN.md`](PLAN.md) para el cronograma completo y las decisiones
abiertas.
