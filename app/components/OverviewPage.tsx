"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AppData, NavSection } from "../types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  const overallProgress = allIds.length > 0 ? Math.round((totalCompleted / allIds.length) * 100) : 0;

  // Stats
  const totalResources = data.meta.totalResources;
  const totalBooks = data.freeBooksAndPapers.books.length;
  const totalPapers = data.freeBooksAndPapers.seminalPapers.length;
  const totalWeeks = "18–24 months";

  const countCompleted = useCountUp(totalCompleted);
  const countTotalItems = useCountUp(allIds.length);
  const countBooks = useCountUp(totalBooks);
  const countPapers = useCountUp(totalPapers);

  // Prepare chart data
  const phaseData = useMemo(() => {
    return data.roadmap.phases.map((phase) => {
      const progress = phaseProgress(phase.id);
      const phaseItems = bySection[PHASE_TO_SECTION[phase.id]] || [];
      const completedCount = phaseItems.filter((id) => completed.has(id)).length;
      const remaining = phaseItems.length - completedCount;
      
      return {
        name: `Phase ${phase.phase}`,
        title: phase.title,
        progress,
        completed: completedCount,
        remaining,
        total: phaseItems.length,
        color: phase.color,
      };
    });
  }, [data.roadmap.phases, bySection, completed, phaseProgress]);

  // Category breakdown data
  const categoryData = useMemo(() => {
    const categories = [
      { name: "Math", section: "math", color: "#6366f1" },
      { name: "Python", section: "python", color: "#f59e0b" },
      { name: "ML", section: "ml", color: "#10b981" },
      { name: "Deep Learning", section: "deeplearning", color: "#ef4444" },
      { name: "Architectures", section: "architectures", color: "#8b5cf6" },
    ];

    return categories.map((cat) => {
      const items = bySection[cat.section] || [];
      const completedCount = items.filter((id) => completed.has(id)).length;
      return {
        name: cat.name,
        value: items.length,
        completed: completedCount,
        remaining: items.length - completedCount,
        color: cat.color,
      };
    });
  }, [bySection, completed]);

  // Simulated progress over time (mock data - would be real in production)
  const progressOverTime = useMemo(() => {
    const weeks = 12;
    const data = [];
    for (let i = 0; i <= weeks; i++) {
      const progress = Math.min(overallProgress, Math.floor((overallProgress / weeks) * i));
      data.push({
        week: `W${i}`,
        progress: i === weeks ? overallProgress : progress,
        target: Math.floor((100 / 52) * i), // Assuming 52-week target
      });
    }
    return data;
  }, [overallProgress]);

  // Learning velocity (items per week)
  const learningVelocity = useMemo(() => {
    const avgPerWeek = (totalCompleted / 12).toFixed(1); // Assuming 12 weeks of tracking
    const projected = Math.floor((allIds.length - totalCompleted) / parseFloat(avgPerWeek));
    return { avgPerWeek, projected };
  }, [totalCompleted, allIds.length]);

  // Radar chart data for skills assessment
  const skillsData = useMemo(() => {
    return [
      {
        skill: "Math",
        progress: phaseData[0]?.progress || 0,
        fullMark: 100,
      },
      {
        skill: "Python",
        progress: phaseData[1]?.progress || 0,
        fullMark: 100,
      },
      {
        skill: "ML",
        progress: phaseData[2]?.progress || 0,
        fullMark: 100,
      },
      {
        skill: "Deep Learning",
        progress: phaseData[3]?.progress || 0,
        fullMark: 100,
      },
      {
        skill: "Architecture",
        progress: phaseData[4]?.progress || 0,
        fullMark: 100,
      },
    ];
  }, [phaseData]);

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

      {/* Overall Progress */}
      <div style={{ padding: "24px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 4, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall Course Progress</div>
            <div style={{ fontSize: 32, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-primary)", lineHeight: 1 }}>{overallProgress}%</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{totalCompleted} / {allIds.length} items completed</div>
        </div>
        <div style={{ height: 6, background: "var(--border-subtle)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: overallProgress + "%" }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ height: "100%", background: "var(--accent)" }} />
        </div>
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
          { label: "Total Items", value: countTotalItems },
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

      {/* Learning Analytics Dashboard */}
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
          Learning Analytics
        </div>

        {/* Velocity and Projection */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            marginBottom: 1,
            border: "1px solid var(--border-subtle)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              background: "var(--surface)",
              borderRight: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 20,
                fontWeight: 500,
                color: "var(--accent)",
                letterSpacing: "-0.02em",
              }}
            >
              {learningVelocity.avgPerWeek}
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
              Items / Week
            </div>
          </div>
          <div
            style={{
              padding: "20px 24px",
              background: "var(--surface)",
              borderRight: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 20,
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              ~{learningVelocity.projected}
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
              Weeks to Complete
            </div>
          </div>
          <div
            style={{
              padding: "20px 24px",
              background: "var(--surface)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 20,
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {allIds.length - totalCompleted}
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
              Remaining Items
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            border: "1px solid var(--border-subtle)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Progress Over Time */}
          <div
            style={{
              padding: "24px",
              background: "var(--surface)",
              borderRight: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Progress Trend
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
              }}
            >
              Actual vs Target Completion
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="week"
                  stroke="var(--text-muted)"
                  style={{ fontSize: 10 }}
                />
                <YAxis stroke="var(--text-muted)" style={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 3,
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent)", r: 3 }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="var(--text-muted)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Radar */}
          <div
            style={{
              padding: "24px",
              background: "var(--surface)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Skills Assessment
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
              }}
            >
              Phase Completion by Domain
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="skill"
                  stroke="var(--text-muted)"
                  style={{ fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  stroke="var(--text-muted)"
                  style={{ fontSize: 9 }}
                />
                <Radar
                  name="Progress"
                  dataKey="progress"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Phase Completion Bar Chart */}
          <div
            style={{
              padding: "24px",
              background: "var(--surface)",
              borderTop: "1px solid var(--border-subtle)",
              borderRight: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Phase Breakdown
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
              }}
            >
              Completed vs Remaining by Phase
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={phaseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  style={{ fontSize: 10 }}
                />
                <YAxis stroke="var(--text-muted)" style={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 3,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="completed" stackId="a" fill="var(--accent)" />
                <Bar
                  dataKey="remaining"
                  stackId="a"
                  fill="var(--border-subtle)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution Pie Chart */}
          <div
            style={{
              padding: "24px",
              background: "var(--surface)",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Resource Distribution
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
              }}
            >
              Items by Category
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 3,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
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
