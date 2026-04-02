"use client";

import { useRef } from "react";
import { useSimulationClock } from "@/hooks/useSimulationClock";
import MissionHeader from "@/components/MissionHeader";
import SceneView from "@/components/SceneView";
import TimeScrubber from "@/components/TimeScrubber";
import Timeline from "@/components/Timeline";
import TelemetryCharts from "@/components/TelemetryCharts";
import FlightDynamics from "@/components/FlightDynamics";
import MissionProgress from "@/components/MissionProgress";
import EducationSection from "@/components/EducationSection";
import KeyboardControls from "@/components/KeyboardControls";
import type { SceneHandle } from "@/components/OrbitScene";

export default function Home() {
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
      </div>

      {/* Right: Dashboard panels */}
      <div className="flex flex-col lg:w-[40%] overflow-y-auto border-l border-white/8 scrollbar-thin">
        <MissionHeader />
        <FlightDynamics />
        <Timeline />
        <TelemetryCharts />
        <MissionProgress />
        <EducationSection />
      </div>

      <KeyboardControls
        onFocusEarth={() => sceneRef.current?.focusEarth()}
        onFocusMoon={() => sceneRef.current?.focusMoon()}
        onFocusOrion={() => sceneRef.current?.focusOrion()}
      />
    </div>
  );
}
