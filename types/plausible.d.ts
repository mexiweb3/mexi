// Ambient type declarations for the Plausible analytics snippet.
// See: https://plausible.io/docs/custom-event-goals

export {};

declare global {
  interface PlausibleOptions {
    props?: Record<string, unknown>;
    callback?: () => void;
  }

  interface PlausibleQueue {
    (eventName: string, options?: PlausibleOptions): void;
    q?: Array<IArguments>;
  }

  interface Window {
    plausible?: PlausibleQueue;
  }
}
