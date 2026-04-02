# Artemis II Live — Implementation Plan

## Context
Build a real-time Artemis II mission tracker dashboard. The repo is empty. Key requirements:
- **Live app** with real-time data (NASA AROW API primary, orbital computation fallback)
- **Reusable framework** — architected so future Artemis missions can be swapped in via config
- **Simpler than the brainstorm doc** — clean MVP, not over-engineered

## Tech Stack
- **Next.js 16 + TypeScript + Tailwind CSS** (App Router, `src/` dir)
- **Three.js + React Three Fiber + Drei** — 3D Earth/Moon/trajectory
- **Recharts** — telemetry charts
- **date-fns** — time formatting

## File Structure
```
src/
  app/
    layout.tsx              # Root layout, dark theme, metadata
    page.tsx                # Dashboard page composing all sections
    globals.css             # Tailwind + glow utilities
    api/
      trajectory/route.ts   # API route: proxies NASA AROW, caches, falls back to computed
  components/
    MissionHeader.tsx       # MET clock, phase, quick stats
    SceneView.tsx           # Dynamic import wrapper (ssr: false)
    OrbitScene.tsx          # R3F Canvas: Earth, Moon, path, Orion marker
    Timeline.tsx            # Horizontal milestone timeline
    TelemetryCharts.tsx     # Velocity + distance charts
    CrewSection.tsx         # Crew cards grid
    EducationSection.tsx    # Collapsible explainers
  config/
    artemis-ii.ts           # Mission-specific config (crew, milestones, orbital params, API endpoints)
    types.ts                # Shared TypeScript interfaces for any mission
  lib/
    data-provider.ts        # Fetches from API route, manages polling, exposes current state
    orbital.ts              # Compute positions from Keplerian elements (fallback engine)
    arow-client.ts          # NASA AROW API client with error handling
    vector.ts               # Vec3 math utilities
    format.ts               # Number/time formatting
  hooks/
    useMissionData.ts       # Hook: polls data-provider, returns live telemetry + position
    useSimulationClock.ts   # Hook: MET timer, phase detection
public/
  textures/                 # earth.jpg, moon.jpg
```

## Reusability Architecture
The `config/` directory is the key to reuse:
- `types.ts` defines mission-agnostic interfaces (`MissionConfig`, `CrewMember`, `Milestone`, `OrbitalParameters`, `TrajectoryPoint`, etc.)
- `artemis-ii.ts` is the mission-specific config implementing those interfaces
- To support Artemis III: create `artemis-iii.ts` with new crew/milestones/orbital params, update an import in `page.tsx`
- The data layer, 3D scene, and all components consume the config — they never hardcode mission-specific data

## Data Strategy: AROW API + Orbital Fallback

### Primary: NASA AROW API
- Next.js API route (`/api/trajectory`) proxies requests to NASA's AROW endpoint
- Polls every 30 seconds for latest position/velocity
- Server-side caching to respect rate limits
- Returns standardized `TrajectoryPoint` format

### Fallback: Orbital Computation
- `orbital.ts` contains Keplerian orbit propagation using the mission's orbital parameters
- When AROW is unavailable (network error, mission not active), computes position from elements
- Uses actual Artemis II trajectory parameters (TLI velocity, free-return geometry)
- Seamless switch — components don't know which source is active

### Client-Side Flow
1. `useMissionData` hook polls `/api/trajectory` every 30s
2. API route tries AROW → falls back to orbital computation
3. Between polls, client-side interpolation smooths the position (linear lerp over 30s intervals)
4. `useSimulationClock` provides MET, derived phase, countdown to next milestone

## Implementation Steps

### Step 1: Scaffold Project
- `npx create-next-app@latest . --ts --tailwind --app --src-dir --use-npm --eslint`
- `npm install three @react-three/fiber @react-three/drei recharts date-fns`
- `npm install -D @types/three`
- Configure tailwind with space/artemis color palette (deep blacks, glowing blues/oranges)
- Set up dark theme globals, layout with Inter font
- Add `transpilePackages: ['three']` to next.config

### Step 2: Config & Types
- `src/config/types.ts`: `MissionConfig`, `CrewMember`, `Milestone`, `MissionPhase`, `OrbitalParameters`, `TrajectoryPoint`, `TelemetrySnapshot`, `Vec3`
- `src/config/artemis-ii.ts`: Full Artemis II config — launch date (April 1 2026 22:35 UTC), crew (Wiseman, Glover, Koch, Hansen), ~15 milestones (Launch → TLI → Lunar Flyby → Splashdown), orbital parameters for the free-return trajectory, AROW API endpoint URL, phase definitions with MET ranges

### Step 3: Data Layer
- `src/lib/vector.ts`: Vec3 add/subtract/scale/magnitude/lerp/distance
- `src/lib/orbital.ts`: Given orbital parameters + MET → compute position & velocity. Simplified model: define ~20 key waypoints from real trajectory data, interpolate with smooth curves. Includes Earth-Moon geometry.
- `src/lib/arow-client.ts`: Fetch from NASA AROW, parse response into `TrajectoryPoint` format, handle errors gracefully
- `src/lib/data-provider.ts`: Orchestrates AROW fetch → fallback → returns normalized data
- `src/app/api/trajectory/route.ts`: Next.js route handler — calls data-provider, caches last result, returns JSON
- `src/lib/format.ts`: `formatMET()`, `formatDistance()`, `formatVelocity()`

### Step 4: Hooks
- `src/hooks/useSimulationClock.ts`: Computes MET from `Date.now() - launchDate`, determines current phase from config's phase ranges, finds next milestone. Updates every 1s.
- `src/hooks/useMissionData.ts`: Polls `/api/trajectory` every 30s, stores latest + previous points, interpolates between them on each render frame for smooth motion. Returns `{ position, velocity, distanceToEarth, distanceToMoon, altitude, speed, dataSource }`.

### Step 5: Dashboard Layout & Header
- `page.tsx`: Responsive CSS grid — 2-col on desktop (3D scene left, panels right), 1-col on mobile
- `MissionHeader.tsx`: Mission name, MET clock (T+DD:HH:MM:SS), phase badge with color, data source indicator (AROW/Computed), 4 stat cards: speed (km/s), altitude (km), distance to Earth, distance to Moon. All from `useMissionData` + `useSimulationClock`.

### Step 6: 3D Visualization
- Download free 2K NASA Earth/Moon textures to `public/textures/`
- `OrbitScene.tsx`:
  - Earth: textured sphere, slow rotation, r=0.64 (scale: 1 unit = 10,000 km)
  - Moon: textured sphere at computed position (~38.4 units), r=0.17
  - Trajectory: `<Line>` from orbital computation (full mission path), split into past (solid bright) and future (transparent)
  - Orion: small glowing sphere + point light at live position
  - Distance labels: drei `<Html>` showing km values
  - `<OrbitControls>` for user interaction, `<Stars>` background
- `SceneView.tsx`: `next/dynamic(() => import('./OrbitScene'), { ssr: false })`

### Step 7: Timeline + Charts + Crew + Education
- `Timeline.tsx`: Horizontal scrollable strip of milestone cards. Past=checked+dimmed, current=glowing+highlighted, future=muted. Auto-scrolls to current.
- `TelemetryCharts.tsx`: 2 Recharts LineCharts — velocity curve and dual-line distance chart. Data from orbital computation (full mission profile). Vertical marker at current MET. Dark themed with artemis colors.
- `CrewSection.tsx`: 4 cards with colored initials avatar, name, role, agency, bio snippet. Data from mission config.
- `EducationSection.tsx`: Collapsible sections — free-return trajectory, SLS/Orion overview. Content from mission config.

### Step 8: Polish, Build, Push
- `<Suspense>` fallback for 3D scene loading
- Responsive testing
- `npm run build` verification
- Commit all files, push to `claude/artemis-mission-tracker-g0AJn`

## Verification
1. `npm run dev` loads dashboard at localhost:3000
2. MET clock ticks in real-time
3. `/api/trajectory` returns position data (falls back to computed if AROW unavailable)
4. 3D scene renders Earth, Moon, trajectory, Orion at correct position
5. Stats update live in header
6. Timeline highlights correct milestone
7. Charts show full mission profile with current-time marker
8. Works on narrow viewport (mobile)
9. `npm run build` succeeds
10. To add Artemis III: create new config file, change import — all components adapt
