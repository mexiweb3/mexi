"use client";

import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import KeyboardMidiBridge from "./KeyboardMidiBridge";
import MidiStatus from "./MidiStatus";
import VirtualKeyboard from "./VirtualKeyboard";

type VirtualKeyboardProps = ComponentProps<typeof VirtualKeyboard>;

type Props = Omit<VirtualKeyboardProps, "activeMidisExternal"> & {
  stageClassName?: string;
};

export default function PianoStage({
  stageClassName,
  className,
  ...keyboardProps
}: Props) {
  return (
    <div className={cn("flex flex-col gap-4", stageClassName)}>
      <div className="flex flex-wrap items-center gap-2">
        <MidiStatus />
      </div>
      <KeyboardMidiBridge>
        {(active) => (
          <VirtualKeyboard
            {...keyboardProps}
            className={className}
            activeMidisExternal={active}
          />
        )}
      </KeyboardMidiBridge>
    </div>
  );
}
