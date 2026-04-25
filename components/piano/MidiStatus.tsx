"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { midiEngine } from "@/lib/midi/engine";
import { useMidiInit, useMidiStore } from "@/store/midi";

type Variant = "warning" | "neutral" | "info" | "success";

const VARIANT_CLASSES: Record<Variant, string> = {
  warning: "bg-brand-100 text-brand-900 border-brand-300",
  neutral: "bg-brand-50 text-brand-900 border-brand-200",
  info: "bg-brand-50 text-brand-900 border-brand-200",
  success: "bg-brand-300 text-brand-900 border-brand-400",
};

export default function MidiStatus({ className }: { className?: string }) {
  useMidiInit();
  const state = useMidiStore((s) => s.state);

  const view = useMemo(() => {
    if (!state.supported) {
      return {
        variant: "warning" as Variant,
        message:
          "Tu navegador no detecta el teclado MIDI. Igual puedes tocar con la pantalla.",
        showConnect: false,
        inputName: null as string | null,
      };
    }
    if (state.permission !== "granted") {
      return {
        variant: "neutral" as Variant,
        message:
          "Conecta tu teclado y toca una tecla para activarlo.",
        showConnect: true,
        inputName: null,
      };
    }
    if (state.inputs.length === 0) {
      return {
        variant: "info" as Variant,
        message: "Conecta tu teclado por cable USB.",
        showConnect: false,
        inputName: null,
      };
    }
    const active =
      state.inputs.find((i) => i.id === state.activeInputId) ??
      state.inputs[0];
    return {
      variant: "success" as Variant,
      message: null,
      showConnect: false,
      inputName: active.name || "tu teclado",
    };
  }, [state]);

  const handleConnect = () => {
    void midiEngine.start();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-3 rounded-full border px-4 py-2",
        "text-sm font-medium",
        VARIANT_CLASSES[view.variant],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-full",
          view.variant === "success"
            ? "bg-brand-700"
            : view.variant === "warning"
              ? "bg-brand-600"
              : "bg-brand-400",
        )}
      />
      {view.inputName ? (
        <span>
          {"¡Tu teclado "}
          <strong className="font-bold">{view.inputName}</strong>
          {" está listo!"}
        </span>
      ) : (
        <span>{view.message}</span>
      )}
      {view.showConnect ? (
        <button
          type="button"
          onClick={handleConnect}
          className="kid-button-secondary !py-1 !px-3 text-xs"
        >
          Conectar teclado
        </button>
      ) : null}
    </div>
  );
}
