import { TrajectoryPoint, Vec3 } from "@/config/types";

interface ArowResponse {
  timestamp: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  mission_elapsed_time_seconds: number;
}

/**
 * Fetch current position from NASA AROW API.
 * Returns null if the API is unavailable.
 */
export async function fetchArowData(
  endpoint: string
): Promise<TrajectoryPoint | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data: ArowResponse = await response.json();

    const position: Vec3 = {
      x: data.position.x,
      y: data.position.y,
      z: data.position.z,
    };
    const velocity: Vec3 = {
      x: data.velocity.x,
      y: data.velocity.y,
      z: data.velocity.z,
    };

    return {
      met: data.mission_elapsed_time_seconds,
      position,
      velocity,
      phase: "OUTBOUND_COAST", // Phase will be determined by orbital.ts
    };
  } catch {
    // Network error, timeout, or parse error — return null to trigger fallback
    return null;
  }
}
