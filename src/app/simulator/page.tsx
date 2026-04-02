"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSimulationClock } from "@/hooks/useSimulationClock";
import { useSimulationStore } from "@/store/simulation";
import MissionHeader from "@/components/MissionHeader";
import SceneView from "@/components/SceneView";
import TimeScrubber from "@/components/TimeScrubber";
import KeyboardControls from "@/components/KeyboardControls";
import type { SceneHandle } from "@/components/OrbitScene";
import { generateFullTrajectory } from "@/lib/orbital";
import Link from "next/link";

export default function SimulatorPage() {
  useSimulationClock();

  const sceneRef = useRef<SceneHandle>(null);
  const { applyDeltaV, resetDeltaV, deltaV, met } = useSimulationStore();

  const [dvX, setDvX] = useState("0");
  const [dvY, setDvY] = useState("0");
  const [dvZ, setDvZ] = useState("0");

  const handleApply = () => {
    applyDeltaV({
      x: parseFloat(dvX) || 0,
      y: parseFloat(dvY) || 0,
      z: parseFloat(dvZ) || 0,
    });
  };

  const handleReset = () => {
    resetDeltaV();
    setDvX("0");
    setDvY("0");
    setDvZ("0");
  };

  const handleExport = () => {
    const data = generateFullTrajectory(600).map((p) => ({
      met_seconds: p.met,
      met_hours: (p.met / 3600).toFixed(2),
      x_km: p.position.x.toFixed(1),
      y_km: p.position.y.toFixed(1),
      z_km: p.position.z.toFixed(1),
      vx_kms: p.velocity.x.toFixed(4),
      vy_kms: p.velocity.y.toFixed(4),
      vz_kms: p.velocity.z.toFixed(4),
      phase: p.phase,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `artemis-ii-trajectory-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
      {/* Left: 3D Scene */}
      <div className="relative flex flex-col lg:w-[60%] h-[50vh] lg:h-screen flex-shrink-0">
        <SceneView ref={sceneRef} />
        <div className="absolute bottom-0 left-0 right-0">
          <TimeScrubber />
        </div>
        <Link
          href="/"
          className="absolute top-3 left-3 px-2.5 py-1 rounded-lg border border-white/15 bg-black/50 backdrop-blur-sm text-xs text-white/60 hover:text-white hover:border-artemis-blue/50 transition-colors"
        >
          ← Live
        </Link>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border border-artemis-orange/40 bg-artemis-orange/10 text-xs text-artemis-orange font-semibold">
          SIMULATOR MODE
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-col lg:w-[40%] overflow-y-auto border-l border-white/8">
        <MissionHeader />

        {/* Manual Burn Input */}
        <div className="flex flex-col gap-4 p-4 border-b border-white/8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              Manual Burn (ΔV km/s)
            </h2>
            {deltaV && (
              <span className="text-xs text-artemis-orange border border-artemis-orange/40 bg-artemis-orange/10 px-2 py-0.5 rounded-full">
                Override Active
              </span>
            )}
          </div>

          <div className="text-xs text-white/40 font-mono">
            Applied at MET {(met / 3600).toFixed(2)}h
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "ΔVx", value: dvX, setter: setDvX },
              { label: "ΔVy", value: dvY, setter: setDvY },
              { label: "ΔVz", value: dvZ, setter: setDvZ },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-xs text-white/50">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  step="0.1"
                  className="bg-space-800 border border-white/15 rounded-lg px-2 py-1.5 text-sm text-white font-mono w-full focus:outline-none focus:border-artemis-blue/60"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleApply}
              className="flex-1 py-2 rounded-lg bg-artemis-orange/20 border border-artemis-orange/40 text-artemis-orange text-sm font-semibold hover:bg-artemis-orange/30 transition-colors"
            >
              Apply Burn
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/15 text-white/60 text-sm hover:bg-white/10 transition-colors"
            >
              Reset
            </motion.button>
          </div>

          {deltaV && (
            <div className="text-xs text-white/40 font-mono bg-white/4 rounded-lg p-2 border border-white/8">
              Active ΔV: ({deltaV.x.toFixed(3)}, {deltaV.y.toFixed(3)}, {deltaV.z.toFixed(3)}) km/s
            </div>
          )}
        </div>

        {/* Export */}
        <div className="flex flex-col gap-3 p-4 border-b border-white/8">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Export</h2>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-artemis-blue/10 border border-artemis-blue/30 text-artemis-blue text-sm hover:bg-artemis-blue/20 transition-colors"
          >
            ↓ Download Trajectory JSON
          </motion.button>
          <p className="text-xs text-white/30">
            Exports the full computed mission trajectory (10-min intervals) as a JSON file.
          </p>
        </div>
      </div>

      <KeyboardControls
        onFocusEarth={() => sceneRef.current?.focusEarth()}
        onFocusMoon={() => sceneRef.current?.focusMoon()}
        onFocusOrion={() => sceneRef.current?.focusOrion()}
      />
    </div>
  );
}
