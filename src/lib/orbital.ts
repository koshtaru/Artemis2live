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
