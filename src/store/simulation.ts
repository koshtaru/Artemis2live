"use client";

import { create } from "zustand";
import { Vec3, MissionPhase, TelemetrySnapshot } from "@/config/types";
import { interpolateTrajectory, computeTelemetry, getPhase } from "@/lib/orbital";
import mission from "@/config/artemis-ii";

export interface SimulationStore {
  // Time
  met: number;
  isLive: boolean;
  playbackSpeed: number;

  // Derived state (updated on each tick)
  position: Vec3;
  velocity: Vec3;
  phase: MissionPhase;
  phaseLabel: string;
  phaseColor: string;
  telemetry: TelemetrySnapshot;
  dataSource: "arow" | "computed";

  // Actions
  setMET: (met: number) => void;
  setLive: (live: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setDataSource: (source: "arow" | "computed") => void;
  /** Called every second by useSimulationClock */
  tick: () => void;
  /** Called by useMissionData when fresh AROW data arrives */
  syncFromAPI: (met: number, position: Vec3, velocity: Vec3, dataSource: "arow" | "computed") => void;
}

function deriveState(met: number) {
  const clampedMet = Math.max(0, Math.min(met, mission.missionDurationSeconds));
  const point = interpolateTrajectory(clampedMet);
  const phaseInfo = getPhase(clampedMet);
  const telemetry = computeTelemetry(clampedMet, point);

  return {
    met: clampedMet,
    position: point.position,
    velocity: point.velocity,
    phase: phaseInfo.phase,
    phaseLabel: phaseInfo.label,
    phaseColor: phaseInfo.color,
    telemetry,
  };
}

// Use MET=0 for initial state to avoid SSR/client hydration mismatch.
// The real MET is set on first client-side tick() call (within 1 second).
export const useSimulationStore = create<SimulationStore>((set, get) => {
  const initial = deriveState(0);
  return {
    ...initial,
    isLive: true,
    playbackSpeed: 1,
    dataSource: "computed",

    setMET: (met) => {
      const derived = deriveState(met);
      set({ ...derived, isLive: false });
    },

    setLive: (live) => {
      if (live) {
        const met = (Date.now() - mission.launchDate.getTime()) / 1000;
        const derived = deriveState(met);
        set({ ...derived, isLive: true });
      } else {
        set({ isLive: false });
      }
    },

    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    setDataSource: (source) => set({ dataSource: source }),

    tick: () => {
      const { isLive, met, playbackSpeed } = get();
      let nextMET: number;
      if (isLive) {
        nextMET = (Date.now() - mission.launchDate.getTime()) / 1000;
      } else {
        nextMET = met + playbackSpeed;
      }
      const derived = deriveState(nextMET);
      set(derived);
    },

    syncFromAPI: (met, position, velocity, dataSource) => {
      const phaseInfo = getPhase(met);
      const telemetry = computeTelemetry(met, { met, position, velocity, phase: phaseInfo.phase });
      set({ met, position, velocity, phase: phaseInfo.phase, phaseLabel: phaseInfo.label, phaseColor: phaseInfo.color, telemetry, dataSource });
    },
  };
});
