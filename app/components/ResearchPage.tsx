'use client';

import { motion } from 'framer-motion';
import { AppData } from '../types';
import { ResourceCard } from './ResourceCard';

interface Props {
  data: AppData;
  completed: Set<string>;
  toggleCompleted: (id: string) => void;
  sectionIds: string[];
  resetSection: (ids: string[]) => void;
}

export function ResearchPage({ data, completed, toggleCompleted, sectionIds, resetSection }: Props) {
  const { topics } = data.researchMethodology;
  const completedCount = sectionIds.filter(id => completed.has(id)).length;

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
          Phase 6 ·· {topics.length} Topics
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {data.researchMethodology.sectionTitle}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          {data.researchMethodology.sectionSubtitle}
        </p>
      </div>

      {/* Topics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {topics.map((topic, topicIdx) => {
          const topicCompleted = topic.resources.filter(r => completed.has(r.id)).length;

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: topicIdx * 0.06, duration: 0.2 }}
            >
              {/* Topic header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                  padding: '1px 6px',
                }}>
                  0{topicIdx + 1}
                </span>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                  {topic.title}
                </h2>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: topicCompleted === topic.resources.length ? 'var(--green)' : 'var(--text-muted)' }}>
                  {topicCompleted}/{topic.resources.length}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                {topic.description}
              </p>

              {/* Key skills */}
              {topic.keySkills && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {topic.keySkills.map(skill => (
                    <span key={skill} style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      borderRadius: 2,
                      padding: '2px 8px',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Resources */}
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

              {topicCompleted === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 10 }}>
                  Nothing tracked yet. Start with resource 01.
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Reset */}
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
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
        >
          Reset section
        </button>
      </div>
    </div>
  );
}
