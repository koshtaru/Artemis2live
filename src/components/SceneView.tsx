"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { SceneHandle } from "./OrbitScene";

const OrbitScene = dynamic(() => import("./OrbitScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-space-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-artemis-blue/40 border-t-artemis-blue animate-spin" />
        <span className="text-xs text-white/40 font-mono">Loading 3D scene…</span>
      </div>
    </div>
  ),
});

const SceneView = forwardRef<SceneHandle>((_, ref) => {
  return <OrbitScene ref={ref} />;
});

SceneView.displayName = "SceneView";

export default SceneView;
