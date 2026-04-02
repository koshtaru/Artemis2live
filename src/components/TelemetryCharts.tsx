"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { useSimulationStore } from "@/store/simulation";
import { generateFullTelemetry } from "@/lib/orbital";
import { formatDistance } from "@/lib/format";

const CHART_DATA = generateFullTelemetry(1800); // 30-min intervals for charts

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: number;
}

function DarkTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const hours = (label ?? 0) / 3600;
  return (
    <div className="bg-space-800/95 border border-white/10 rounded-lg p-2 text-xs backdrop-blur-sm">
      <p className="text-white/40 mb-1">T+{hours.toFixed(1)}h</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function TelemetryCharts() {
  const { met } = useSimulationStore();

  const chartData = useMemo(
    () =>
      CHART_DATA.map((t) => ({
        met: t.met,
        speed: parseFloat(t.speed.toFixed(3)),
        distEarth: parseFloat((t.distanceToEarth / 1000).toFixed(1)), // Mm
        distMoon: parseFloat((t.distanceToMoon / 1000).toFixed(1)),   // Mm
      })),
    []
  );

  const currentDistEarth = useSimulationStore((s) => s.telemetry.distanceToEarth);
  const currentDistMoon = useSimulationStore((s) => s.telemetry.distanceToMoon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col gap-4 p-4 border-b border-white/8"
    >
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
        Telemetry
      </h2>

      {/* Velocity chart */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-white/50">Speed (km/s)</span>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="met" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <Tooltip content={<DarkTooltip />} />
            <ReferenceLine x={met} stroke="#ff6b35" strokeWidth={1.5} strokeOpacity={0.8} />
            <Area
              type="monotone"
              dataKey="speed"
              name="Speed"
              stroke="#00b4d8"
              strokeWidth={1.5}
              fill="url(#speedGrad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Distance chart */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-white/50">Distance (Mm)</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-artemis-blue inline-block rounded" />
              <span className="text-white/40">Earth {formatDistance(currentDistEarth)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-artemis-gold inline-block rounded" />
              <span className="text-white/40">Moon {formatDistance(currentDistMoon)}</span>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <XAxis dataKey="met" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <Tooltip content={<DarkTooltip />} />
            <ReferenceLine x={met} stroke="#ff6b35" strokeWidth={1.5} strokeOpacity={0.8} />
            <Line
              type="monotone"
              dataKey="distEarth"
              name="Earth"
              stroke="#00b4d8"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="distMoon"
              name="Moon"
              stroke="#fca311"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
