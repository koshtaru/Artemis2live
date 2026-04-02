"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/store/simulation";

/**
 * Drives the simulation forward at 1-second intervals.
 * Respects isLive (wall-clock) and playbackSpeed (scrub mode).
 * Mount this once at the root of the app.
 */
export function useSimulationClock() {
  const tick = useSimulationStore((s) => s.tick);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);
}
