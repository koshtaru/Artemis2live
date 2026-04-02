"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mission from "@/config/artemis-ii";

export default function EducationSection() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 p-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">
        Learn More
      </h2>
      {mission.educationTopics.map((topic) => {
        const isOpen = open === topic.id;
        return (
          <div key={topic.id} className="rounded-lg border border-white/8 overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : topic.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/4 transition-colors"
            >
              <span className="text-sm font-medium text-white/80">{topic.title}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-white/40 flex-shrink-0 ml-2"
              >
                ▼
              </motion.span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 border-t border-white/8">
                    {topic.content.split("\n\n").map((para, i) => (
                      <p key={i} className="text-sm text-white/60 leading-relaxed mt-2">
                        {para.trim()}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Attribution */}
      <p className="text-xs text-white/20 mt-2 text-center">
        Personal fan project — not affiliated with NASA.{" "}
        <span className="text-white/30">Data from public NASA sources.</span>
      </p>
    </div>
  );
}
