export function formatMET(seconds: number): string {
  if (seconds < 0) return "T-" + formatDuration(-seconds);
  return "T+" + formatDuration(seconds);
}

function formatDuration(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
  return parts.join(" ");
}

export function formatDistance(km: number): string {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(1)}M km`;
  if (km >= 1_000) return `${(km / 1_000).toFixed(1)}K km`;
  return `${Math.round(km)} km`;
}

export function formatVelocity(kmPerSec: number): string {
  return `${kmPerSec.toFixed(2)} km/s`;
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "Complete";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d}d ${rh}h ${m}m`;
  }
  return `${h}h ${m}m ${s}s`;
}

export function formatSigned(val: number, decimals: number = 1): string {
  const sign = val >= 0 ? "+" : "";
  return `${sign}${val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatLightTime(seconds: number): string {
  if (seconds < 0.1) return "< 0.1s";
  return `${seconds.toFixed(2)}s`;
}

export function formatGForce(g: number): string {
  if (g < 0.01) return "~0.00 g";
  return `${g.toFixed(2)} g`;
}

export function formatAngle(degrees: number): string {
  return `${degrees >= 0 ? "+" : ""}${degrees.toFixed(1)}°`;
}

export function formatEnergy(energy: number): string {
  return `${energy >= 0 ? "+" : ""}${energy.toFixed(1)} km²/s²`;
}
