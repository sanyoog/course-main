'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../types';
import { ResourceCard } from './ResourceCard';

interface Props {
  data: AppData;
  completed: Set<string>;
  toggleCompleted: (id: string) => void;
  sectionIds: string[];
  resetSection: (ids: string[]) => void;
}

export function MathPage({ data, completed, toggleCompleted, sectionIds, resetSection }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completedCount = sectionIds.filter(id => completed.has(id)).length;
  const { topics } = data.mathematics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Header */}
      <div>
        <div style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Mathematics ·· {topics.length} Topics
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {data.mathematics.sectionTitle}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          {data.mathematics.sectionSubtitle}
        </p>
      </div>

      {/* Accordion list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {topics.map((topic, topicIdx) => {
          const isOpen = expandedId === topic.id;
          const topicCompleted = topic.resources.filter(r => completed.has(r.id)).length;
          const topicTotal = topic.resources.length;

          return (
            <div key={topic.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 3, overflow: 'hidden' }}>
              {/* Accordion header */}
              <motion.button
                onClick={() => setExpandedId(isOpen ? null : topic.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  background: isOpen ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderLeft: isOpen ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                whileHover={{ background: 'var(--surface-hover)' } as never}
              >
                {/* Priority badge */}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                  padding: '1px 5px',
                  flexShrink: 0,
                }}>
                  P{topic.priority}
                </span>

                {/* Topic icon (monospace) */}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--accent)',
                  flexShrink: 0,
                  minWidth: 36,
                }}>
                  {topic.icon}
                </span>

                {/* Title */}
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}>
                  {topic.title}
                </span>

                {/* Completion indicator */}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: topicCompleted === topicTotal ? 'var(--green)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}>
                  {topicCompleted}/{topicTotal}
                </span>

                {/* Completion dot */}
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: topicCompleted === topicTotal ? 'var(--green)' : topicCompleted > 0 ? 'var(--accent)' : 'var(--border)',
                  flexShrink: 0,
                }} />

                {/* Chevron */}
                <motion.span
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: 'var(--text-muted)', fontSize: 12, flexShrink: 0 }}
                >
                  ›
                </motion.span>
              </motion.button>

              {/* Accordion content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {/* Why it matters */}
                      <div style={{
                        borderLeft: '2px solid var(--accent)',
                        paddingLeft: 12,
                        marginTop: 12,
                      }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                          Why it matters
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                          {topic.whyItMatters}
                        </p>
                      </div>

                      {/* ML Connections */}
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                          ML Connections
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {topic.mlConnections.map(conn => (
                            <span key={conn} style={{
                              fontSize: 11,
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border)',
                              borderRadius: 2,
                              padding: '2px 8px',
                              fontFamily: 'var(--font-mono)',
                            }}>
                              {conn}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Subtopics */}
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                          Subtopics
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                          {topic.subtopics.map(sub => (
                            <div key={sub} style={{
                              fontSize: 12,
                              color: 'var(--text-secondary)',
                              fontFamily: 'var(--font-mono)',
                              display: 'flex',
                              gap: 8,
                              alignItems: 'flex-start',
                            }}>
                              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>·</span>
                              <span>{sub}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                          Resources · {topicTotal}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {topic.resources.map((r, idx) => (
                            <ResourceCard
                              key={r.id}
                              resource={r}
                              completed={completed.has(r.id)}
                              onToggle={() => toggleCompleted(r.id)}
                              index={idx}
                            />
                          ))}
                        </div>

                        {/* Empty state */}
                        {topicCompleted === 0 && (
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, fontFamily: 'var(--font-mono)' }}>
                            Nothing tracked yet. Start with resource 01.
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Reset section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {completedCount} of {sectionIds.length} resources completed
        </span>
        <button
          onClick={() => resetSection(sectionIds)}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            padding: '4px 12px',
            borderRadius: 2,
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
          }}
        >
          Reset section
        </button>
      </div>
    </div>
  );
}
