"use client";

import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/simulation";
import { getPhaseProgress } from "@/lib/orbital";
import { formatMET, formatCountdown, formatDistance } from "@/lib/format";
import mission from "@/config/artemis-ii";

function PhaseBar({ met }: { met: number }) {
  const progress = getPhaseProgress(met);
  const phases = mission.phases.filter((p) => p.startMet !== -Infinity); // skip PRELAUNCH

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Mission Progress</span>
        <span className="font-mono text-xs text-artemis-cyan tabular-nums">
          {progress.overallPercent.toFixed(1)}%
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {phases.map((p, i) => {
          const duration = Math.min(p.endMet, mission.missionDurationSeconds) - Math.max(p.startMet, 0);
          const width = (duration / mission.missionDurationSeconds) * 100;
          const isCurrent = i === progress.index - 1; // offset because we removed PRELAUNCH
          const isPast = met >= p.endMet;

          return (
            <div
              key={p.phase}
              className="relative transition-opacity duration-300"
              style={{
                width: `${width}%`,
                backgroundColor: isPast || isCurrent ? p.color : p.color + "30",
                opacity: isPast ? 0.5 : 1,
              }}
            >
              {isCurrent && (
                <motion.div
                  className="absolute right-0 top-0 bottom-0 w-0.5 bg-white"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        {phases.map((p) => (
          <span key={p.phase} className="text-[8px] text-white/25 truncate" style={{ maxWidth: "60px" }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MilestonesTable({ met }: { met: number }) {
  return (
    <div className="max-h-[200px] overflow-y-auto scrollbar-thin mt-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-white/30 text-[10px] uppercase tracking-wider">
            <th className="text-left py-1 font-normal">Event</th>
            <th className="text-right py-1 font-normal">MET</th>
            <th className="text-right py-1 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {mission.milestones.map((m) => {
            const isPast = met >= m.met;
            const isCurrent = !isPast && met >= m.met - 300; // within 5 min
            const secsUntil = m.met - met;

            return (
              <tr
                key={m.id}
                className={`border-t border-white/5 ${isPast ? "text-white/30" : isCurrent ? "text-artemis-gold" : "text-white/60"}`}
              >
                <td className="py-1 pr-2">
                  <span className="mr-1.5">{isPast ? "✓" : isCurrent ? "●" : "○"}</span>
                  {m.label}
                </td>
                <td className="py-1 text-right font-mono tabular-nums text-[11px]">
                  {formatMET(m.met)}
                </td>
                <td className="py-1 text-right font-mono tabular-nums text-[11px]">
                  {isPast ? (
                    <span className="text-status-nominal/60">DONE</span>
                  ) : (
                    <span className="text-artemis-gold">{formatCountdown(secsUntil)}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MissionContext({ met }: { met: number }) {
  const dayOfMission = Math.floor(met / 86400) + 1;
  const totalDays = Math.ceil(mission.missionDurationSeconds / 86400);
  const { telemetry } = useSimulationStore();

  // Apollo 13 max distance: 400,171 km from Earth
  const apollo13Max = 400171;
  const distPercent = ((telemetry.distanceToEarth / apollo13Max) * 100).toFixed(1);

  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      <div className="glass-panel-sm text-center">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">Day</div>
        <div className="font-mono text-lg text-white tabular-nums">
          {dayOfMission}<span className="text-white/30 text-xs">/{totalDays}</span>
        </div>
      </div>
      <div className="glass-panel-sm text-center">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">vs Apollo 13</div>
        <div className="font-mono text-sm text-artemis-cyan tabular-nums">
          {distPercent}%
        </div>
        <div className="text-[9px] text-white/25">of max distance</div>
      </div>
      <div className="glass-panel-sm text-center">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">Crew</div>
        <div className="flex justify-center gap-1 mt-1">
          {mission.crew.map((c) => (
            <span
              key={c.id}
              className="w-6 h-6 rounded-full bg-space-700 border border-white/10 flex items-center justify-center text-[9px] font-mono text-white/60"
              title={`${c.name} — ${c.role}`}
            >
              {c.initials}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MissionProgress() {
  const { met } = useSimulationStore();

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-panel mx-4 my-3"
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest text-artemis-orange mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-artemis-orange animate-pulse-glow" />
        Mission Progress
      </h3>

      <PhaseBar met={met} />
      <MilestonesTable met={met} />
      <MissionContext met={met} />
    </motion.section>
  );
}
