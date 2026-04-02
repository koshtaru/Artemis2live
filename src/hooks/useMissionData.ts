"use client";

import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/simulation";
import { getNextMilestone } from "@/lib/orbital";

const POLL_INTERVAL = 30_000; // 30 seconds

interface TrajectoryAPIResponse {
  met: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  dataSource: "arow" | "computed";
}

/**
 * Polls /api/trajectory when live. Updates the store with fresh data.
 * Mount once at the app root alongside useSimulationClock.
 */
export function useMissionData() {
  const isLive = useSimulationStore((s) => s.isLive);
  const syncFromAPI = useSimulationStore((s) => s.syncFromAPI);
  const met = useSimulationStore((s) => s.met);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLive) return;

    async function poll() {
      try {
        const res = await fetch("/api/trajectory");
        if (res.ok) {
          const data: TrajectoryAPIResponse = await res.json();
          syncFromAPI(data.met, data.position, data.velocity, data.dataSource);
        }
      } catch {
        // Network error — store will continue on computed trajectory via tick()
      }
      timerRef.current = setTimeout(poll, POLL_INTERVAL);
    }

    // Initial poll immediately
    poll();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLive, syncFromAPI]);

  const nextMilestone = getNextMilestone(met);
  const secondsToNextMilestone = nextMilestone ? nextMilestone.met - met : null;

  return { nextMilestone, secondsToNextMilestone };
}
