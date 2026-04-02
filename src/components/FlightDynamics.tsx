"use client";

import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/simulation";
import {
  computeFlightPathAngle,
  computeOrbitalEnergy,
  computeSignalDelay,
  estimateGForce,
} from "@/lib/orbital";
import {
  formatDistance,
  formatVelocity,
  formatAngle,
  formatEnergy,
  formatLightTime,
  formatGForce,
} from "@/lib/format";

function Row({ label, value, accent }: { label: string; value: string; accent?: "cyan" | "orange" | "green" }) {
  const colorMap = {
    cyan: "text-artemis-cyan",
    orange: "text-artemis-orange",
    green: "text-status-nominal",
  };
  const valClass = accent ? colorMap[accent] : "text-white";

  return (
    <div className="flex justify-between items-baseline py-1 border-b border-white/5 last:border-0">
      <span className="text-[11px] uppercase tracking-wider text-white/40">{label}</span>
      <span className={`font-mono text-sm tabular-nums ${valClass}`}>{value}</span>
    </div>
  );
}

export default function FlightDynamics() {
  const { position, velocity, met, phase, telemetry } = useSimulationStore();

  const fpa = computeFlightPathAngle(position, velocity);
  const energy = computeOrbitalEnergy(position, velocity);
  const signalDelay = computeSignalDelay(telemetry.distanceToEarth);
  const gForce = estimateGForce(met, phase);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel mx-4 mt-3"
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest text-artemis-cyan mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-artemis-cyan animate-pulse-glow" />
        Flight Dynamics
      </h3>

      <div className="grid grid-cols-2 gap-x-4">
        {/* Left column: Position & Velocity vectors */}
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Position (km)</div>
          <Row label="X" value={position.x.toLocaleString(undefined, { maximumFractionDigits: 0 })} accent="cyan" />
          <Row label="Y" value={position.y.toLocaleString(undefined, { maximumFractionDigits: 0 })} accent="cyan" />
          <Row label="Z" value={position.z.toLocaleString(undefined, { maximumFractionDigits: 0 })} accent="cyan" />

          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-2 mb-1">Velocity (km/s)</div>
          <Row label="Vx" value={velocity.x.toFixed(3)} accent="orange" />
          <Row label="Vy" value={velocity.y.toFixed(3)} accent="orange" />
          <Row label="Vz" value={velocity.z.toFixed(3)} accent="orange" />
        </div>

        {/* Right column: Derived metrics */}
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Orbital Metrics</div>
          <Row label="Altitude" value={formatDistance(telemetry.altitude)} />
          <Row label="Speed" value={formatVelocity(telemetry.speed)} accent="orange" />
          <Row label="FPA" value={formatAngle(fpa)} />
          <Row label="Spec. Energy" value={formatEnergy(energy)} />

          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-2 mb-1">Comms & Safety</div>
          <Row label="Signal Delay" value={formatLightTime(signalDelay)} accent="cyan" />
          <Row label="Est. G-Force" value={formatGForce(gForce)} accent={gForce > 1 ? "orange" : "green"} />
          <Row label="To Earth" value={formatDistance(telemetry.distanceToEarth)} />
          <Row label="To Moon" value={formatDistance(telemetry.distanceToMoon)} />
        </div>
      </div>
    </motion.section>
  );
}
