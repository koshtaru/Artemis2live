import { TrajectoryPoint, Vec3, TelemetrySnapshot, MissionPhase } from "@/config/types";
import { magnitude, subtract, lerp, vec3 } from "./vector";
import mission from "@/config/artemis-ii";
import { EARTH_RADIUS_KM, MOON_DISTANCE_KM } from "@/config/artemis-ii";

/**
 * Get Moon position at a given MET. Moon orbits Earth with ~27.3 day period.
 * Over the 10-day mission it moves about 132 degrees.
 */
export function getMoonPosition(met: number): Vec3 {
  const orbitalPeriod = 27.3 * 86400; // seconds
  const initialAngle = 0; // Moon starts along +X axis
  const angle = initialAngle + (2 * Math.PI * met) / orbitalPeriod;
  return vec3(
    MOON_DISTANCE_KM * Math.cos(angle),
    MOON_DISTANCE_KM * Math.sin(angle),
    0
  );
}

/**
 * Interpolate position along trajectory waypoints for a given MET.
 * Uses linear interpolation between the two nearest waypoints.
 */
export function interpolateTrajectory(met: number): TrajectoryPoint {
  const waypoints = mission.trajectoryWaypoints;

  if (met <= waypoints[0].met) return waypoints[0];
  if (met >= waypoints[waypoints.length - 1].met) return waypoints[waypoints.length - 1];

  // Binary search for bounding waypoints
  let lo = 0;
  let hi = waypoints.length - 1;
  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (waypoints[mid].met <= met) lo = mid;
    else hi = mid;
  }

  const a = waypoints[lo];
  const b = waypoints[hi];
  const t = (met - a.met) / (b.met - a.met);

  return {
    met,
    position: lerp(a.position, b.position, t),
    velocity: lerp(a.velocity, b.velocity, t),
    phase: t < 0.5 ? a.phase : b.phase,
  };
}

/**
 * Get current phase from MET
 */
export function getPhase(met: number): { phase: MissionPhase; label: string; color: string } {
  for (const p of mission.phases) {
    if (met >= p.startMet && met < p.endMet) {
      return { phase: p.phase, label: p.label, color: p.color };
    }
  }
  return { phase: "SPLASHDOWN", label: "Splashdown", color: "#22c55e" };
}

/**
 * Compute telemetry from current trajectory point
 */
export function computeTelemetry(met: number, point: TrajectoryPoint): TelemetrySnapshot {
  const moonPos = getMoonPosition(met);
  return {
    met,
    speed: magnitude(point.velocity),
    altitude: magnitude(point.position) - EARTH_RADIUS_KM,
    distanceToEarth: magnitude(point.position),
    distanceToMoon: magnitude(subtract(point.position, moonPos)),
    phase: point.phase,
  };
}

/**
 * Get the next upcoming milestone
 */
export function getNextMilestone(met: number) {
  return mission.milestones.find((m) => m.met > met) ?? null;
}

/**
 * Generate a full trajectory at regular intervals for charts/visualization
 */
export function generateFullTrajectory(intervalSeconds: number = 600): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const duration = mission.missionDurationSeconds;
  for (let t = 0; t <= duration; t += intervalSeconds) {
    points.push(interpolateTrajectory(t));
  }
  return points;
}

/**
 * Generate full telemetry data for charts
 */
export function generateFullTelemetry(intervalSeconds: number = 600): TelemetrySnapshot[] {
  const data: TelemetrySnapshot[] = [];
  const duration = mission.missionDurationSeconds;
  for (let t = 0; t <= duration; t += intervalSeconds) {
    const point = interpolateTrajectory(t);
    data.push(computeTelemetry(t, point));
  }
  return data;
}

// --- Derived orbital mechanics ---

const MU_EARTH = 398600.4418; // km³/s² — Earth gravitational parameter

/**
 * Flight path angle: angle between velocity vector and local horizontal.
 * 0° = perfectly tangential (circular orbit), 90° = radial escape.
 */
export function computeFlightPathAngle(pos: Vec3, vel: Vec3): number {
  const r = magnitude(pos);
  const v = magnitude(vel);
  if (r === 0 || v === 0) return 0;
  // dot(pos, vel) / (|pos| * |vel|) = cos(angle between r and v)
  const dot = pos.x * vel.x + pos.y * vel.y + pos.z * vel.z;
  const cosAngle = dot / (r * v);
  // Flight path angle = 90° - angle(r,v), or equivalently asin(dot/(r*v))
  return (Math.asin(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;
}

/**
 * Specific orbital energy (vis-viva): E = v²/2 - μ/r
 * Negative = bound orbit, positive = escape trajectory
 */
export function computeOrbitalEnergy(pos: Vec3, vel: Vec3): number {
  const r = magnitude(pos);
  const v = magnitude(vel);
  if (r === 0) return 0;
  return (v * v) / 2 - MU_EARTH / r;
}

/**
 * One-way signal delay: distance / speed of light
 */
export function computeSignalDelay(distKm: number): number {
  return distKm / 299792.458;
}

/**
 * Estimated g-force based on mission phase.
 * Launch ~3g, coast ~0g, entry ~4g peak
 */
export function estimateGForce(met: number, phase: string): number {
  switch (phase) {
    case "LAUNCH_ASCENT": {
      // Ramp from 1g to ~3g during ascent
      const t = Math.min(met / 510, 1); // MECO at 510s
      return 1 + t * 2;
    }
    case "TLI":
      return 1.5;
    case "ENTRY_DESCENT": {
      // Peak ~4g during skip entry
      const entryStart = 9.5 * 86400;
      const entryEnd = 10 * 86400;
      const t = (met - entryStart) / (entryEnd - entryStart);
      if (t < 0.3) return 1 + t * 10; // ramp to ~4g
      if (t < 0.6) return 4 - (t - 0.3) * 5; // drop to ~2.5g (skip)
      return 2.5 - (t - 0.6) * 4; // decel under chutes ~1g
    }
    case "SPLASHDOWN":
      return 1;
    default:
      return 0; // microgravity during coast
  }
}

/**
 * Get progress through current phase and overall mission
 */
export function getPhaseProgress(met: number): { index: number; total: number; percent: number; overallPercent: number } {
  const phases = mission.phases;
  let index = 0;
  let percent = 0;

  for (let i = 0; i < phases.length; i++) {
    if (met >= phases[i].startMet && met < phases[i].endMet) {
      index = i;
      const duration = phases[i].endMet - phases[i].startMet;
      percent = duration === Infinity || duration <= 0 ? 100 : ((met - phases[i].startMet) / duration) * 100;
      break;
    }
    if (i === phases.length - 1) {
      index = i;
      percent = 100;
    }
  }

  const overallPercent = Math.min(100, Math.max(0, (met / mission.missionDurationSeconds) * 100));

  return { index, total: phases.length, percent: Math.min(100, percent), overallPercent };
}
