export type MidiEvent = {
  type: "noteOn" | "noteOff";
  midi: number;
  velocity: number;
};

export function parseMidiMessage(data: Uint8Array): MidiEvent | null {
  if (data.length < 3) return null;
  const status = data[0] & 0xf0;
  const midi = data[1];
  const rawVelocity = data[2];
  if (midi < 0 || midi > 127) return null;

  if (status === 0x90) {
    if (rawVelocity === 0) {
      return { type: "noteOff", midi, velocity: 0 };
    }
    return { type: "noteOn", midi, velocity: rawVelocity / 127 };
  }
  if (status === 0x80) {
    return { type: "noteOff", midi, velocity: rawVelocity / 127 };
  }
  return null;
}
