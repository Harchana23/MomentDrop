/** Tiny external store powering the global camera-shutter loader + top progress bar. */

export type LoaderState = { overlay: boolean; msg: string; bar: number; barOn: boolean };

let state: LoaderState = { overlay: false, msg: "Loading…", bar: 0, barOn: false };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const set = (patch: Partial<LoaderState>) => {
  state = { ...state, ...patch };
  emit();
};

export function subscribe(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}
export function getState(): LoaderState {
  return state;
}

let t1: ReturnType<typeof setTimeout> | undefined;
let t2: ReturnType<typeof setTimeout> | undefined;

export const loader = {
  /** Full-screen dimmed loader around real async work. */
  showLoader(msg?: string) {
    set({ overlay: true, msg: msg ?? state.msg });
  },
  hideLoader() {
    set({ overlay: false });
  },
  /** Lightweight top bar for click / navigation acknowledgement. */
  barStart() {
    clearTimeout(t1);
    clearTimeout(t2);
    set({ barOn: true, bar: 0 });
    requestAnimationFrame(() => set({ bar: 75 }));
  },
  barDone() {
    if (!state.barOn) return;
    set({ bar: 100 });
    t1 = setTimeout(() => {
      set({ barOn: false });
      t2 = setTimeout(() => set({ bar: 0 }), 340);
    }, 260);
  },
};
