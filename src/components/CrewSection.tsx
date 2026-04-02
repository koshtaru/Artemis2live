"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mission from "@/config/artemis-ii";

const CREW_COLORS = ["#00b4d8", "#ff6b35", "#fca311", "#22c55e"];

export default function CrewSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-white/8">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Crew</h2>
      <div className="grid grid-cols-2 gap-2">
        {mission.crew.map((member, i) => {
          const color = CREW_COLORS[i % CREW_COLORS.length];
          const isExpanded = expanded === member.id;
          return (
            <motion.div
              key={member.id}
              layout
              onClick={() => setExpanded(isExpanded ? null : member.id)}
              className="flex flex-col gap-2 rounded-lg border border-white/8 bg-space-800 p-3 cursor-pointer hover:border-white/20 transition-colors"
              whileHover={{ y: -1 }}
            >
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: color + "20", color, border: `1px solid ${color}40` }}
                >
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                  <p className="text-xs text-white/50 truncate">{member.role}</p>
                </div>
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded border flex-shrink-0"
                  style={{ color, borderColor: color + "40", backgroundColor: color + "10" }}
                >
                  {member.agency}
                </span>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-white/60 leading-relaxed overflow-hidden"
                  >
                    {member.bio}
                  </motion.p>
                )}
              </AnimatePresence>
              {!isExpanded && (
                <p className="text-xs text-white/30">{isExpanded ? "▲ less" : "▼ more"}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
