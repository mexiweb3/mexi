"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { ensureAudio, playMidi } from "@/lib/audio/engine";
import {
  type LabelMode,
  midiToNote,
  noteLabel,
  SOLFEGE,
} from "@/lib/types/music";

type Props = {
  startMidi?: number;
  octaves?: number;
  labelMode?: LabelMode;
  highlightedMidis?: number[];
  activeMidisExternal?: number[];
  onNoteOn?: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
  enableComputerKeyboard?: boolean;
  className?: string;
};

const WHITE_KEY_HINTS = [
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  ";",
  "'",
];
const BLACK_KEY_HINTS = ["W", "E", "T", "Y", "U"];

const WHITE_KEY_CODES = [
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
  "Semicolon",
  "Quote",
];
const BLACK_KEY_CODES = ["KeyW", "KeyE", "KeyT", "KeyY", "KeyU"];

type KeyInfo = {
  midi: number;
  isBlack: boolean;
  whiteIndex: number;
  blackIndex: number;
};

function buildKeys(startMidi: number, octaves: number): KeyInfo[] {
  const total = octaves * 12;
  const keys: KeyInfo[] = [];
  let whiteIndex = 0;
  let blackIndex = 0;
  for (let i = 0; i < total; i++) {
    const midi = startMidi + i;
    const isBlack = midiToNote(midi).isBlack;
    keys.push({
      midi,
      isBlack,
      whiteIndex: isBlack ? -1 : whiteIndex,
      blackIndex: isBlack ? blackIndex : -1,
    });
    if (isBlack) blackIndex++;
    else whiteIndex++;
  }
  return keys;
}

function ariaForMidi(midi: number): string {
  const note = midiToNote(midi);
  const sol = SOLFEGE[note.name];
  return `${sol} ${note.octave}`;
}

export default function VirtualKeyboard({
  startMidi = 48,
  octaves = 2,
  labelMode = "es",
  highlightedMidis,
  activeMidisExternal,
  onNoteOn,
  onNoteOff,
  enableComputerKeyboard = true,
  className,
}: Props) {
  const keys = useMemo(
    () => buildKeys(startMidi, octaves),
    [startMidi, octaves],
  );
  const whiteKeys = useMemo(() => keys.filter((k) => !k.isBlack), [keys]);
  const blackKeys = useMemo(() => keys.filter((k) => k.isBlack), [keys]);

  const [activeLocal, setActiveLocal] = useState<Set<number>>(new Set());
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fineMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateFine = () => setHasFinePointer(fineMq.matches);
    const updateMotion = () => setReducedMotion(motionMq.matches);
    updateFine();
    updateMotion();
    fineMq.addEventListener("change", updateFine);
    motionMq.addEventListener("change", updateMotion);
    return () => {
      fineMq.removeEventListener("change", updateFine);
      motionMq.removeEventListener("change", updateMotion);
    };
  }, []);

  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  const keysRef = useRef(keys);
  useEffect(() => {
    onNoteOnRef.current = onNoteOn;
    onNoteOffRef.current = onNoteOff;
    keysRef.current = keys;
  }, [onNoteOn, onNoteOff, keys]);

  const pressMidi = useCallback(async (midi: number) => {
    await ensureAudio();
    playMidi(midi);
    setActiveLocal((prev) => {
      if (prev.has(midi)) return prev;
      const next = new Set(prev);
      next.add(midi);
      return next;
    });
    onNoteOnRef.current?.(midi);
  }, []);

  const releaseMidi = useCallback((midi: number) => {
    setActiveLocal((prev) => {
      if (!prev.has(midi)) return prev;
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
    onNoteOffRef.current?.(midi);
  }, []);

  useEffect(() => {
    if (!enableComputerKeyboard) return;
    if (typeof window === "undefined") return;

    const heldCodes = new Set<string>();

    const codeToMidi = (code: string): number | null => {
      const wIdx = WHITE_KEY_CODES.indexOf(code);
      if (wIdx >= 0) {
        const k = keysRef.current.filter((x) => !x.isBlack)[wIdx];
        return k ? k.midi : null;
      }
      const bIdx = BLACK_KEY_CODES.indexOf(code);
      if (bIdx >= 0) {
        const k = keysRef.current.filter((x) => x.isBlack)[bIdx];
        return k ? k.midi : null;
      }
      return null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      const midi = codeToMidi(e.code);
      if (midi === null) return;
      if (heldCodes.has(e.code)) return;
      heldCodes.add(e.code);
      e.preventDefault();
      void pressMidi(midi);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const midi = codeToMidi(e.code);
      if (midi === null) return;
      heldCodes.delete(e.code);
      releaseMidi(midi);
    };

    const onBlur = () => {
      for (const code of heldCodes) {
        const midi = codeToMidi(code);
        if (midi !== null) releaseMidi(midi);
      }
      heldCodes.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [enableComputerKeyboard, pressMidi, releaseMidi]);

  const highlightedSet = useMemo(
    () => new Set(highlightedMidis ?? []),
    [highlightedMidis],
  );
  const externalSet = useMemo(
    () => new Set(activeMidisExternal ?? []),
    [activeMidisExternal],
  );

  const isActive = (midi: number) =>
    activeLocal.has(midi) || externalSet.has(midi);
  const isHighlighted = (midi: number) => highlightedSet.has(midi);

  const whiteCount = whiteKeys.length;
  const whiteWidthPct = 100 / whiteCount;
  const blackWidthPct = whiteWidthPct * 0.6;

  const blackOffsetForBlackIndex = (blackIdx: number): number => {
    const black = blackKeys[blackIdx];
    if (!black) return 0;
    const prevWhite = whiteKeys.findIndex((w) => w.midi > black.midi) - 1;
    const whitePos = prevWhite < 0 ? whiteKeys.length - 1 : prevWhite;
    const center = (whitePos + 1) * whiteWidthPct;
    return center - blackWidthPct / 2;
  };

  const handleDown = (midi: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLButtonElement).setPointerCapture?.(e.pointerId);
    void pressMidi(midi);
  };

  const handleUp = (midi: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    releaseMidi(midi);
  };

  const whiteHintFor = (whiteIdx: number): string | null => {
    if (!enableComputerKeyboard || !hasFinePointer) return null;
    return WHITE_KEY_HINTS[whiteIdx] ?? null;
  };

  const blackHintFor = (blackIdx: number): string | null => {
    if (!enableComputerKeyboard || !hasFinePointer) return null;
    return BLACK_KEY_HINTS[blackIdx] ?? null;
  };

  const pulseClass =
    !reducedMotion ? "animate-[pulse_1.6s_ease-in-out_infinite]" : "";

  return (
    <div
      className={cn(
        "w-full overflow-x-auto snap-x",
        "[scrollbar-width:thin]",
        className,
      )}
    >
      <div
        className="relative mx-auto select-none touch-none"
        style={{
          minWidth: `${whiteCount * 60}px`,
          height: "min(40vh, 280px)",
          minHeight: "180px",
        }}
      >
        <div className="absolute inset-0 flex">
          {whiteKeys.map((k) => {
            const active = isActive(k.midi);
            const highlighted = isHighlighted(k.midi);
            const note = midiToNote(k.midi);
            const label = noteLabel(note, labelMode);
            const hint = whiteHintFor(k.whiteIndex);
            return (
              <button
                key={k.midi}
                type="button"
                aria-label={ariaForMidi(k.midi)}
                aria-pressed={active}
                onPointerDown={handleDown(k.midi)}
                onPointerUp={handleUp(k.midi)}
                onPointerCancel={handleUp(k.midi)}
                onPointerLeave={(e) => {
                  if (activeLocal.has(k.midi) && e.buttons > 0) {
                    releaseMidi(k.midi);
                  }
                }}
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-end",
                  "snap-start",
                  "border border-r-0 last:border-r border-[#d8c7a0]",
                  "rounded-b-xl",
                  "shadow-[0_2px_0_rgba(0,0,0,0.08)]",
                  "transition-colors duration-75",
                  "min-h-[180px]",
                  "pb-2",
                  active
                    ? "bg-[#ffd87a]"
                    : highlighted
                      ? "bg-[#ffe9b8]"
                      : "bg-[#fffaf0] hover:bg-brand-50",
                  highlighted && pulseClass,
                  highlighted &&
                    "ring-2 ring-brand-300 ring-offset-1 ring-offset-brand-50",
                )}
                style={{
                  minWidth: "60px",
                }}
              >
                {hint ? (
                  <span
                    aria-hidden
                    className="absolute top-2 text-[10px] font-semibold text-brand-600/70"
                  >
                    {hint}
                  </span>
                ) : null}
                {labelMode !== "off" ? (
                  <span
                    aria-hidden
                    className="hidden min-[600px]:block text-[11px] font-medium text-brand-800/80"
                  >
                    {label}
                    <span className="ml-0.5 text-[9px] text-brand-700/60">
                      {note.octave}
                    </span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {blackKeys.map((k) => {
            const left = blackOffsetForBlackIndex(k.blackIndex);
            const active = isActive(k.midi);
            const highlighted = isHighlighted(k.midi);
            const note = midiToNote(k.midi);
            const label = noteLabel(note, labelMode);
            const hint = blackHintFor(k.blackIndex);
            return (
              <button
                key={k.midi}
                type="button"
                aria-label={ariaForMidi(k.midi)}
                aria-pressed={active}
                onPointerDown={handleDown(k.midi)}
                onPointerUp={handleUp(k.midi)}
                onPointerCancel={handleUp(k.midi)}
                onPointerLeave={(e) => {
                  if (activeLocal.has(k.midi) && e.buttons > 0) {
                    releaseMidi(k.midi);
                  }
                }}
                className={cn(
                  "absolute top-0 pointer-events-auto",
                  "rounded-b-lg",
                  "border border-black/40",
                  "shadow-[0_3px_0_rgba(0,0,0,0.35)]",
                  "transition-colors duration-75",
                  "flex flex-col items-center justify-end pb-1",
                  active
                    ? "bg-[#995800]"
                    : highlighted
                      ? "bg-[#cc7600]"
                      : "bg-[#2a1f10] hover:bg-[#3a2c18]",
                  highlighted && pulseClass,
                  highlighted &&
                    "ring-2 ring-brand-400 ring-offset-1 ring-offset-brand-900",
                )}
                style={{
                  left: `${left}%`,
                  width: `${blackWidthPct}%`,
                  height: "62%",
                  minWidth: "32px",
                }}
              >
                {hint ? (
                  <span
                    aria-hidden
                    className="absolute top-1 text-[10px] font-semibold text-brand-100/85"
                  >
                    {hint}
                  </span>
                ) : null}
                {labelMode !== "off" ? (
                  <span
                    aria-hidden
                    className="hidden min-[600px]:block text-[10px] font-medium text-brand-50/90"
                  >
                    {label}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
