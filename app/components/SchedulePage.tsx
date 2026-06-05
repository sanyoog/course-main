'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../types';

interface Props { data: AppData; }

// ── Schedule data per phase (5 phases, week+day breakdown) ────────────────────
type DayTask = { id: string; label: string; task: string; };
type WeekData = { week: number; days: DayTask[]; };
type PhaseSchedule = { phaseId: string; title: string; weeks: WeekData[]; };

function buildSchedule(data: AppData): PhaseSchedule[] {
  const phases = data.roadmap.phases;

  const mathTopics = data.mathematics.topics;
  const pyTopics = data.pythonML.topics;
  const mlCourses = data.machineLearning.courses;
  const dlCourses = data.deepLearning.courses;
  const archGroups = data.architectures.architectureGroups;

  function makeWeeks(items: string[], phaseIdx: number): WeekData[] {
    const weeks: WeekData[] = [];
    let dayCount = 0;
    let weekNum = 1;
    let days: DayTask[] = [];
    items.forEach((task) => {
      dayCount++;
      days.push({ id: `p${phaseIdx}-w${weekNum}-d${dayCount}`, label: `Day ${dayCount}`, task });
      if (days.length === 7) {
        weeks.push({ week: weekNum, days });
        weekNum++;
        days = [];
        dayCount = 0;
      }
    });
    if (days.length) weeks.push({ week: weekNum, days });
    return weeks;
  }

  return [
    {
      phaseId: phases[0].id, title: phases[0].title,
      weeks: makeWeeks(mathTopics.flatMap(t => t.subtopics ?? [t.title]), 1),
    },
    {
      phaseId: phases[1].id, title: phases[1].title,
      weeks: makeWeeks(pyTopics.flatMap(t => (t.keySkills ?? [t.title])), 2),
    },
    {
      phaseId: phases[2].id, title: phases[2].title,
      weeks: makeWeeks(mlCourses.flatMap(c => (c.topics ?? [c.name])), 3),
    },
    {
      phaseId: phases[3].id, title: phases[3].title,
      weeks: makeWeeks(dlCourses.flatMap(c => (c.topics ?? [c.name])), 4),
    },
    {
      phaseId: phases[4].id, title: phases[4].title,
      weeks: makeWeeks(archGroups.flatMap(g => g.architectures ?? [g.groupTitle]), 5),
    },
  ];
}

// Storage keys
const SK_PHASE = 'sched-phase';
const SK_START = 'sched-start';
const SK_DONE = 'sched-done';
const SK_SKIP = 'sched-skip';

function loadSet(key: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set(); }
}
function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

// Compute if a day is late based on start date
function getDayStatus(dayId: string, weekIdx: number, dayIdx: number, startDate: Date | null): 'future' | 'today' | 'on-time' | 'late' {
  if (!startDate) return 'future';
  const dayOffset = weekIdx * 7 + dayIdx;
  const expectedDate = new Date(startDate);
  expectedDate.setDate(startDate.getDate() + dayOffset);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expectedDate.setHours(0, 0, 0, 0);
  if (expectedDate > now) return 'future';
  if (expectedDate.getTime() === now.getTime()) return 'today';
  return 'late';
}

export function SchedulePage({ data }: Props) {
  const schedule = buildSchedule(data);

  const [selectedPhase, setSelectedPhase] = useState('phase-1');
  const [startDateStr, setStartDateStr] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    setSelectedPhase(localStorage.getItem(SK_PHASE) || 'phase-1');
    const sd = localStorage.getItem(SK_START);
    if (sd) { setStartDateStr(sd); setStartDate(new Date(sd)); }
    setDone(loadSet(SK_DONE));
    setSkipped(loadSet(SK_SKIP));
  }, []);

  const phase = schedule.find(p => p.phaseId === selectedPhase) ?? schedule[0];

  const totalDays = phase.weeks.reduce((a, w) => a + w.days.length, 0);
  const doneDays = phase.weeks.reduce((a, w) => a + w.days.filter(d => done.has(d.id)).length, 0);
  const pct = totalDays > 0 ? Math.round((doneDays / totalDays) * 100) : 0;

  function handleDateChange(val: string) {
    setStartDateStr(val);
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      setStartDate(d);
      localStorage.setItem(SK_START, val);
    }
  }

  function handlePhaseChange(phaseId: string) {
    setSelectedPhase(phaseId);
    localStorage.setItem(SK_PHASE, phaseId);
    setExpandedWeeks(new Set([1]));
  }

  function toggleDone(id: string) {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveSet(SK_DONE, next);
      return next;
    });
  }

  function toggleSkip(id: string) {
    setSkipped(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveSet(SK_SKIP, next);
      return next;
    });
  }

  function toggleWeek(w: number) {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(w) ? next.delete(w) : next.add(w);
      return next;
    });
  }

  // Count late/skipped for badge
  let lateCount = 0;
  phase.weeks.forEach((w, wi) => {
    w.days.forEach((d, di) => {
      if (!done.has(d.id) && !skipped.has(d.id)) {
        const st = getDayStatus(d.id, wi, di, startDate);
        if (st === 'late') lateCount++;
      }
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 12 }}>
          Schedule ·· Phase Calendar
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {data.weeklySchedule.sectionTitle}
        </h1>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{data.weeklySchedule.totalMonths}</span>
          {lateCount > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 2, padding: '2px 8px' }}>
              {lateCount} late
            </span>
          )}
        </div>
      </div>

      {/* Phase selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {schedule.map(p => (
          <button
            key={p.phaseId}
            onClick={() => handlePhaseChange(p.phaseId)}
            style={{
              padding: '5px 14px', border: '1px solid', borderRadius: 2, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em',
              background: selectedPhase === p.phaseId ? 'var(--accent)' : 'transparent',
              color: selectedPhase === p.phaseId ? '#fff' : 'var(--text-secondary)',
              borderColor: selectedPhase === p.phaseId ? 'var(--accent)' : 'var(--border)',
              transition: 'all 0.15s',
            }}
          >
            {p.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Start date + progress */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', padding: '14px 16px', border: '1px solid var(--border-subtle)', borderRadius: 3 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>Start date</span>
        <input
          type="date" value={startDateStr} onChange={e => handleDateChange(e.target.value)}
          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 2, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '4px 10px', outline: 'none', colorScheme: 'dark' }}
        />
        <div style={{ flex: 1, height: 2, background: 'var(--border-subtle)', borderRadius: 1, overflow: 'hidden', minWidth: 80 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ height: '100%', background: pct === 100 ? '#22c55e' : 'var(--accent)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: pct > 0 ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}>{doneDays}/{totalDays} · {pct}%</span>
      </div>

      {/* Week calendar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {phase.weeks.map((week, wi) => {
          const weekDone = week.days.filter(d => done.has(d.id)).length;
          const isOpen = expandedWeeks.has(week.week);

          return (
            <motion.div key={week.week} layout style={{ border: '1px solid var(--border-subtle)', borderRadius: 3, overflow: 'hidden', background: 'var(--surface)' }}>
              {/* Week header */}
              <button onClick={() => toggleWeek(week.week)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.18 }} style={{ color: 'var(--text-muted)', fontSize: 10, flexShrink: 0 }}>▶</motion.span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>Week {week.week}</span>
                <div style={{ flex: 1, height: 2, background: 'var(--border-subtle)', borderRadius: 1, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${week.days.length > 0 ? Math.round(weekDone / week.days.length * 100) : 0}%` }} transition={{ duration: 0.5 }} style={{ height: '100%', background: weekDone === week.days.length ? '#22c55e' : 'var(--accent)' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{weekDone}/{week.days.length}</span>
              </button>

              {/* Days grid */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
                      {week.days.map((day, di) => {
                        const isDone = done.has(day.id);
                        const isSkipped = skipped.has(day.id);
                        const status = getDayStatus(day.id, wi, di, startDate);
                        const isLate = !isDone && !isSkipped && status === 'late';
                        const isToday = status === 'today';

                        return (
                          <motion.div
                            key={day.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: di * 0.03, duration: 0.18 }}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px',
                              borderBottom: di < week.days.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                              background: isToday ? 'rgba(99,102,241,0.04)' : 'transparent',
                              borderLeft: isToday ? '2px solid var(--accent)' : isLate ? '2px solid rgba(239,68,68,0.5)' : '2px solid transparent',
                            }}
                          >
                            {/* Day label */}
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isToday ? 'var(--accent)' : isLate ? 'var(--red)' : 'var(--text-muted)', flexShrink: 0, minWidth: 40, paddingTop: 1 }}>
                              {day.label}
                            </span>

                            {/* Task */}
                            <span style={{ flex: 1, fontSize: 12, color: isDone ? 'var(--text-muted)' : isSkipped ? 'var(--text-muted)' : 'var(--text-primary)', textDecorationLine: isDone ? 'line-through' : 'none', textDecorationColor: 'var(--border)', lineHeight: 1.5, opacity: isSkipped ? 0.5 : 1 }}>
                              {day.task}
                              {isLate && !isDone && !isSkipped && (
                                <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>late</span>
                              )}
                              {isSkipped && (
                                <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>skipped</span>
                              )}
                            </span>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button
                                onClick={() => toggleDone(day.id)}
                                title={isDone ? 'Mark incomplete' : 'Mark done'}
                                style={{
                                  width: 22, height: 22, borderRadius: 2, border: '1px solid', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: isDone ? '#22c55e' : 'transparent',
                                  borderColor: isDone ? '#22c55e' : 'var(--border)',
                                  color: isDone ? '#fff' : 'var(--text-muted)',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {isDone ? '✓' : ''}
                              </button>
                              <button
                                onClick={() => toggleSkip(day.id)}
                                title={isSkipped ? 'Unskip' : 'Skip'}
                                style={{
                                  width: 22, height: 22, borderRadius: 2, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: 'transparent', color: isSkipped ? 'var(--red)' : 'var(--text-muted)',
                                  borderColor: isSkipped ? 'rgba(239,68,68,0.4)' : 'var(--border)',
                                  transition: 'all 0.15s', fontFamily: 'var(--font-mono)',
                                }}
                              >
                                —
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Late note */}
      {lateCount > 0 && (
        <div style={{ padding: '12px 16px', border: '1px solid rgba(239,68,68,0.2)', borderLeft: '2px solid var(--red)', borderRadius: 3, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{lateCount} items behind schedule.</span>{' '}
          Skipped days shift forward — mark them skipped to keep your calendar clean, or check them done when complete.
        </div>
      )}

      <div style={{ padding: '12px 16px', border: '1px solid var(--border-subtle)', borderLeft: '2px solid var(--accent)', borderRadius: 3, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        2–4 hours of focused study per day. Consistency over speed.
      </div>
    </div>
  );
}
