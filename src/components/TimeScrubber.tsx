"use client";

import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/simulation";
import { formatMET } from "@/lib/format";
import mission from "@/config/artemis-ii";

const SPEEDS = [
  { label: "1×", value: 1 },
  { label: "10×", value: 10 },
  { label: "100×", value: 100 },
  { label: "1000×", value: 1000 },
];

export default function TimeScrubber() {
  const { met, isLive, playbackSpeed, setMET, setLive, setPlaybackSpeed } = useSimulationStore();
  const duration = mission.missionDurationSeconds;
  const progress = Math.min(1, Math.max(0, met / duration));

  // Build phase gradient stops for the slider track
  const phaseGradient = mission.phases
    .filter((p) => isFinite(p.startMet) && isFinite(p.endMet))
    .map((p) => {
      const start = (p.startMet / duration) * 100;
      const end = (p.endMet / duration) * 100;
      return `${p.color} ${start}%, ${p.color} ${end}%`;
    })
    .join(", ");

  const jumpToLive = () => {
    setLive(true);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMET(Number(e.target.value));
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-t border-white/8 bg-space-800/60">
      {/* Slider */}
      <div className="relative">
        {/* Phase gradient track */}
        <div
          className="absolute inset-y-0 left-0 right-0 rounded-full h-1.5 top-1/2 -translate-y-1/2 opacity-40"
          style={{ background: `linear-gradient(to right, ${phaseGradient})` }}
        />
        {/* Milestone ticks */}
        {mission.milestones.map((m) => {
          const pos = (m.met / duration) * 100;
          return (
            <div
              key={m.id}
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/30 rounded-full"
              style={{ left: `${pos}%` }}
              title={m.label}
            />
          );
        })}
        <input
          type="range"
          min={0}
          max={duration}
          step={60}
          value={met}
          onChange={handleSlider}
          className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.6)]
            [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
            [&::-webkit-slider-runnable-track]:bg-white/10"
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Play/Pause */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setLive(!isLive)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm transition-colors"
        >
          {isLive ? (
            <>
              <span className="text-base leading-none">⏸</span>
              <span className="text-xs">Pause</span>
            </>
          ) : (
            <>
              <span className="text-base leading-none">▶</span>
              <span className="text-xs">Play</span>
            </>
          )}
        </motion.button>

        {/* Live button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={jumpToLive}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
            isLive
              ? "border-status-nominal/40 text-status-nominal bg-status-nominal/10"
              : "border-white/10 text-white/50 bg-white/5 hover:bg-white/8"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-status-nominal animate-pulse-glow" : "bg-white/30"}`} />
          LIVE
        </motion.button>

        {/* Speed selector */}
        <div className="flex items-center gap-1 ml-auto">
          {SPEEDS.map(({ label, value }) => (
            <motion.button
              key={value}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPlaybackSpeed(value)}
              className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                playbackSpeed === value && !isLive
                  ? "border-artemis-blue/60 text-artemis-blue bg-artemis-blue/10"
                  : "border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Current MET */}
        <span className="text-xs font-mono text-white/40 tabular-nums ml-2">
          {formatMET(met)}
        </span>

        {/* Progress % */}
        <span className="text-xs text-white/30 tabular-nums">
          {(progress * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
