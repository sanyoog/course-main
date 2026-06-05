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

function CourseList({ title, subtitle, courses, completed, toggleCompleted }: {
  title: string;
  subtitle: string;
  courses: AppData['machineLearning']['courses'];
  completed: Set<string>;
  toggleCompleted: (id: string) => void;
}) {
  const completedCount = courses.filter(c => completed.has(c.id)).length;

  return (
    <div>
      <div style={{
        fontSize: 11,
        letterSpacing: '0.12em',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        {title} ·· {courses.length} Courses
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
        {subtitle}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {courses.map((c, idx) => (
          <ResourceCard
            key={c.id}
            resource={c}
            completed={completed.has(c.id)}
            onToggle={() => toggleCompleted(c.id)}
            index={idx}
          />
        ))}
      </div>

      {completedCount === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 10 }}>
          Nothing tracked yet. Start with resource 01.
        </p>
      )}
    </div>
  );
}

export function MLPage({ data, completed, toggleCompleted, sectionIds, resetSection }: Props) {
  const completedCount = sectionIds.filter(id => completed.has(id)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div>
        <div style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Classical ML ·· {sectionIds.length} Resources
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {data.machineLearning.sectionTitle}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          {data.machineLearning.sectionSubtitle}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <CourseList
          title="Core Courses"
          subtitle={data.machineLearning.sectionSubtitle}
          courses={data.machineLearning.courses}
          completed={completed}
          toggleCompleted={toggleCompleted}
        />
      </motion.div>

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
