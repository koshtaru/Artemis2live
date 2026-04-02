"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/simulation";
import { formatCountdown } from "@/lib/format";
import mission from "@/config/artemis-ii";

const ONE_HOUR = 3600;

export default function Timeline() {
  const { met, setMET } = useSimulationStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Find current / next milestone index
  const currentIdx = mission.milestones.findIndex(
    (m, i) => m.met <= met && (i === mission.milestones.length - 1 || mission.milestones[i + 1].met > met)
  );

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentIdx]);

  const progress = Math.min(1, Math.max(0, met / mission.missionDurationSeconds));

  return (
    <div className="flex flex-col gap-1 border-b border-white/8">
      {/* Progress bar */}
      <div className="h-0.5 bg-white/8 mx-4">
        <motion.div
          className="h-full bg-artemis-blue rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Milestone cards */}
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-thin"
      >
        {mission.milestones.map((milestone, i) => {
          const isPast = milestone.met < met - ONE_HOUR;
          const isCurrent = i === currentIdx;
          const isFuture = milestone.met > met;
          const countdown = milestone.met - met;

          return (
            <motion.button
              key={milestone.id}
              ref={isCurrent ? activeRef : undefined}
              onClick={() => setMET(milestone.met)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-shrink-0 flex flex-col gap-1 w-32 rounded-lg border p-2.5 text-left transition-colors cursor-pointer ${
                isCurrent
                  ? "border-artemis-blue/60 bg-artemis-blue/10 glow-blue"
                  : isPast
                  ? "border-white/8 bg-white/3 opacity-50"
                  : "border-white/8 bg-white/3 hover:border-white/20"
              }`}
            >
              <span className="text-lg leading-none">
                {isPast ? "✓" : isCurrent ? "●" : "○"}
              </span>
              <span
                className={`text-xs font-semibold truncate ${
                  isCurrent ? "text-artemis-blue" : isPast ? "text-white/50" : "text-white/80"
                }`}
              >
                {milestone.label}
              </span>
              {isFuture && countdown > 0 && (
                <span className="text-xs text-white/30 truncate">
                  in {formatCountdown(countdown)}
                </span>
              )}
              {isPast && (
                <span className="text-xs text-white/25 truncate">Complete</span>
              )}
              {isCurrent && (
                <span className="text-xs text-artemis-blue/70 truncate animate-pulse-glow">
                  Active
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
