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

export function DeepLearningPage({ data, completed, toggleCompleted, sectionIds, resetSection }: Props) {
  const completedCount = sectionIds.filter(id => completed.has(id)).length;
  const { courses } = data.deepLearning;

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
          Deep Learning ·· {courses.length} Courses
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {data.deepLearning.sectionTitle}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          {data.deepLearning.sectionSubtitle}
        </p>
      </div>

      {/* Courses */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
            >
              <ResourceCard
                resource={course}
                completed={completed.has(course.id)}
                onToggle={() => toggleCompleted(course.id)}
                index={idx}
              />
            </motion.div>
          ))}
        </div>

        {completedCount === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 12, textAlign: 'center' }}>
            Nothing tracked yet. Start with resource 01.
          </p>
        )}
      </div>

      {/* Course detail cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
        }}>
          Course Details
        </div>
        {courses.map((course, idx) => (
          <motion.div
            key={`detail-${course.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05, duration: 0.2 }}
            style={{
              padding: '16px 20px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 3,
              borderLeft: completed.has(course.id) ? '2px solid var(--green)' : '2px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{course.name}</span>
            </div>
            {course.topics && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {course.topics.map(t => (
                  <span key={t} style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    padding: '1px 7px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Reset */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {completedCount} of {sectionIds.length} resources completed
        </span>
        <button
          onClick={() => resetSection(sectionIds)}
          style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 12px', borderRadius: 2, transition: 'color 0.15s, border-color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
        >
          Reset section
        </button>
      </div>
    </div>
  );
}
