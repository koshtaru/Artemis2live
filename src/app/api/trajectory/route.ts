import { NextResponse } from "next/server";
import { fetchArowData } from "@/lib/arow-client";
import { interpolateTrajectory, computeTelemetry, getPhase } from "@/lib/orbital";
import mission from "@/config/artemis-ii";

// Cache the last successful response for 15 seconds
let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 15_000;

export async function GET() {
  // Return cached data if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  const now = Date.now();
  const launchTime = mission.launchDate.getTime();
  const met = (now - launchTime) / 1000;

  let dataSource: "arow" | "computed" = "computed";
  let point = interpolateTrajectory(met);

  // Try AROW API first
  if (mission.arowEndpoint) {
    const arowData = await fetchArowData(mission.arowEndpoint);
    if (arowData) {
      point = arowData;
      dataSource = "arow";
    }
  }

  const phaseInfo = getPhase(met);
  point.phase = phaseInfo.phase;
  const telemetry = computeTelemetry(met, point);

  const response = {
    met,
    position: point.position,
    velocity: point.velocity,
    phase: phaseInfo.phase,
    phaseLabel: phaseInfo.label,
    phaseColor: phaseInfo.color,
    telemetry,
    dataSource,
    timestamp: new Date().toISOString(),
  };

  cache = { data: response, timestamp: now };
  return NextResponse.json(response);
}
