"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulation";
import { useMissionData } from "@/hooks/useMissionData";
import { formatMET, formatDistance, formatVelocity, formatCountdown } from "@/lib/format";
import mission from "@/config/artemis-ii";

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-space-800 border border-white/8 rounded-lg p-3 min-w-0">
      <span className="text-xs text-white/40 uppercase tracking-widest truncate">{label}</span>
      <div className="flex items-baseline gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="text-lg font-mono font-semibold text-white tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {unit && <span className="text-xs text-white/40">{unit}</span>}
      </div>
    </div>
  );
}

export default function MissionHeader() {
  const { met, isLive, phaseLabel, phaseColor, telemetry, dataSource } = useSimulationStore();
  const { nextMilestone, secondsToNextMilestone } = useMissionData();

  const speedKmh = (telemetry.speed * 3600).toFixed(0);

  return (
    <header className="flex flex-col gap-3 p-4 border-b border-white/8">
      {/* Top row: mission name, live badge, data source */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            {mission.name}
            <span className="ml-2 text-white/40 font-normal text-sm">{mission.vehicle}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Data source chip */}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono border ${
              dataSource === "arow"
                ? "border-status-nominal/40 text-status-nominal bg-status-nominal/10"
                : "border-status-caution/40 text-status-caution bg-status-caution/10"
            }`}
          >
            {dataSource === "arow" ? "AROW LIVE" : "COMPUTED"}
          </span>
          {/* Live/Paused badge */}
          <motion.span
            animate={isLive ? { opacity: [1, 0.5, 1] } : { opacity: 0.6 }}
            transition={isLive ? { repeat: Infinity, duration: 2 } : {}}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
              isLive
                ? "border-status-nominal/40 text-status-nominal bg-status-nominal/10"
                : "border-white/20 text-white/50 bg-white/5"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-status-nominal" : "bg-white/30"}`}
            />
            {isLive ? "LIVE" : "PAUSED"}
          </motion.span>
        </div>
      </div>

      {/* MET clock */}
      <div className="flex items-center gap-4">
        <span className="text-3xl font-mono font-bold text-artemis-blue text-glow-blue tabular-nums">
          {formatMET(met)}
        </span>
        {/* Phase badge */}
        <span
          className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border"
          style={{ color: phaseColor, borderColor: phaseColor + "40", backgroundColor: phaseColor + "15" }}
        >
          {phaseLabel}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Speed" value={formatVelocity(telemetry.speed)} />
        <StatCard label="Speed" value={`${Number(speedKmh).toLocaleString()}`} unit="km/h" />
        <StatCard label="From Earth" value={formatDistance(telemetry.distanceToEarth)} />
        <StatCard label="From Moon" value={formatDistance(telemetry.distanceToMoon)} />
      </div>

      {/* Next milestone countdown */}
      {nextMilestone && secondsToNextMilestone !== null && secondsToNextMilestone > 0 && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="text-white/30">Next:</span>
          <span className="text-white/70">{nextMilestone.label}</span>
          <span className="text-artemis-gold">in {formatCountdown(secondsToNextMilestone)}</span>
        </div>
      )}
    </header>
  );
}
