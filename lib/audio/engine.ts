import * as Tone from "tone";

let synth: Tone.PolySynth<Tone.Synth> | null = null;
let masterGain: Tone.Gain | null = null;
let started = false;
let volumeLinear = 0.8;

const MIN_DB = -60;
const MAX_DB = 0;

function linearToDb(vol: number): number {
  const clamped = Math.max(0, Math.min(1, vol));
  if (clamped <= 0) return MIN_DB;
  return MIN_DB + (MAX_DB - MIN_DB) * clamped;
}

function initNodes(): void {
  if (typeof window === "undefined") return;
  if (synth && masterGain) return;

  masterGain = new Tone.Gain(volumeLinear).toDestination();
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.4,
      release: 0.6,
    },
  }).connect(masterGain);
}

export async function ensureAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  initNodes();
  if (!started) {
    await Tone.start();
    started = true;
  }
  const ctx = Tone.getContext();
  if (ctx.state !== "running") {
    await ctx.resume();
  }
}

function midiToFreq(midi: number): number {
  return Tone.Frequency(midi, "midi").toFrequency();
}

function velocityToGain(velocity: number): number {
  const v = Math.max(0, Math.min(1, velocity));
  return Tone.dbToGain(linearToDb(v));
}

export function playMidi(
  midi: number,
  durationSec: number = 0.6,
  velocity: number = 0.8,
): void {
  if (typeof window === "undefined") return;
  initNodes();
  if (!synth) return;
  const freq = midiToFreq(midi);
  synth.triggerAttackRelease(freq, durationSec, undefined, velocityToGain(velocity));
}

export function playChord(midis: number[], durationSec: number = 0.6): void {
  if (typeof window === "undefined") return;
  initNodes();
  if (!synth || midis.length === 0) return;
  const freqs = midis.map(midiToFreq);
  synth.triggerAttackRelease(freqs, durationSec);
}

export async function playSequence(
  midis: number[],
  gapSec: number = 0.5,
): Promise<void> {
  if (typeof window === "undefined") return;
  initNodes();
  if (!synth) return;
  for (const midi of midis) {
    playMidi(midi, gapSec * 0.95);
    await new Promise<void>((resolve) =>
      setTimeout(resolve, Math.max(0, gapSec) * 1000),
    );
  }
}

export function setVolume(vol: number): void {
  volumeLinear = Math.max(0, Math.min(1, vol));
  if (masterGain) {
    masterGain.gain.rampTo(volumeLinear, 0.05);
  }
}

export function getVolume(): number {
  return volumeLinear;
}
