export type DistanceUnit = "km" | "miles";

export interface UIConfig {
  units: DistanceUnit;
  defaultPlaybackSpeed: number;
  defaultCameraPosition: [number, number, number];
  hotkeys: Record<string, string>;
}

const ui: UIConfig = {
  units: "km",
  defaultPlaybackSpeed: 1,
  // Camera positioned to see Earth, Moon and trajectory path
  defaultCameraPosition: [20, 15, 55],
  hotkeys: {
    toggleLive: "Space",
    jumpToLive: "l",
    focusEarth: "e",
    focusMoon: "m",
    focusOrion: "o",
    scrubBack: "ArrowLeft",
    scrubForward: "ArrowRight",
    speed1x: "1",
    speed10x: "2",
    speed100x: "3",
    speed1000x: "4",
    showHelp: "?",
  },
};

export default ui;

export function toDisplayDistance(km: number, unit: DistanceUnit): string {
  if (unit === "miles") {
    const miles = km * 0.621371;
    if (miles >= 1_000_000) return `${(miles / 1_000_000).toFixed(1)}M mi`;
    if (miles >= 1_000) return `${(miles / 1_000).toFixed(1)}K mi`;
    return `${Math.round(miles)} mi`;
  }
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(1)}M km`;
  if (km >= 1_000) return `${(km / 1_000).toFixed(1)}K km`;
  return `${Math.round(km)} km`;
}
