"use strict";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SOLFEO = {
  "C": "Do", "C#": "Do#", "D": "Re", "D#": "Re#", "E": "Mi",
  "F": "Fa", "F#": "Fa#", "G": "Sol", "G#": "Sol#",
  "A": "La", "A#": "La#", "B": "Si",
};
const WHITE_PATTERN = ["C", "D", "E", "F", "G", "A", "B"];
// Computer-keyboard mapping for two-octave window starting at base octave.
const KEY_MAP_WHITE = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"];
const KEY_MAP_BLACK = { "C#": "w", "D#": "e", "F#": "t", "G#": "y", "A#": "u" };

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
};
const CHORDS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
};

// ---- Audio ----
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playMidi(midi, duration = 0.7) {
  const ctx = ensureAudio();
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const vol = parseFloat(document.getElementById("volume").value);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);
  gain.connect(ctx.destination);

  const freq = midiToFreq(midi);
  // Mix of triangle + sine for a soft piano-ish tone.
  const o1 = ctx.createOscillator();
  o1.type = "triangle";
  o1.frequency.value = freq;
  o1.connect(gain);
  const o2 = ctx.createOscillator();
  o2.type = "sine";
  o2.frequency.value = freq * 2;
  const g2 = ctx.createGain();
  g2.gain.value = 0.15;
  o2.connect(g2).connect(gain);
  o1.start(now);
  o2.start(now);
  o1.stop(now + duration);
  o2.stop(now + duration);
}

function playSequence(midis, gap = 0.35) {
  midis.forEach((m, i) => setTimeout(() => playMidi(m, 0.5), i * gap * 1000));
}
function playChord(midis, duration = 1.2) {
  midis.forEach((m) => playMidi(m, duration));
}

// ---- Piano build ----
const BASE_OCTAVE_DEFAULT = 4;
const NUM_OCTAVES = 2;
let baseOctave = BASE_OCTAVE_DEFAULT;
let pianoEl = null;
const keyEls = new Map(); // midi -> element

function midiOf(noteName, octave) {
  const idx = NOTE_NAMES.indexOf(noteName);
  return 12 * (octave + 1) + idx;
}

function buildPiano() {
  pianoEl = document.getElementById("piano");
  pianoEl.innerHTML = "";
  keyEls.clear();

  const totalWhite = NUM_OCTAVES * 7 + 1; // include final C
  // Place white keys.
  const whites = [];
  for (let o = 0; o < NUM_OCTAVES; o++) {
    for (const w of WHITE_PATTERN) whites.push({ name: w, octave: baseOctave + o });
  }
  whites.push({ name: "C", octave: baseOctave + NUM_OCTAVES });

  whites.forEach((w, i) => {
    const midi = midiOf(w.name, w.octave);
    const el = document.createElement("div");
    el.className = "key white";
    el.dataset.midi = midi;
    el.innerHTML = `<span class="kb"></span><span class="label"></span>`;
    el.addEventListener("mousedown", (e) => { e.preventDefault(); pressKey(midi); });
    el.addEventListener("mouseup", () => releaseKey(midi));
    el.addEventListener("mouseleave", () => releaseKey(midi));
    el.addEventListener("touchstart", (e) => { e.preventDefault(); pressKey(midi); }, { passive: false });
    el.addEventListener("touchend", () => releaseKey(midi));
    pianoEl.appendChild(el);
    keyEls.set(midi, el);
  });

  // Place black keys absolutely positioned over the gaps.
  const blackOffsets = { "C#": 0, "D#": 1, "F#": 3, "G#": 4, "A#": 5 };
  const whiteCount = whites.length;
  const whiteWidthPct = 100 / whiteCount;
  for (let o = 0; o < NUM_OCTAVES; o++) {
    for (const [name, idx] of Object.entries(blackOffsets)) {
      const octave = baseOctave + o;
      const midi = midiOf(name, octave);
      const el = document.createElement("div");
      el.className = "key black";
      el.dataset.midi = midi;
      // Black key sits straddling the boundary between white idx and idx+1.
      const leftWhiteIndex = o * 7 + idx;
      const left = (leftWhiteIndex + 1) * whiteWidthPct;
      el.style.left = `calc(${left}% - 2%)`;
      el.innerHTML = `<span class="kb"></span><span class="label"></span>`;
      el.addEventListener("mousedown", (e) => { e.preventDefault(); pressKey(midi); });
      el.addEventListener("mouseup", () => releaseKey(midi));
      el.addEventListener("mouseleave", () => releaseKey(midi));
      el.addEventListener("touchstart", (e) => { e.preventDefault(); pressKey(midi); }, { passive: false });
      el.addEventListener("touchend", () => releaseKey(midi));
      pianoEl.appendChild(el);
      keyEls.set(midi, el);
    }
  }

  applyLabels();
  applyKbHints();
}

function applyLabels() {
  const showLabels = document.getElementById("show-labels").checked;
  const useSolfeo = document.getElementById("use-solfeo").checked;
  for (const [midi, el] of keyEls) {
    const noteName = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    const display = useSolfeo ? SOLFEO[noteName] : noteName;
    const labelEl = el.querySelector(".label");
    if (showLabels) {
      labelEl.textContent = el.classList.contains("white") ? `${display}${octave}` : display;
    } else {
      labelEl.textContent = "";
    }
  }
}

function applyKbHints() {
  // Map keyboard to first octave window of the piano.
  for (const el of keyEls.values()) {
    const kb = el.querySelector(".kb");
    if (kb) kb.textContent = "";
  }
  // Whites: a s d f g h j (octave 1), k l ; ' (start of octave 2 + final C)
  const whiteKeysInPiano = [];
  for (const [midi, el] of keyEls) {
    if (el.classList.contains("white")) whiteKeysInPiano.push({ midi, el });
  }
  whiteKeysInPiano.sort((a, b) => a.midi - b.midi);
  whiteKeysInPiano.slice(0, KEY_MAP_WHITE.length).forEach(({ el }, i) => {
    el.querySelector(".kb").textContent = KEY_MAP_WHITE[i].toUpperCase();
  });

  for (const [name, key] of Object.entries(KEY_MAP_BLACK)) {
    const midi = midiOf(name, baseOctave);
    const el = keyEls.get(midi);
    if (el) el.querySelector(".kb").textContent = key.toUpperCase();
  }
}

const activeKeys = new Set();
function pressKey(midi) {
  const el = keyEls.get(midi);
  if (!el) return;
  el.classList.add("active");
  if (!activeKeys.has(midi)) {
    activeKeys.add(midi);
    playMidi(midi, 0.9);
    onUserPlayedNote(midi);
  }
}
function releaseKey(midi) {
  const el = keyEls.get(midi);
  if (!el) return;
  el.classList.remove("active");
  activeKeys.delete(midi);
}

// Keyboard input
const keyboardDown = new Set();
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (keyboardDown.has(k)) return;
  const midi = keyboardKeyToMidi(k);
  if (midi != null) {
    keyboardDown.add(k);
    pressKey(midi);
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  const midi = keyboardKeyToMidi(k);
  if (midi != null) {
    keyboardDown.delete(k);
    releaseKey(midi);
  }
});

function keyboardKeyToMidi(k) {
  const wIdx = KEY_MAP_WHITE.indexOf(k);
  if (wIdx >= 0) {
    // Map sequentially to the available white keys.
    const whites = [];
    for (const [midi, el] of keyEls) {
      if (el.classList.contains("white")) whites.push(midi);
    }
    whites.sort((a, b) => a - b);
    return whites[wIdx] ?? null;
  }
  for (const [name, key] of Object.entries(KEY_MAP_BLACK)) {
    if (key === k) return midiOf(name, baseOctave);
  }
  return null;
}

// ---- Tabs ----
document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    document.getElementById("panel-" + t.dataset.tab).classList.add("active");
    clearHighlights();
  });
});

// ---- Settings ----
document.getElementById("show-labels").addEventListener("change", applyLabels);
document.getElementById("use-solfeo").addEventListener("change", () => {
  applyLabels();
  refreshScaleNotes();
  refreshChordNotes();
});
document.getElementById("octave").addEventListener("change", (e) => {
  baseOctave = parseInt(e.target.value, 10);
  buildPiano();
});

// ---- Note recognition ----
let notasTarget = null;
let notasCorrect = 0;
let notasTotal = 0;
const notasPromptEl = document.getElementById("notas-prompt");
const notasScoreEl = document.getElementById("notas-score");

document.getElementById("notas-start").addEventListener("click", () => {
  notasCorrect = 0;
  notasTotal = 0;
  updateNotasScore();
  nextNotaPrompt();
});

function nextNotaPrompt() {
  // Random white-key note within current piano range.
  const whites = [];
  for (const [midi, el] of keyEls) {
    if (el.classList.contains("white")) whites.push(midi);
  }
  notasTarget = whites[Math.floor(Math.random() * whites.length)];
  playMidi(notasTarget, 1.0);
  notasPromptEl.textContent = "¿Qué nota suena?";
}

function onUserPlayedNote(midi) {
  // Note recognition mode.
  const isNotasActive = document.getElementById("panel-notas").classList.contains("active");
  if (!isNotasActive || notasTarget == null) return;
  notasTotal++;
  if (midi === notasTarget) {
    notasCorrect++;
    notasPromptEl.textContent = `¡Bien! Era ${nameOfMidi(notasTarget)}.`;
    notasTarget = null;
    setTimeout(nextNotaPrompt, 700);
  } else {
    notasPromptEl.textContent = `No: era ${nameOfMidi(notasTarget)}, tocaste ${nameOfMidi(midi)}. Otra…`;
    setTimeout(() => {
      if (notasTarget != null) playMidi(notasTarget, 1.0);
    }, 600);
  }
  updateNotasScore();
}

function updateNotasScore() {
  notasScoreEl.textContent = `${notasCorrect} / ${notasTotal}`;
}

function nameOfMidi(midi) {
  const useSolfeo = document.getElementById("use-solfeo").checked;
  const n = NOTE_NAMES[midi % 12];
  return useSolfeo ? SOLFEO[n] : n;
}

// ---- Scales / Chords ----
function fillRootSelects() {
  for (const id of ["scale-root", "chord-root"]) {
    const sel = document.getElementById(id);
    sel.innerHTML = "";
    NOTE_NAMES.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n + " / " + SOLFEO[n];
      sel.appendChild(opt);
    });
    sel.value = "C";
  }
}

function clearHighlights() {
  for (const el of keyEls.values()) el.classList.remove("highlight");
}

function highlightMidis(midis) {
  clearHighlights();
  for (const m of midis) {
    const el = keyEls.get(m);
    if (el) el.classList.add("highlight");
  }
}

function scaleMidis(rootName, type, octave = baseOctave) {
  const intervals = SCALES[type];
  const rootMidi = midiOf(rootName, octave);
  const out = intervals.map((i) => rootMidi + i);
  out.push(rootMidi + 12);
  return out;
}

function chordMidis(rootName, quality, octave = baseOctave) {
  const intervals = CHORDS[quality];
  const rootMidi = midiOf(rootName, octave);
  return intervals.map((i) => rootMidi + i);
}

function refreshScaleNotes() {
  const root = document.getElementById("scale-root").value;
  const type = document.getElementById("scale-type").value;
  const midis = scaleMidis(root, type);
  document.getElementById("scale-notes").textContent =
    midis.map(nameOfMidi).join("  –  ");
}
function refreshChordNotes() {
  const root = document.getElementById("chord-root").value;
  const q = document.getElementById("chord-quality").value;
  const midis = chordMidis(root, q);
  document.getElementById("chord-notes").textContent =
    midis.map(nameOfMidi).join("  –  ");
}

document.getElementById("scale-show").addEventListener("click", () => {
  const root = document.getElementById("scale-root").value;
  const type = document.getElementById("scale-type").value;
  const midis = scaleMidis(root, type);
  highlightMidis(midis);
  refreshScaleNotes();
});
document.getElementById("scale-play").addEventListener("click", () => {
  const root = document.getElementById("scale-root").value;
  const type = document.getElementById("scale-type").value;
  playSequence(scaleMidis(root, type));
});
document.getElementById("chord-show").addEventListener("click", () => {
  const root = document.getElementById("chord-root").value;
  const q = document.getElementById("chord-quality").value;
  const midis = chordMidis(root, q);
  highlightMidis(midis);
  refreshChordNotes();
});
document.getElementById("chord-play").addEventListener("click", () => {
  const root = document.getElementById("chord-root").value;
  const q = document.getElementById("chord-quality").value;
  playChord(chordMidis(root, q));
});
document.getElementById("scale-root").addEventListener("change", refreshScaleNotes);
document.getElementById("scale-type").addEventListener("change", refreshScaleNotes);
document.getElementById("chord-root").addEventListener("change", refreshChordNotes);
document.getElementById("chord-quality").addEventListener("change", refreshChordNotes);

// ---- Init ----
buildPiano();
fillRootSelects();
refreshScaleNotes();
refreshChordNotes();
