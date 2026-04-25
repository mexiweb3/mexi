# Pianitos — Plan de MVP (8 semanas)

> Documento guía. Actualizar al cierre de cada milestone semanal.
> Última revisión: 2026-04-25 · estado: **borrador, pendiente confirmación**.

---

## 1. Resumen ejecutivo

App web educativa freemium para enseñar teclado a niños hispanohablantes
de 7-12 años con su instrumento físico, validada vía **Web MIDI**.
Comprador = padre/madre, usuario = niño. Stack: Next.js 14 + Supabase +
Stripe + Tone.js + Web MIDI. Objetivo: lanzar beta a 10-20 familias en
8 semanas y medir activación, retención D7 y conversión free→premium.

---

## 2. Decisiones abiertas (necesito respuesta antes de codear)

Las marco **D1..Dn** para que puedas responder por número.

- **D1. Nombre comercial.** ¿Mantenemos *Pianitos* o prefieres otra
  opción? Alternativas que cumplen: *Tecladitos*, *Notitas*, *Doremí*,
  *Maestro Mini*. Recomendación: validar disponibilidad de dominio
  `.com` y `.app` antes de fijar.
- **D2. Mascota.** ¿Nota musical animada (*Doli*) o animal? Mi voto:
  **una corchea con cara y manitas** — barata de animar (Lottie/SVG),
  sin antropomorfismo cultural y vincula visualmente con la música.
  Alternativa cálida: un pajarito.
- **D3. Carpeta `piano/` actual.** El piano estático que hice antes ya
  no encaja con la arquitectura. Opciones: (a) borrar, (b) mover a
  `archive/sandbox-piano/` como referencia, (c) absorber en el teclado
  virtual del MVP. Mi voto: **(b)** — cero coste, sirve como demo
  rápido para enseñar a stakeholders.
- **D4. Estructura del repo.** ¿App única en raíz o monorepo
  `apps/web/`? Recomiendo **app única en raíz** durante el MVP, mover a
  monorepo solo si añadimos backend separado o app móvil nativa más
  adelante. Reduce fricción y velocidad de iteración.
- **D5. Modelo de prueba gratuita.** Stripe Checkout puede pedir tarjeta
  y dar 7 días gratis (mejor conversión, peor activación) o no pedir
  tarjeta y dejar el plan free indefinido (mejor activación, peor
  conversión). Recomiendo **freemium sin tarjeta + paywall duro en
  lección 6** — es lo que el spec describe.
- **D6. Precios.** ¿Fijamos $9.99/mes y $69/año (USD) como punto de
  partida? Para LatAm conviene paridad de poder adquisitivo (MXN $149,
  COP $29.900, ARS local). Stripe soporta multi-moneda pero **lo
  difiero a post-MVP** salvo que digas lo contrario.
- **D7. Consentimiento parental verificable (COPPA).** Estándar
  industria: cargo de $0.50 reembolsable a tarjeta del padre. Otra
  opción más barata: doble opt-in por email + declaración firmada.
  Recomiendo **doble opt-in por email para el MVP** (suficiente para
  beta cerrada con 20 familias) y migrar a cargo verificable antes de
  abrir registros públicos. **Recordatorio: revisar con un abogado
  antes de cobrar dinero real.**
- **D8. Audio de narración.** ¿Voz humana grabada (mejor calidad,
  alto coste/latencia de producción), TTS premium tipo ElevenLabs
  ($/mes pero rápido de iterar), o `SpeechSynthesis` del navegador
  (gratis, calidad media)? Recomiendo **ElevenLabs en MVP** con voz
  fija de niño/maestro hispanohablante; cacheamos los MP3 generados en
  Supabase Storage para no pagar por reproducción.
- **D9. MIDI en móvil/iPad.** Web MIDI **no funciona en Safari/iOS**.
  Opciones: (a) "iPad sin MIDI" — ejercicios con tap en teclado
  virtual; (b) detección de tono por micrófono (`PitchDetector`,
  Pitchy) para validar el teclado físico aún sin MIDI. Recomiendo
  **(a) en MVP** y posicionar Chrome/Edge en escritorio como la
  experiencia premium.
- **D10. Idioma del audio.** Español neutro latinoamericano, ¿confirmas?
- **D11. Dominio + branding.** ¿Tienes dominio reservado? Si no, lo
  bloqueo en cuanto confirmes D1.
- **D12. Cuentas externas.** Necesito que crees: Supabase (proyecto),
  Stripe (cuenta + productos test), Resend, Plausible, Vercel. Yo
  preparo la app para consumir las claves vía `.env.local`.

---

## 3. Stack y por qué

| Capa | Elección | Razón en una línea |
|---|---|---|
| Framework | Next.js 14 App Router + TS | SSR/RSC + edge, ecosistema, Vercel one-click. |
| UI | Tailwind + shadcn/ui + Framer Motion | Velocidad y consistencia con UX infantil. |
| Auth/DB/Storage | Supabase | Auth + Postgres + RLS + Storage en una. |
| Pagos | Stripe Checkout (subscription) | Estándar, soporta trial y portal de cliente. |
| Audio | Tone.js + sample piano (Salamander) | Sonido real, no oscilador sintético. |
| MIDI | Web MIDI API nativa | Sin dependencias, cero coste. |
| Estado cliente | Zustand | Pequeño, sin boilerplate. |
| Forms/validación | React Hook Form + Zod | Compartir esquemas cliente/servidor. |
| Email | Resend + React Email | Plantillas en JSX. |
| Analytics | Plausible (self-host opcional) | COPPA-friendly, sin cookies. |
| PWA | `next-pwa` | Instalable, offline shell. |
| Tests | Vitest + Playwright (smoke) | Rápido + 1 e2e crítico. |
| Logs/errores | Sentry (free tier) | Catch en prod. |
| CI/CD | GitHub Actions → Vercel | Lint + typecheck + deploy preview. |

---

## 4. Estructura de archivos propuesta

```
.
├── app/
│   ├── (marketing)/                   # landing, pricing, para padres, legales
│   │   ├── page.tsx                   # landing
│   │   ├── precios/page.tsx
│   │   ├── para-padres/page.tsx
│   │   ├── privacidad/page.tsx
│   │   ├── terminos/page.tsx
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── ingresar/page.tsx
│   │   ├── registro/page.tsx
│   │   ├── recuperar/page.tsx
│   │   └── verificar/page.tsx         # doble opt-in COPPA
│   ├── (app)/
│   │   ├── onboarding/                # 5 pantallas
│   │   │   └── [step]/page.tsx
│   │   ├── nino/                      # vista de niño (modo enfoque)
│   │   │   ├── layout.tsx             # bloquea navegación accidental
│   │   │   ├── inicio/page.tsx        # mapa de lecciones
│   │   │   ├── leccion/[id]/page.tsx  # runtime de lección
│   │   │   ├── logros/page.tsx
│   │   │   └── canciones/page.tsx     # premium
│   │   ├── padres/                    # dashboard parental
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # resumen + CTA upgrade
│   │   │   ├── progreso/page.tsx
│   │   │   ├── perfiles/page.tsx
│   │   │   ├── suscripcion/page.tsx
│   │   │   └── cuenta/page.tsx        # borrar cuenta, exportar datos
│   │   └── layout.tsx
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   ├── portal/route.ts
│   │   │   └── webhook/route.ts
│   │   ├── lessons/[id]/complete/route.ts
│   │   ├── share/progress/route.ts    # genera imagen OG para WhatsApp
│   │   └── account/delete/route.ts
│   └── layout.tsx                     # root + Plausible
├── components/
│   ├── ui/                            # shadcn
│   ├── piano/
│   │   ├── VirtualKeyboard.tsx        # SVG, accesible, configurable
│   │   ├── FallingNotes.tsx           # modo Synthesia
│   │   ├── KeyboardMidiBridge.tsx     # une Web MIDI ↔ teclado
│   │   └── MidiStatus.tsx             # "¡Tu teclado está listo!"
│   ├── lesson/
│   │   ├── LessonRunner.tsx           # máquina de estados
│   │   ├── StepIntro.tsx
│   │   ├── StepDemo.tsx
│   │   ├── StepExercise.tsx
│   │   ├── StepCelebration.tsx
│   │   └── exercises/
│   │       ├── FindNote.tsx
│   │       ├── RepeatPattern.tsx
│   │       └── PlaySong.tsx
│   ├── mascot/
│   │   ├── Mascot.tsx                 # Lottie/SVG con estados
│   │   └── animations.ts
│   ├── rewards/
│   │   ├── StarsBurst.tsx
│   │   ├── BadgeCard.tsx
│   │   └── ConfettiOverlay.tsx
│   ├── parents/
│   │   ├── ProgressChart.tsx
│   │   ├── BadgeGrid.tsx
│   │   └── ShareButton.tsx
│   └── shared/
│       ├── KidButton.tsx              # botones grandes con audio
│       └── NarratedText.tsx           # texto con TTS opcional
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # browser
│   │   ├── server.ts                  # server components
│   │   └── admin.ts                   # service role (sólo server)
│   ├── stripe.ts
│   ├── audio/
│   │   ├── engine.ts                  # singleton Tone.js
│   │   ├── samples.ts                 # mapa de samples
│   │   └── tts.ts                     # cache de narraciones
│   ├── midi/
│   │   ├── engine.ts                  # subscribe a inputs
│   │   └── normalize.ts               # midi → note name
│   ├── lessons/
│   │   ├── registry.ts                # lista 1..10
│   │   ├── schema.ts                  # tipos Zod
│   │   └── content/                   # 1 archivo TS por lección
│   ├── rewards/
│   │   ├── stars.ts
│   │   └── badges.ts
│   ├── analytics.ts                   # wrapper Plausible
│   └── i18n.ts                        # textos centralizados (sólo es-419)
├── store/
│   ├── lesson.ts                      # progreso de lección actual
│   ├── child.ts                       # perfil activo
│   └── midi.ts                        # estado conexión
├── public/
│   ├── audio/
│   │   ├── samples/                   # piano Salamander mini
│   │   └── narration/                 # mp3 generados (cache)
│   └── mascot/
├── emails/
│   ├── Welcome.tsx
│   ├── WeeklySummary.tsx
│   └── UpgradeNudge.tsx
├── supabase/
│   ├── migrations/                    # SQL versionado
│   └── seed.sql                       # lecciones + medallas iniciales
├── tests/
│   ├── e2e/onboarding.spec.ts
│   └── unit/lessons.test.ts
├── .env.example
├── PLAN.md                            # ← este documento
└── README.md
```

---

## 5. Modelo de datos (Supabase / Postgres)

Todas las tablas con **RLS activo**. Resumen mínimo del MVP:

```sql
-- usuarios padre
table profiles_parent (
  id uuid pk references auth.users on delete cascade,
  email text not null,
  display_name text,
  consent_signed_at timestamptz,
  consent_ip inet,
  locale text default 'es-419',
  plan text default 'free' check (plan in ('free','premium')),
  stripe_customer_id text,
  created_at timestamptz default now()
)

-- perfiles de niños (1 en free, hasta 3 en premium)
table profiles_child (
  id uuid pk default gen_random_uuid(),
  parent_id uuid references profiles_parent on delete cascade,
  name text not null,           -- nombre de pila, no apellido
  age int check (age between 5 and 14),
  avatar text,                  -- 1..6
  keyboard_brand text,          -- yamaha|casio|otro|ninguno
  created_at timestamptz default now()
)

-- catálogo de lecciones (estático, viene de seed)
table lessons (
  id text pk,                   -- 'm1l1', 'm2l3'
  module int not null,
  order_in_module int not null,
  title text not null,
  is_premium boolean not null,
  duration_min int not null
)

-- progreso por niño y lección
table child_progress (
  child_id uuid references profiles_child on delete cascade,
  lesson_id text references lessons,
  stars int check (stars between 0 and 3),
  best_score int,
  completed_at timestamptz,
  total_time_sec int default 0,
  attempts int default 0,
  primary key (child_id, lesson_id)
)

-- medallas
table badges (
  id text pk, name text, description text, icon text
)
table child_badges (
  child_id uuid references profiles_child on delete cascade,
  badge_id text references badges,
  awarded_at timestamptz default now(),
  primary key (child_id, badge_id)
)

-- suscripción (espejo de Stripe)
table subscriptions (
  parent_id uuid pk references profiles_parent on delete cascade,
  stripe_sub_id text,
  status text,                  -- active|trialing|past_due|canceled
  current_period_end timestamptz,
  cancel_at timestamptz
)

-- eventos para email semanal y depuración
table events (
  id bigserial pk,
  parent_id uuid,
  child_id uuid,
  type text,                    -- lesson_started|lesson_completed|...
  payload jsonb,
  created_at timestamptz default now()
)
```

**RLS** clave: el padre sólo lee/escribe sus propios `profiles_child` y
sus `child_progress` vía `parent_id`. El niño no autentica
directamente — opera bajo la sesión del padre con un selector de
perfil en cliente.

---

## 6. Engine de lecciones (contrato)

Cada lección es un objeto declarativo en TS, validado por Zod. La UI es
una sola máquina de estados (`LessonRunner`) que ejecuta los pasos.

```ts
type LessonStep =
  | { kind: 'intro'; title: string; narration: string; mascotState: MascotState }
  | { kind: 'demo'; notes: NoteSeq; tempoBpm: number }
  | { kind: 'exercise'; exercise: Exercise }
  | { kind: 'celebration'; medalId?: string };

type Exercise =
  | { type: 'find_note'; target: Note; hintAfterMs?: number }
  | { type: 'repeat_pattern'; pattern: NoteSeq; tolerance: number }
  | { type: 'play_song'; score: NoteSeq; tempoBpm: number; passThreshold: number };
```

Validación MIDI uniforme:
- evento `noteOn` → `lib/midi/engine.ts` → store → `LessonRunner` evalúa.
- Sin MIDI: `VirtualKeyboard` emite los mismos eventos `noteOn`.

---

## 7. Cumplimiento legal — checklist mínima

- [ ] Pantalla de **consentimiento parental** en registro: marca temporal, IP, email.
- [ ] **Doble opt-in** por email (Resend) antes de habilitar perfiles de niños.
- [ ] Política de privacidad y T&C en español, accesibles desde footer y onboarding.
- [ ] Página `/para-padres` con qué datos recolectamos y por qué.
- [ ] Botón **"Borrar cuenta"** en `/padres/cuenta` que ejecuta cascade real.
- [ ] Botón **"Exportar mis datos"** (JSON) — GDPR-K.
- [ ] Plausible self-host o cloud sin cookies; **sin GA, sin Meta Pixel**.
- [ ] No recolectar email, foto, voz ni dirección del niño.
- [ ] Sin chat, sin contenido generado por usuarios visible a otros.
- [ ] Banner cookies sólo si hace falta (Plausible no requiere).
- [ ] **Recomendar al usuario revisar con abogado antes del cobro real.**

---

## 8. Cronograma 8 semanas (con DoD por semana)

### Semana 1 — Fundamentos técnicos
- Repo, Next.js + TS + Tailwind + shadcn, ESLint + Prettier, CI básico.
- Supabase: proyecto, migraciones iniciales, RLS.
- Auth de padre (email/pass + magic link), middleware.
- `VirtualKeyboard` MVP (sin lecciones aún) + `lib/audio/engine.ts`.
- `lib/midi/engine.ts` con detección y `MidiStatus`.
- **DoD:** entrar, ver teclado virtual, sonar Tone.js, ver "MIDI conectado/no".

### Semana 2 — Onboarding y modelo de datos
- 5 pantallas de onboarding con persistencia en Supabase.
- `profiles_child` y selector de perfil.
- Consentimiento parental + doble opt-in por email.
- Mascota base + 3 estados (idle, celebrando, animando).
- **DoD:** crear cuenta → confirmar email → crear niño → llegar a /nino/inicio.

### Semana 3 — Engine de lecciones
- `LessonRunner` máquina de estados.
- 3 tipos de ejercicio funcionando (con MIDI y con teclado virtual).
- Lecciones 1-2 completas con narración.
- Sistema de estrellas.
- **DoD:** completar lección 1 con MIDI y sin MIDI, ver estrellas guardadas.

### Semana 4 — Contenido módulo 1 + medallas
- Lecciones 3-5 completas.
- Medallas + animaciones de celebración.
- Vitrina de logros para el niño.
- Modo "lluvia de notas" (Synthesia) básico para `play_song`.
- **DoD:** módulo 1 completo, niño beta lo termina sin atascarse.

### Semana 5 — Padres y monetización
- Dashboard de padres: progreso semanal, medallas, gráfica.
- Stripe Checkout + Webhook + sincronización a Supabase.
- Paywall en lección 6 + página `/padres/suscripcion`.
- **DoD:** comprar premium en Stripe test desbloquea lección 6.

### Semana 6 — Módulo 2 + emails
- Lecciones 6-10.
- Email de bienvenida + email semanal con resumen (Resend + React Email).
- Compartir progreso (imagen OG para WhatsApp).
- **DoD:** un niño beta puede llegar al "primer concierto".

### Semana 7 — Pulido + legal + PWA
- PWA installable + service worker básico.
- Política de privacidad, T&C, página para padres.
- Borrar cuenta + exportar datos.
- Plausible integrado.
- Tests Playwright del onboarding y de una lección.
- Pasada de QA: Chrome + Edge (con MIDI), iPad + Android (sin MIDI).
- **DoD:** lighthouse > 90 perf/accesibilidad, e2e verde.

### Semana 8 — Lanzamiento beta cerrada
- Deploy producción Vercel + dominio.
- 10-20 invitaciones beta + dashboard interno de métricas.
- Botón flotante de feedback (a Resend o tabla `events`).
- **DoD:** primer pago real en Stripe live, ≥5 niños han completado lección 1.

---

## 9. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| MIDI no conecta en Windows/Edge para algún teclado | Media | Tutorial visual + fallback teclado virtual + lista de teclados validados. |
| Latencia audio en navegador frustra al niño | Media | Tone.js con `lookAhead` reducido + samples cortos + warm-up al primer click. |
| Padres no entienden el valor → no convierten | Alta | Email semanal con progreso real + imagen para WhatsApp + paywall en momento dulce (lección 5 → 6). |
| Cumplimiento COPPA/GDPR-K incompleto | Alta | Beta cerrada por invitación; abogado antes de abrir registro público. |
| Coste TTS si crece el catálogo | Baja | Pre-generar y cachear en Supabase Storage; sin TTS en runtime. |
| Inestabilidad de Web MIDI en Chromium | Baja | Reconectar automáticamente; mostrar estado siempre visible. |

---

## 10. Métricas y eventos a instrumentar

Plausible custom events (sin PII):
- `signup_completed`
- `consent_signed`
- `child_profile_created`
- `lesson_started` (props: `lesson_id`)
- `lesson_completed` (props: `lesson_id`, `stars`)
- `paywall_seen`
- `checkout_started`
- `subscription_active`
- `account_deleted`

Para los KPIs del spec:
- **Activación** = `lesson_completed` con `lesson_id=m1l1` ≤ 24h tras `signup_completed`.
- **Retención D7** = sesión ≥7 días después del signup.
- **Conversión** = `subscription_active` / `signup_completed` por cohorte semanal.

---

## 11. Próximos pasos inmediatos

1. **Tú** respondes D1–D12 (al menos D1, D3, D5, D7, D8, D11, D12 son
   bloqueantes; el resto puedo asumir el default propuesto).
2. **Yo** creo cuentas placeholders en `.env.example`, hago commit del
   plan, y arranco la **Semana 1** sólo cuando confirmes.
3. Cierro cada semana con: commit limpio, resumen + cómo probarlo
   manualmente, y siguiente paso.
