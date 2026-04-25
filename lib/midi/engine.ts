import { parseMidiMessage, type MidiEvent } from "./normalize";

export { parseMidiMessage };
export type { MidiEvent };

export type MidiInputInfo = {
  id: string;
  name: string;
  manufacturer: string;
};

export type MidiState = {
  supported: boolean;
  permission: "unknown" | "granted" | "denied";
  inputs: MidiInputInfo[];
  activeInputId: string | null;
};

type StateListener = (state: MidiState) => void;
type EventListener = (event: MidiEvent) => void;

type WebMidiAccess = MIDIAccess;
type WebMidiInput = MIDIInput;

export class MidiEngine {
  state: MidiState = {
    supported: false,
    permission: "unknown",
    inputs: [],
    activeInputId: null,
  };

  private access: WebMidiAccess | null = null;
  private stateListeners = new Set<StateListener>();
  private eventListeners = new Set<EventListener>();
  private boundInputs = new Set<string>();
  private started = false;

  subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  async start(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    const nav = navigator as Navigator & {
      requestMIDIAccess?: (
        options?: MIDIOptions,
      ) => Promise<MIDIAccess>;
    };
    if (typeof nav.requestMIDIAccess !== "function") {
      this.state = { ...this.state, supported: false };
      this.emitState();
      return;
    }

    this.state = { ...this.state, supported: true };

    try {
      const access = await nav.requestMIDIAccess({ sysex: false });
      this.access = access;
      this.state = { ...this.state, permission: "granted" };
      access.onstatechange = () => {
        this.refreshInputs();
      };
      this.refreshInputs();
      this.started = true;
    } catch {
      this.state = { ...this.state, permission: "denied" };
      this.emitState();
    }
  }

  async setActiveInput(id: string | null): Promise<void> {
    if (!this.access) {
      this.state = { ...this.state, activeInputId: id };
      this.emitState();
      return;
    }
    this.detachAllInputs();
    if (id === null) {
      this.state = { ...this.state, activeInputId: null };
      this.emitState();
      return;
    }
    const input = this.access.inputs.get(id);
    if (!input) {
      this.state = { ...this.state, activeInputId: null };
      this.emitState();
      return;
    }
    this.attachInput(input);
    this.state = { ...this.state, activeInputId: id };
    this.emitState();
  }

  stop(): void {
    this.detachAllInputs();
    if (this.access) {
      this.access.onstatechange = null;
    }
    this.access = null;
    this.started = false;
    this.state = {
      ...this.state,
      inputs: [],
      activeInputId: null,
    };
    this.emitState();
  }

  private refreshInputs(): void {
    if (!this.access) return;
    const inputs: MidiInputInfo[] = [];
    for (const input of this.access.inputs.values()) {
      inputs.push({
        id: input.id,
        name: input.name ?? "",
        manufacturer: input.manufacturer ?? "",
      });
    }

    let activeInputId = this.state.activeInputId;
    if (activeInputId && !this.access.inputs.has(activeInputId)) {
      activeInputId = null;
      this.detachAllInputs();
    }

    if (!activeInputId && inputs.length > 0) {
      const first = this.access.inputs.get(inputs[0].id);
      if (first) {
        this.attachInput(first);
        activeInputId = first.id;
      }
    } else if (activeInputId) {
      const current = this.access.inputs.get(activeInputId);
      if (current && !this.boundInputs.has(current.id)) {
        this.attachInput(current);
      }
    }

    this.state = { ...this.state, inputs, activeInputId };
    this.emitState();
  }

  private attachInput(input: WebMidiInput): void {
    input.onmidimessage = (event) => {
      const data = (event as MIDIMessageEvent).data;
      if (!data) return;
      const parsed = parseMidiMessage(data);
      if (!parsed) return;
      for (const listener of this.eventListeners) {
        listener(parsed);
      }
    };
    this.boundInputs.add(input.id);
  }

  private detachAllInputs(): void {
    if (!this.access) {
      this.boundInputs.clear();
      return;
    }
    for (const id of this.boundInputs) {
      const input = this.access.inputs.get(id);
      if (input) {
        input.onmidimessage = null;
      }
    }
    this.boundInputs.clear();
  }

  private emitState(): void {
    for (const listener of this.stateListeners) {
      listener(this.state);
    }
  }
}

export const midiEngine = new MidiEngine();
export default midiEngine;
