"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AppData, NavSection } from "../types";

interface Props {
  data: AppData;
  completed: Set<string>;
  bySection: Record<string, string[]>;
  phaseProgress: (phaseId: string) => number;
  setActiveSection: (s: NavSection) => void;
}

const PHASE_TO_SECTION: Record<string, NavSection> = {
  "phase-1": "math",
  "phase-2": "python",
  "phase-3": "ml",
  "phase-4": "deeplearning",
  "phase-5": "architectures",
};

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

// Circular progress ring
function ProgressRing({ pct, size = 52 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={2}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
}

export function OverviewPage({
  data,
  completed,
  bySection,
  phaseProgress,
  setActiveSection,
}: Props) {
  const allIds = Object.values(bySection).flat();
  const totalCompleted = allIds.filter((id) => completed.has(id)).length;

  // Stats
  const totalResources = data.meta.totalResources;
  const totalBooks = data.freeBooksAndPapers.books.length;
  const totalPapers = data.freeBooksAndPapers.seminalPapers.length;
  const totalWeeks = "18–24 months";

  const countCompleted = useCountUp(totalCompleted);
  const countResources = useCountUp(totalResources);
  const countBooks = useCountUp(totalBooks);
  const countPapers = useCountUp(totalPapers);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Overview ·· {data.roadmap.phases.length} Phases
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          {data.meta.title}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            maxWidth: 560,
            lineHeight: 1.6,
          }}
        >
          {data.meta.subtitle}
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          border: "1px solid var(--border-subtle)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {[
          { label: "Resources", value: countResources },
          { label: "Completed", value: countCompleted },
          { label: "Books", value: countBooks },
          { label: "Papers", value: countPapers },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "20px 24px",
              background: "var(--surface)",
              borderRight: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 24,
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 2,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Phase cards */}
      <div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Learning Phases
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 1,
            border: "1px solid var(--border-subtle)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {data.roadmap.phases.map((phase, i) => {
            const pct = phaseProgress(phase.id);
            const section = PHASE_TO_SECTION[phase.id];

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                onClick={() => section && setActiveSection(section)}
                style={{
                  padding: "20px 20px",
                  background: "var(--surface)",
                  borderRight: "1px solid var(--border-subtle)",
                  cursor: section ? "pointer" : "default",
                  position: "relative",
                  overflow: "hidden",
                  transition: "background 0.15s",
                }}
                whileHover={{ background: "var(--surface-hover)" } as never}
              >
                {/* Phase number */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 36,
                    fontWeight: 500,
                    color: "var(--border)",
                    lineHeight: 1,
                    marginBottom: 12,
                    letterSpacing: "-0.04em",
                    userSelect: "none",
                  }}
                >
                  0{phase.phase}
                </div>

                {/* Title + ring */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        lineHeight: 1.3,
                      }}
                    >
                      {phase.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {phase.subtitle}
                    </div>
                  </div>
                  <ProgressRing pct={pct} size={40} />
                </div>

                {/* Meta */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    {phase.estimatedWeeks} weeks
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: pct > 0 ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {pct}%
                  </span>
                </div>

                {/* Bottom accent bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "var(--border-subtle)",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      delay: 0.4 + i * 0.08,
                    }}
                    style={{ height: "100%", background: "var(--accent)" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Vertical timeline */}
      <div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Learning Timeline ·· {totalWeeks}
        </div>
        <div style={{ position: "relative", paddingLeft: 32 }}>
          {/* Vertical line */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{
              position: "absolute",
              left: 7,
              top: 8,
              width: 1,
              background: "var(--border)",
              transformOrigin: "top",
            }}
          />

          {data.roadmap.phases.map((phase, i) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.25 }}
              style={{
                position: "relative",
                paddingBottom: 28,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              {/* Node */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.4 + i * 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                style={{
                  position: "absolute",
                  left: -28,
                  top: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    phaseProgress(phase.id) > 0
                      ? "var(--accent)"
                      : "var(--border)",
                  border: "1px solid var(--border)",
                  flexShrink: 0,
                }}
              />

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--accent)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Phase {phase.phase}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {phase.estimatedWeeks} weeks
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {phase.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    maxWidth: 480,
                  }}
                >
                  {phase.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Target audience */}
      <div
        style={{
          padding: "16px 20px",
          border: "1px solid var(--border-subtle)",
          borderRadius: 3,
          borderLeft: "2px solid var(--accent)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            marginBottom: 4,
          }}
        >
          COURSE PLAN
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {data.meta.targetAudience}
        </div>
      </div>
    </div>
  );
}
