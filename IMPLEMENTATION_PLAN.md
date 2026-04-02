# Artemis II Live — Personal Geek Implementation Plan

**Project Type**: Personal local project only (run via `npm run dev` on your machine). No deployment, monetization, community features, or production hosting required.  
**Focus**: Smooth, delightful UI/UX with fluid animations, intuitive controls, and responsive feel. Geek-friendly extras for tinkering (time scrubbing, keyboard shortcuts, manual simulation mode, data export, orbital math playground).  
**Core Goal**: Real-time (or simulated) Orion spacecraft status with an immersive interactive 3D Earth-Moon-Orion map showing positions, distances, trails, and trajectory. Built for personal enjoyment while Artemis II is actively flying (launched successfully on April 1, 2026 at 6:35 p.m. EDT from Kennedy Space Center; currently in early post-launch Earth orbit phase with perigee/apogee raise maneuvers completed or in progress, solar panels deployed, and preparing for translunar injection and the ~10-day free-return trajectory around the Moon with splashdown ~April 10).

## Updated Context & Vision

This is a clean, reusable-but-personal dashboard inspired by NASA's AROW but enhanced for geek exploration. It prioritizes buttery-smooth interactions, minimal friction, and fun power-user features without over-engineering.

Key UX improvements:
- Fluid animations (Framer Motion) for transitions, camera movements, and data updates.
- Time scrubber with play/pause/speed controls (1x/10x/100x/1000x).
- Intuitive 3D controls with inertia/damping and one-click focus (Earth/Moon/Orion).
- Hover tooltips with simple orbital explanations.
- Immediate visual feedback (micro-animations, confidence indicators for data sources).
- Keyboard shortcuts for power users (Space=pause, E/M/O=focus, arrows=scrub, 1-4=speed, ?=help).
- Personal config for themes, units (miles/km), visible panels, and hotkeys.
- Offline-first with local ephemeris caching and seamless fallback projections during data gaps/blackouts.
- Edge case handling: Smooth scale transitions (LEO -> lunar distances), graceful degradation.
- `/simulator` route: Pause live data, manually adjust delta-V parameters, watch trajectory update, export results.

Mission phases dynamically reflected from config. Heavy NASA attribution in comments/footer (personal fan project).

## Tech Stack

- **Core**: Next.js 16 (App Router, src/ dir) + TypeScript + Tailwind CSS
- **3D Visualization**: Three.js + @react-three/fiber + @react-three/drei
- **Animations**: Framer Motion (UI panels/transitions + micro-animations)
- **State**: Zustand (simulation store -- MET, isLive, playbackSpeed, telemetry)
- **Charts**: Recharts (interactive, dark-themed, with current-MET reference line)
- **Utilities**: date-fns, custom vector/orbital math libs

## File Structure

```
src/
  app/
    layout.tsx              # Root layout, dark space theme, metadata
    page.tsx                # Main dashboard (split layout)
    simulator/page.tsx      # Geek simulator route
    globals.css             # Tailwind + glow/animation utilities
    api/
      trajectory/route.ts   # Local proxy + fallback (already built)
  components/
    MissionHeader.tsx       # MET clock, phase, stats with smooth updates
    OrbitScene.tsx          # Core R3F scene with damping controls
    SceneView.tsx           # Dynamic import (ssr: false)
    TimeScrubber.tsx        # Smooth timeline slider + play/pause/speed controls
    TelemetryCharts.tsx     # Interactive Recharts with "now" marker
    Timeline.tsx            # Horizontal milestone timeline
    CrewSection.tsx         # 4 crew cards with expandable bios
    EducationSection.tsx    # Collapsible education panels
    KeyboardControls.tsx    # Global hotkeys + ? overlay
  config/
    artemis-ii.ts           # Mission config -- already built
    types.ts                # Shared interfaces -- already built
    ui.ts                   # Personal preferences (units, hotkeys, camera defaults)
  store/
    simulation.ts           # Zustand store (MET, isLive, speed, telemetry, position)
  lib/
    orbital.ts              # Orbital math -- already built
    vector.ts               # Vec3 helpers -- already built
    format.ts               # Formatting -- already built
    arow-client.ts          # AROW client -- already built
  hooks/
    useMissionData.ts       # Polls /api/trajectory, interpolates, updates store
    useSimulationClock.ts   # Real-time MET ticker, respects playbackSpeed
    useKeyboard.ts          # Global keyboard shortcut handler
public/
  textures/                 # earth.jpg, moon.jpg (NASA public domain)
```

## Reusability

- `config/types.ts` defines mission-agnostic interfaces.
- `config/artemis-ii.ts` holds all Artemis II specifics.
- `config/ui.ts` stores personal tweaks (preferred camera, units, hotkeys).
- To add Artemis III: create `artemis-iii.ts`, swap the import in `page.tsx`.
- Components consume the store and config -- they never hardcode mission data.

## Data Strategy

- **Primary**: Proxy to NASA AROW via `/api/trajectory` (polls every 30s from client).
- **Fallback**: Client-side orbital computation from waypoints/ephemeris.
- **Smoothing**: Linear interpolation between data points for fluid Orion movement.
- **Geek features**: Time scrubber, playback speed control, manual delta-V input in simulator.
- **Data gaps**: Show last-known + projected path with "COMPUTED" badge.

## Implementation Steps

### Step 1: Push updated plan
Replace IMPLEMENTATION_PLAN.md with this document and push to GitHub.

### Step 2: Install new dependencies
```
npm install framer-motion zustand
```

### Step 3: Foundation
- `src/config/ui.ts` -- personal preferences object
- `src/store/simulation.ts` -- Zustand store

### Step 4: Hooks
- `src/hooks/useSimulationClock.ts`
- `src/hooks/useMissionData.ts`
- `src/hooks/useKeyboard.ts`

### Step 5: Core UI components
- `src/components/KeyboardControls.tsx`
- `src/components/MissionHeader.tsx`
- `src/components/TimeScrubber.tsx`

### Step 6: 3D Visualization
- `src/components/OrbitScene.tsx`
- `src/components/SceneView.tsx`

### Step 7: Dashboard sections
- `src/components/Timeline.tsx`
- `src/components/TelemetryCharts.tsx`
- `src/components/CrewSection.tsx`
- `src/components/EducationSection.tsx`

### Step 8: Pages
- `src/app/page.tsx` -- main dashboard
- `src/app/simulator/page.tsx` -- geek simulator

### Step 9: Build verification + push
- `npm run build` -- must pass clean
- Commit and push all to `claude/artemis-mission-tracker-g0AJn`

## Verification Checklist

- [ ] `npm run dev` loads dashboard at localhost:3000 with dark space theme
- [ ] MET clock ticks every second in real-time
- [ ] Space bar toggles live/pause; 3D scene pauses/resumes
- [ ] Scrubber slider moves Orion position in 3D scene
- [ ] 1/2/3/4 keys set playback speed; fast-forward visible in scene
- [ ] E/M/O keys smoothly animate camera to Earth/Moon/Orion
- [ ] ? key shows hotkey cheatsheet overlay
- [ ] Timeline highlights current milestone; clicking scrubs to it
- [ ] Charts show current-MET reference line moving in sync
- [ ] /simulator route loads; manual burn inputs and export work
- [ ] `npm run build` completes without TypeScript or lint errors
- [ ] Works on narrow viewport (mobile responsive)

---

*Personal fan project -- not affiliated with NASA. All mission data sourced from public NASA materials.*
*NASA Artemis tracking: https://www.nasa.gov/trackartemis/*
