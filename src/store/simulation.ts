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

  // Simulator-mode delta-V override
  deltaV: Vec3 | null;

  // Actions
  setMET: (met: number) => void;
  setLive: (live: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setDataSource: (source: "arow" | "computed") => void;
  applyDeltaV: (dv: Vec3) => void;
  resetDeltaV: () => void;
  /** Called every second by useSimulationClock */
  tick: () => void;
  /** Called by useMissionData when fresh AROW data arrives */
  syncFromAPI: (met: number, position: Vec3, velocity: Vec3, dataSource: "arow" | "computed") => void;
}

function deriveState(met: number, deltaV: Vec3 | null) {
  const clampedMet = Math.max(0, Math.min(met, mission.missionDurationSeconds));
  const point = interpolateTrajectory(clampedMet);

  // Apply delta-V offset if in simulator mode
  const velocity = deltaV
    ? { x: point.velocity.x + deltaV.x, y: point.velocity.y + deltaV.y, z: point.velocity.z + deltaV.z }
    : point.velocity;

  const phaseInfo = getPhase(clampedMet);
  const telemetry = computeTelemetry(clampedMet, { ...point, velocity });

  return {
    met: clampedMet,
    position: point.position,
    velocity,
    phase: phaseInfo.phase,
    phaseLabel: phaseInfo.label,
    phaseColor: phaseInfo.color,
    telemetry,
  };
}

const initialMET = () => {
  const elapsed = (Date.now() - mission.launchDate.getTime()) / 1000;
  return Math.max(0, Math.min(elapsed, mission.missionDurationSeconds));
};

export const useSimulationStore = create<SimulationStore>((set, get) => {
  const initial = deriveState(initialMET(), null);
  return {
    ...initial,
    isLive: true,
    playbackSpeed: 1,
    dataSource: "computed",
    deltaV: null,

    setMET: (met) => {
      const derived = deriveState(met, get().deltaV);
      set({ ...derived, isLive: false });
    },

    setLive: (live) => {
      if (live) {
        const met = (Date.now() - mission.launchDate.getTime()) / 1000;
        const derived = deriveState(met, get().deltaV);
        set({ ...derived, isLive: true });
      } else {
        set({ isLive: false });
      }
    },

    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    setDataSource: (source) => set({ dataSource: source }),

    applyDeltaV: (dv) => {
      const derived = deriveState(get().met, dv);
      set({ ...derived, deltaV: dv });
    },

    resetDeltaV: () => {
      const derived = deriveState(get().met, null);
      set({ ...derived, deltaV: null });
    },

    tick: () => {
      const { isLive, met, playbackSpeed, deltaV } = get();
      let nextMET: number;
      if (isLive) {
        nextMET = (Date.now() - mission.launchDate.getTime()) / 1000;
      } else {
        nextMET = met + playbackSpeed;
      }
      const derived = deriveState(nextMET, deltaV);
      set(derived);
    },

    syncFromAPI: (met, position, velocity, dataSource) => {
      const phaseInfo = getPhase(met);
      const telemetry = computeTelemetry(met, { met, position, velocity, phase: phaseInfo.phase });
      set({ met, position, velocity, phase: phaseInfo.phase, phaseLabel: phaseInfo.label, phaseColor: phaseInfo.color, telemetry, dataSource });
    },
  };
});
