"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Pause, Play } from "lucide-react";
const MotionContext = createContext({
  enabled: false,
  reduced: false,
  paused: false,
  toggle: () => {},
});
const query = "(prefers-reduced-motion: reduce)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export function useMotion() {
  return useContext(MotionContext);
}
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
  const [paused, setPaused] = useState(false);
  const enabled = !paused && !reduced;
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let cleanup = () => {};
    void Promise.all([import("lenis"), import("gsap")])
      .then(([{ default: Lenis }, { gsap }]) => {
        if (disposed) return;
        const lenis = new Lenis({
          lerp: 0.1,
          smoothWheel: true,
          syncTouch: false,
          anchors: { offset: -28 },
          prevent: (node) => ["SELECT", "TEXTAREA"].includes(node.tagName),
        });
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        cleanup = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      })
      .catch(() => {
        /* Native scrolling remains available if enhancement fails. */
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [enabled]);
  return (
    <MotionContext.Provider
      value={{ enabled, reduced, paused, toggle: () => setPaused((v) => !v) }}
    >
      {children}
    </MotionContext.Provider>
  );
}
export function MotionToggle() {
  const { enabled, reduced, toggle } = useMotion();
  return (
    <button
      className="motion-toggle"
      onClick={toggle}
      disabled={reduced}
      aria-label={
        reduced
          ? "Reduced motion is enabled"
          : enabled
            ? "Pause animations"
            : "Enable animations"
      }
      aria-pressed={!enabled}
    >
      {enabled ? <Pause size={13} /> : <Play size={13} />}
      <span>
        {reduced ? "Reduced motion" : enabled ? "Motion on" : "Motion off"}
      </span>
    </button>
  );
}
