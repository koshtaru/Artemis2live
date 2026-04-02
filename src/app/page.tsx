"use client";

import { useRef } from "react";
import { useSimulationClock } from "@/hooks/useSimulationClock";
import MissionHeader from "@/components/MissionHeader";
import SceneView from "@/components/SceneView";
import TimeScrubber from "@/components/TimeScrubber";
import Timeline from "@/components/Timeline";
import TelemetryCharts from "@/components/TelemetryCharts";
import CrewSection from "@/components/CrewSection";
import EducationSection from "@/components/EducationSection";
import KeyboardControls from "@/components/KeyboardControls";
import type { SceneHandle } from "@/components/OrbitScene";
import Link from "next/link";

export default function Home() {
  // Start the simulation clock
  useSimulationClock();

  const sceneRef = useRef<SceneHandle>(null);

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
      {/* Left: 3D Scene */}
      <div className="relative flex flex-col lg:w-[60%] h-[50vh] lg:h-screen flex-shrink-0">
        <SceneView ref={sceneRef} />
        <div className="absolute bottom-0 left-0 right-0">
          <TimeScrubber />
        </div>
        {/* Simulator link */}
        <Link
          href="/simulator"
          className="absolute top-3 left-3 px-2.5 py-1 rounded-lg border border-white/15 bg-black/50 backdrop-blur-sm text-xs text-white/60 hover:text-white hover:border-artemis-blue/50 transition-colors"
        >
          ⚗ Simulator
        </Link>
      </div>

      {/* Right: Dashboard panels */}
      <div className="flex flex-col lg:w-[40%] overflow-y-auto border-l border-white/8">
        <MissionHeader />
        <Timeline />
        <TelemetryCharts />
        <CrewSection />
        <EducationSection />
      </div>

      {/* Keyboard controls (no visual, just listener + overlay) */}
      <KeyboardControls
        onFocusEarth={() => sceneRef.current?.focusEarth()}
        onFocusMoon={() => sceneRef.current?.focusMoon()}
        onFocusOrion={() => sceneRef.current?.focusOrion()}
      />
    </div>
  );
}
