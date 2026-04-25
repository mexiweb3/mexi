# mexi

Meximalist.

## Aprende Piano

Mini‑proyecto para aprender a tocar el piano: un piano virtual interactivo
en el navegador con prácticas de notas, escalas y acordes, más un plan de
estudio de 8 semanas.

### Cómo usarlo

Abre [`piano/index.html`](piano/index.html) en cualquier navegador moderno.
No requiere instalación ni servidor.

```bash
# opción rápida en local
open piano/index.html        # macOS
xdg-open piano/index.html    # Linux
```

### Qué incluye

- **Libre** · piano de 2 octavas tocable con ratón, táctil o teclado
  (`A`–`K` teclas blancas, `W E T Y U` negras). Etiquetas en notación
  inglesa (C D E…) o solfeo (Do Re Mi…).
- **Reconocer notas** · suena una nota y tienes que identificarla en el
  teclado. Lleva contador de aciertos.
- **Escalas** · resalta y reproduce mayor, menor natural, menor armónica,
  pentatónicas y blues, en cualquier tónica.
- **Acordes** · tríadas (mayor, menor, dim, aug) y séptimas (maj7, m7, 7).
- **Plan de estudio** · 8 semanas y rutina diaria de 20–30 minutos.

### Hoja de ruta del aprendizaje

1. Postura, manos relajadas, identificar Do central.
2. Cinco dedos en Do mayor, mano derecha y luego izquierda.
3. Manos juntas en paralelo y en movimiento contrario.
4. Escala mayor de Do, una octava, con cruce de pulgar.
5. Acordes I‑IV‑V (Do, Fa, Sol mayores) y cambios entre ellos.
6. Primera canción: melodía en derecha + acordes en izquierda.
7. Lectura básica en clave de sol y de fa alrededor del Do central.
8. Repertorio de memoria + improvisación con pentatónica sobre I‑V‑vi‑IV.

### Estructura

```
piano/
  index.html   # interfaz y pestañas
  styles.css
  app.js       # audio (Web Audio API), teclado, escalas y acordes
```
