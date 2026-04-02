"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKeyboard } from "@/hooks/useKeyboard";

const HOTKEYS = [
  { key: "Space", desc: "Play / Pause" },
  { key: "L", desc: "Jump to Live" },
  { key: "← →", desc: "Scrub ±1 hour" },
  { key: "1 2 3 4", desc: "Speed: 1× 10× 100× 1000×" },
  { key: "E", desc: "Focus Earth" },
  { key: "M", desc: "Focus Moon" },
  { key: "O", desc: "Focus Orion" },
  { key: "?", desc: "Toggle this overlay" },
];

interface Props {
  onFocusEarth?: () => void;
  onFocusMoon?: () => void;
  onFocusOrion?: () => void;
}

export default function KeyboardControls({ onFocusEarth, onFocusMoon, onFocusOrion }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const toggleHelp = useCallback(() => setShowHelp((v) => !v), []);

  useKeyboard({
    onFocusEarth,
    onFocusMoon,
    onFocusOrion,
    onToggleHelp: toggleHelp,
  });

  return (
    <>
      {/* Help toggle button */}
      <button
        onClick={toggleHelp}
        className="fixed bottom-4 right-4 z-50 w-8 h-8 rounded-full border border-white/20 bg-space-800/80 text-white/60 hover:text-white hover:border-artemis-blue/60 transition-colors text-sm font-mono backdrop-blur-sm"
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-14 right-4 z-50 w-64 rounded-xl border border-white/10 bg-space-800/95 backdrop-blur-sm p-4 shadow-xl"
          >
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              Keyboard Shortcuts
            </h3>
            <ul className="space-y-2">
              {HOTKEYS.map(({ key, desc }) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-artemis-blue font-mono text-xs">
                    {key}
                  </kbd>
                  <span className="text-xs text-white/70 text-right">{desc}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
