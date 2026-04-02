export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type MissionPhase =
  | "PRELAUNCH"
  | "LAUNCH_ASCENT"
  | "EARTH_ORBIT"
  | "TLI"
  | "OUTBOUND_COAST"
  | "LUNAR_FLYBY"
  | "RETURN_COAST"
  | "ENTRY_DESCENT"
  | "SPLASHDOWN";

export interface TrajectoryPoint {
  met: number; // Mission Elapsed Time in seconds
  position: Vec3; // km, Earth-centered
  velocity: Vec3; // km/s
  phase: MissionPhase;
}

export interface Milestone {
  id: string;
  label: string;
  description: string;
  met: number; // seconds since launch
  phase: MissionPhase;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  agency: string;
  bio: string;
  initials: string;
}

export interface PhaseInfo {
  phase: MissionPhase;
  label: string;
  startMet: number;
  endMet: number;
  color: string;
}

export interface MissionConfig {
  name: string;
  vehicle: string;
  patchName: string;
  launchDate: Date;
  missionDurationSeconds: number;
  crew: CrewMember[];
  milestones: Milestone[];
  phases: PhaseInfo[];
  trajectoryWaypoints: TrajectoryPoint[];
  educationTopics: EducationTopic[];
  arowEndpoint: string | null;
}

export interface EducationTopic {
  id: string;
  title: string;
  content: string;
}

export interface TelemetrySnapshot {
  met: number;
  speed: number; // km/s
  altitude: number; // km above Earth
  distanceToEarth: number; // km from Earth center
  distanceToMoon: number; // km from Moon center
  phase: MissionPhase;
}

export interface SimulationState {
  met: number;
  position: Vec3;
  velocity: Vec3;
  phase: MissionPhase;
  phaseLabel: string;
  telemetry: TelemetrySnapshot;
  dataSource: "arow" | "computed";
  isLive: boolean;
}
