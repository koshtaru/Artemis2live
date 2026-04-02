import {
  MissionConfig,
  CrewMember,
  Milestone,
  PhaseInfo,
  TrajectoryPoint,
  EducationTopic,
} from "./types";
import { vec3 } from "@/lib/vector";

// Physical constants
export const EARTH_RADIUS_KM = 6371;
export const MOON_RADIUS_KM = 1737;
export const MOON_DISTANCE_KM = 384400;

// Hours to seconds helper
const h = (hours: number) => hours * 3600;
const d = (days: number) => days * 86400;

const crew: CrewMember[] = [
  {
    id: "wiseman",
    name: "Reid Wiseman",
    role: "Commander",
    agency: "NASA",
    bio: "U.S. Navy Captain and former NASA Chief Astronaut. Flew on ISS Expedition 41 in 2014, logging 165 days in space.",
    initials: "RW",
  },
  {
    id: "glover",
    name: "Victor Glover",
    role: "Pilot",
    agency: "NASA",
    bio: "U.S. Navy Captain and fighter pilot. Flew on SpaceX Crew-1 to the ISS in 2020-2021, spending 167 days in space.",
    initials: "VG",
  },
  {
    id: "koch",
    name: "Christina Koch",
    role: "Mission Specialist",
    agency: "NASA",
    bio: "Holds the record for longest single spaceflight by a woman at 328 days. Conducted the first all-female spacewalk in 2019.",
    initials: "CK",
  },
  {
    id: "hansen",
    name: "Jeremy Hansen",
    role: "Mission Specialist",
    agency: "CSA",
    bio: "Canadian Space Agency astronaut and former CF-18 fighter pilot. This will be his first spaceflight, making him the first Canadian to fly to the Moon.",
    initials: "JH",
  },
];

const milestones: Milestone[] = [
  {
    id: "launch",
    label: "Launch",
    description: "SLS lifts off from Launch Complex 39B at Kennedy Space Center.",
    met: 0,
    phase: "LAUNCH_ASCENT",
  },
  {
    id: "max-q",
    label: "Max-Q",
    description: "Maximum dynamic pressure on the vehicle during ascent.",
    met: 60,
    phase: "LAUNCH_ASCENT",
  },
  {
    id: "srb-sep",
    label: "SRB Separation",
    description: "Solid Rocket Boosters jettisoned after burnout.",
    met: 126,
    phase: "LAUNCH_ASCENT",
  },
  {
    id: "meco",
    label: "Core Stage MECO",
    description: "Main Engine Cutoff — core stage engines shut down.",
    met: 510,
    phase: "LAUNCH_ASCENT",
  },
  {
    id: "icps-sep",
    label: "ICPS Ignition & Earth Orbit",
    description: "Interim Cryogenic Propulsion Stage places Orion in parking orbit at ~200 km.",
    met: h(1.5),
    phase: "EARTH_ORBIT",
  },
  {
    id: "tli",
    label: "Trans-Lunar Injection",
    description: "ICPS fires to accelerate Orion to ~10.8 km/s toward the Moon.",
    met: h(2),
    phase: "TLI",
  },
  {
    id: "icps-jettison",
    label: "ICPS Jettison",
    description: "Upper stage separated. Orion proceeds on its own to the Moon.",
    met: h(2.5),
    phase: "OUTBOUND_COAST",
  },
  {
    id: "outbound-correction",
    label: "Outbound Correction Burn",
    description: "Small trajectory correction to fine-tune the lunar flyby approach.",
    met: d(1),
    phase: "OUTBOUND_COAST",
  },
  {
    id: "lunar-approach",
    label: "Lunar Approach",
    description: "Orion enters the Moon's gravitational sphere of influence.",
    met: d(3.5),
    phase: "OUTBOUND_COAST",
  },
  {
    id: "closest-approach",
    label: "Lunar Closest Approach",
    description: "Orion passes within ~130 km of the lunar far side — the farthest humans have ever traveled from Earth.",
    met: d(4),
    phase: "LUNAR_FLYBY",
  },
  {
    id: "return-coast",
    label: "Return Coast Begins",
    description: "Gravity assist slingshot sends Orion back toward Earth.",
    met: d(4.5),
    phase: "RETURN_COAST",
  },
  {
    id: "return-correction",
    label: "Return Correction Burn",
    description: "Mid-course correction to fine-tune Earth entry corridor.",
    met: d(7),
    phase: "RETURN_COAST",
  },
  {
    id: "sm-sep",
    label: "Service Module Separation",
    description: "Orion's Service Module jettisoned before atmospheric entry.",
    met: d(9.5),
    phase: "ENTRY_DESCENT",
  },
  {
    id: "entry-interface",
    label: "Entry Interface",
    description: "Orion enters Earth's atmosphere at ~11 km/s, experiencing temperatures up to 2,760°C on the heat shield.",
    met: d(9.6),
    phase: "ENTRY_DESCENT",
  },
  {
    id: "splashdown",
    label: "Splashdown",
    description: "Orion splashes down in the Pacific Ocean off San Diego.",
    met: d(10),
    phase: "SPLASHDOWN",
  },
];

const phases: PhaseInfo[] = [
  { phase: "PRELAUNCH", label: "Pre-Launch", startMet: -Infinity, endMet: 0, color: "#6b7280" },
  { phase: "LAUNCH_ASCENT", label: "Launch & Ascent", startMet: 0, endMet: h(1.5), color: "#ef4444" },
  { phase: "EARTH_ORBIT", label: "Earth Orbit", startMet: h(1.5), endMet: h(2), color: "#3b82f6" },
  { phase: "TLI", label: "Trans-Lunar Injection", startMet: h(2), endMet: h(2.5), color: "#f97316" },
  { phase: "OUTBOUND_COAST", label: "Outbound Coast", startMet: h(2.5), endMet: d(3.8), color: "#06b6d4" },
  { phase: "LUNAR_FLYBY", label: "Lunar Flyby", startMet: d(3.8), endMet: d(4.5), color: "#fbbf24" },
  { phase: "RETURN_COAST", label: "Return Coast", startMet: d(4.5), endMet: d(9.5), color: "#8b5cf6" },
  { phase: "ENTRY_DESCENT", label: "Entry & Descent", startMet: d(9.5), endMet: d(10), color: "#ef4444" },
  { phase: "SPLASHDOWN", label: "Splashdown", startMet: d(10), endMet: Infinity, color: "#22c55e" },
];

// Trajectory waypoints — positions in km (Earth-centered, Earth-Moon plane = X-Y)
// These model a realistic free-return trajectory profile
const trajectoryWaypoints: TrajectoryPoint[] = [
  // Launch & LEO (200 km altitude, circular)
  { met: 0, position: vec3(6571, 0, 0), velocity: vec3(0, 7.8, 0), phase: "LAUNCH_ASCENT" },
  { met: h(1), position: vec3(0, 6571, 0), velocity: vec3(-7.8, 0, 0), phase: "LAUNCH_ASCENT" },
  { met: h(1.5), position: vec3(-6571, 0, 0), velocity: vec3(0, -7.8, 0), phase: "EARTH_ORBIT" },

  // TLI — velocity boost kicks Orion outward
  { met: h(2), position: vec3(0, -6571, 0), velocity: vec3(10.8, 0, 0.5), phase: "TLI" },
  { met: h(2.5), position: vec3(8000, -5000, 300), velocity: vec3(9.5, 2.0, 0.4), phase: "TLI" },

  // Outbound coast — accelerating away from Earth toward Moon
  { met: h(6), position: vec3(25000, -2000, 800), velocity: vec3(5.5, 1.5, 0.3), phase: "OUTBOUND_COAST" },
  { met: h(12), position: vec3(55000, 3000, 1200), velocity: vec3(3.8, 1.2, 0.2), phase: "OUTBOUND_COAST" },
  { met: d(1), position: vec3(100000, 10000, 1500), velocity: vec3(2.5, 0.9, 0.15), phase: "OUTBOUND_COAST" },
  { met: d(1.5), position: vec3(145000, 18000, 1800), velocity: vec3(1.9, 0.7, 0.1), phase: "OUTBOUND_COAST" },
  { met: d(2), position: vec3(190000, 25000, 2000), velocity: vec3(1.5, 0.6, 0.08), phase: "OUTBOUND_COAST" },
  { met: d(2.5), position: vec3(235000, 30000, 2100), velocity: vec3(1.2, 0.5, 0.05), phase: "OUTBOUND_COAST" },
  { met: d(3), position: vec3(280000, 33000, 2100), velocity: vec3(1.0, 0.4, 0.03), phase: "OUTBOUND_COAST" },
  { met: d(3.5), position: vec3(330000, 34000, 2000), velocity: vec3(0.9, 0.3, 0.0), phase: "OUTBOUND_COAST" },

  // Lunar flyby — closest approach ~130 km above far side
  // Moon center at approximately (384400, 0, 0) during this period
  { met: d(3.8), position: vec3(370000, 30000, 1500), velocity: vec3(0.8, -0.3, -0.1), phase: "LUNAR_FLYBY" },
  { met: d(4), position: vec3(385900, 5000, 500), velocity: vec3(0.3, -1.5, -0.3), phase: "LUNAR_FLYBY" },
  { met: d(4.2), position: vec3(388000, -20000, -800), velocity: vec3(-0.2, -1.8, -0.2), phase: "LUNAR_FLYBY" },
  { met: d(4.5), position: vec3(375000, -40000, -2000), velocity: vec3(-0.8, -1.2, -0.15), phase: "LUNAR_FLYBY" },

  // Return coast — heading back to Earth
  { met: d(5), position: vec3(340000, -55000, -2500), velocity: vec3(-1.0, -0.8, -0.1), phase: "RETURN_COAST" },
  { met: d(5.5), position: vec3(300000, -60000, -2800), velocity: vec3(-1.2, -0.6, -0.08), phase: "RETURN_COAST" },
  { met: d(6), position: vec3(255000, -58000, -2900), velocity: vec3(-1.4, -0.4, -0.05), phase: "RETURN_COAST" },
  { met: d(6.5), position: vec3(210000, -52000, -2800), velocity: vec3(-1.6, -0.3, -0.03), phase: "RETURN_COAST" },
  { met: d(7), position: vec3(165000, -43000, -2500), velocity: vec3(-1.9, -0.2, 0.0), phase: "RETURN_COAST" },
  { met: d(7.5), position: vec3(120000, -32000, -2000), velocity: vec3(-2.3, 0.0, 0.05), phase: "RETURN_COAST" },
  { met: d(8), position: vec3(80000, -20000, -1500), velocity: vec3(-2.8, 0.3, 0.1), phase: "RETURN_COAST" },
  { met: d(8.5), position: vec3(45000, -10000, -1000), velocity: vec3(-3.5, 0.5, 0.15), phase: "RETURN_COAST" },
  { met: d(9), position: vec3(20000, -3000, -500), velocity: vec3(-5.0, 1.0, 0.2), phase: "RETURN_COAST" },

  // Entry & descent
  { met: d(9.5), position: vec3(8000, 1000, -200), velocity: vec3(-10.0, 2.0, 0.3), phase: "ENTRY_DESCENT" },
  { met: d(9.6), position: vec3(6500, 800, -100), velocity: vec3(-11.0, 1.5, 0.2), phase: "ENTRY_DESCENT" },
  { met: d(9.8), position: vec3(6400, 300, -50), velocity: vec3(-1.0, -0.3, 0.0), phase: "ENTRY_DESCENT" },

  // Splashdown (Pacific Ocean)
  { met: d(10), position: vec3(6371, 0, 0), velocity: vec3(0, 0, 0), phase: "SPLASHDOWN" },
];

const educationTopics: EducationTopic[] = [
  {
    id: "free-return",
    title: "Free-Return Trajectory",
    content: `A free-return trajectory is a special orbital path that uses the Moon's gravity to slingshot the spacecraft back to Earth without needing a major engine burn. Artemis II follows a figure-8 shaped path: the spacecraft launches from Earth, coasts to the Moon, swings around the far side, and lets lunar gravity redirect it home.

This trajectory was famously used by Apollo 13 after its oxygen tank explosion — the crew relied on the Moon's gravity to safely return to Earth. For Artemis II, this conservative approach provides a natural abort option at every point in the journey: if something goes wrong, the crew is already on a path that brings them home.

The trade-off is that a free-return trajectory limits how long the spacecraft spends near the Moon and doesn't allow entering lunar orbit. That's why Artemis III and later missions will use different trajectories with powered lunar orbit insertion.`,
  },
  {
    id: "sls-orion",
    title: "SLS & Orion Spacecraft",
    content: `The Space Launch System (SLS) is the most powerful rocket ever built by NASA. Standing 322 feet tall, it produces 8.8 million pounds of thrust at liftoff — 15% more than the Saturn V. Its core stage is powered by four RS-25 engines (the same engines used on the Space Shuttle), augmented by two massive solid rocket boosters.

The Orion spacecraft sits atop the SLS and consists of two main parts: the Crew Module (where the astronauts live and work) and the European Service Module (built by ESA), which provides propulsion, power, and life support. Orion's heat shield is the largest ever built, designed to withstand temperatures of 2,760°C during Earth re-entry at speeds of 40,000 km/h.

For Artemis II, the crew of four will spend approximately 10 days in the Crew Module — roughly the size of a large SUV interior. The mission validates all human-rated systems before Artemis III attempts the first crewed lunar landing since Apollo 17 in 1972.`,
  },
  {
    id: "artemis-program",
    title: "The Artemis Program",
    content: `Named after Apollo's twin sister in Greek mythology, the Artemis program aims to return humans to the Moon and establish a sustainable presence there as a stepping stone to Mars. Artemis I (2022) was an uncrewed test flight of SLS and Orion around the Moon. Artemis II is the first crewed mission, testing all systems with humans aboard.

Artemis III will attempt the first crewed lunar landing since 1972, using SpaceX's Starship as the Human Landing System. Later missions will build the Gateway — a small space station in lunar orbit — and establish the Artemis Base Camp on the lunar surface near the south pole.

The program represents a truly international effort: the European Space Agency builds Orion's service module, the Canadian Space Agency contributes the Canadarm3 robotic system for Gateway, and the Japan Aerospace Exploration Agency is providing habitation components. Artemis II crew member Jeremy Hansen will be the first non-American to fly to the Moon.`,
  },
];

const artemisII: MissionConfig = {
  name: "Artemis II",
  vehicle: 'Orion "Integrity"',
  patchName: "Artemis II",
  launchDate: new Date("2026-04-01T22:35:00Z"), // 6:35 PM EDT
  missionDurationSeconds: d(10),
  crew,
  milestones,
  phases,
  trajectoryWaypoints,
  educationTopics,
  arowEndpoint: "https://arow-api.nasa.gov/api/v1/ephemeris/artemis2",
};

export default artemisII;
