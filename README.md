# Pianitos

Tu primer teclado, ahora con maestro propio.

App educativa para que ninas y ninos de 7 a 12 anos aprendan a tocar el
teclado en casa, validada con su instrumento fisico via MIDI USB.

> Estado: **MVP completo · semanas 1-8 cerradas.** Demo en vivo:
> https://pianitos.vercel.app · Plan original en [`PLAN.md`](PLAN.md).

## Que hay funcionando

- **Onboarding** de 5 pasos mobile-first (perfil del nino, avatar, marca
  del teclado, MIDI).
- **Modulo 1 (gratis)** y **modulo 2 (premium)**, 10 lecciones jugables
  con `LessonRunner` (intro -> demo -> ejercicios -> celebracion).
- **3 tipos de ejercicio**: encontrar nota, repetir patron, tocar cancion
  con notas que caen tipo Synthesia.
- **Mascota Doli** (corchea animada, 3 estados).
- **Estrellas + 5 medallas** persistidas en Supabase o `localStorage`.
- **Teclado virtual** y **Web MIDI USB** (Chrome/Edge escritorio).
- **PWA installable** + service worker offline-first.
- **Dashboard de padres** con perfiles, progreso y compartir por
  WhatsApp via OG image.
- **Stripe** (checkout, portal, webhook) listo a env vars.
- **Resend** (welcome, weekly summary, upgrade nudge) con cron Lunes.
- **Plausible** opcional, sin cookies, con eventos tipados.
- **Borrar/exportar cuenta** (GDPR-K + COPPA).
- **Widget de feedback** flotante.
- **Admin dashboard** privado en `/admin` (env `ADMIN_EMAILS`).
- **Beta gating** opcional via codigos de invitacion en `/beta`.
- **Playwright** e2e suite para onboarding + leccion.

## Como correrlo en local

Requisitos: Node 22+, pnpm 10+.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
# http://localhost:3000

# en otra terminal, cuando quieras pasar e2e:
pnpm exec playwright install chromium
pnpm test:e2e
```

Sin claves externas, todo funciona en **modo demo** con `localStorage`:
- Cuentas y perfiles viven solo en el navegador.
- Pagos, emails, analytics y MIDI hardware son no-op (logs a consola).

## Variables de entorno

Ver [`.env.example`](.env.example). Por bloque:

| Bloque | Funcion sin claves |
|---|---|
| Supabase | Modo demo: localStorage. |
| Stripe | Paywall en UI; checkout devuelve 503. |
| Resend | Emails se loggean a consola. |
| Plausible | Analytics no se envian. |
| Admin | `/admin` siempre redirije. |
| Beta | `/beta` deja pasar a todos. |

## Atajos del teclado virtual

- Mouse o dedo en cualquier dispositivo.
- Teclado de la computadora (escritorio):
  - Blancas: `A S D F G H J K L ; '`
  - Negras: `W E T Y U`
- USB MIDI: enchufa antes de cargar `/teclado` y veras "Tu teclado X
  esta listo".

## Stack

Next.js 14 (App Router) - TypeScript - Tailwind + shadcn-style helpers
- Tone.js - Web MIDI - Zustand - Framer Motion - Supabase (Auth + DB +
RLS) - Stripe - Resend + React Email - Plausible - @vercel/og -
@ducanh2912/next-pwa - Playwright. Deploy: Vercel.

## Estructura

```
app/
  (marketing)         landing, precios, legales, para padres
  onboarding/[step]   5 pasos
  nino/               vista del nino (modo enfoque)
  padres/             dashboard parental + suscripcion + cuenta
  admin/              dashboard interno
  beta/               gating de invitacion
  api/                consent, account, stripe, emails, og, share, feedback, health
components/
  piano/              VirtualKeyboard, FallingNotes, MidiStatus, PianoStage
  lesson/             LessonRunner + 4 step types + 3 ejercicios
  mascot/             Doli (corchea SVG animada)
  onboarding/         5 step components + Avatar + StepProgress
  padres/             Dashboard, Account settings, Share, Subscription
  paywall/            UpgradeModal, PremiumGate
  rewards/            BadgeCard
  feedback/           FeedbackWidget flotante
  analytics/          PlausibleScript, AudioMidiBridges, UpgradeBadge
  auth/               SignUpForm, SignInForm
  beta/               BetaCodeForm
lib/
  audio/              Tone.js engine
  midi/               Web MIDI engine + parser
  lessons/            schema, registry, content/m{1,2}l{1..5}
  badges/             catalog
  persistence/        progress + childProfile (Supabase + localStorage)
  supabase/           client/server/admin + Database type
  stripe/             env, client, plan helpers
  email/              env, client, send + cron window
  analytics/          plausible.ts (trackEvent + PianitosEvent union)
  admin/              isAdminEmail
  beta/               isInviteRequired/isValidInvite
  url.ts              getAppUrl()
emails/               Welcome, WeeklySummary, UpgradeNudge, Feedback
store/                midi, onboarding, childProfile, lesson
public/               manifest, icons (SVG), generated sw.js (gitignored)
supabase/migrations/  0001_init.sql + seed.sql
tests/e2e/            onboarding.spec.ts + lesson.spec.ts + fixtures
PLAN.md               plan original 8 semanas
```

## Para activar lo real

1. **Supabase**: crear proyecto, correr `supabase/migrations/0001_init.sql`
   y `supabase/seed.sql`. Pegar `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` en
   Vercel env.
2. **Stripe**: cuenta test, 2 productos (mensual $9.99 USD, anual $69
   USD), price IDs + secret + publishable + webhook secret en env.
   Apuntar el webhook a `https://tu-dominio/api/stripe/webhook`.
3. **Resend**: API key + dominio verificado. `RESEND_FROM` con formato
   `Pianitos <hola@tu-dominio>`. `FEEDBACK_TO` para recibir feedback.
4. **Plausible**: dominio en `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
5. **Cron weekly summary**: `vercel.json` ya define el cron Lunes
   16:00 UTC. Setea `CRON_SECRET` en env.
6. **Admin**: lista tu email en `ADMIN_EMAILS`.

## Tests

```bash
pnpm test:e2e        # Playwright headless
pnpm test:e2e:ui     # modo interactivo
```

## Roadmap post-MVP

Ver `PLAN.md` seccion "Lo que NO entra en MVP". El siguiente milestone
seria: app nativa iOS/Android (PWA basta de momento), modo "padre toca
con hijo", certificados imprimibles, mas modulos de curriculo,
multi-perfil hasta 3, integracion con escuelas.
