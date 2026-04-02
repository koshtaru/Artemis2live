"use client";

import { useEffect, useCallback } from "react";
import { useSimulationStore } from "@/store/simulation";
import mission from "@/config/artemis-ii";

interface KeyboardOptions {
  onFocusEarth?: () => void;
  onFocusMoon?: () => void;
  onFocusOrion?: () => void;
  onToggleHelp?: () => void;
}

const SCRUB_AMOUNT = 3600; // 1 hour in seconds

export function useKeyboard(options: KeyboardOptions = {}) {
  const { isLive, setLive, setMET, setPlaybackSpeed, met } = useSimulationStore();

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // Don't fire when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setLive(!isLive);
          break;
        case "KeyL":
          setLive(true);
          break;
        case "KeyE":
          options.onFocusEarth?.();
          break;
        case "KeyM":
          options.onFocusMoon?.();
          break;
        case "KeyO":
          options.onFocusOrion?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setMET(Math.max(0, met - SCRUB_AMOUNT));
          break;
        case "ArrowRight":
          e.preventDefault();
          setMET(Math.min(mission.missionDurationSeconds, met + SCRUB_AMOUNT));
          break;
        case "Digit1":
          setPlaybackSpeed(1);
          break;
        case "Digit2":
          setPlaybackSpeed(10);
          break;
        case "Digit3":
          setPlaybackSpeed(100);
          break;
        case "Digit4":
          setPlaybackSpeed(1000);
          break;
        case "Slash":
          if (e.shiftKey) options.onToggleHelp?.();
          break;
      }
    },
    [isLive, met, setLive, setMET, setPlaybackSpeed, options]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);
}
