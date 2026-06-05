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

const TAB_LABELS: Record<string, string> = {
  'arch-transformers': 'Transformers',
  'arch-generative': 'Generative',
  'arch-gnns': 'GNNs',
  'arch-ssm': 'SSMs',
  'arch-rl': 'RL',
};

export function ArchitecturesPage({ data, completed, toggleCompleted, sectionIds, resetSection }: Props) {
  const { architectureGroups } = data.architectures;
  const [activeTab, setActiveTab] = useState(architectureGroups[0]?.id ?? '');
  const [selectedArch, setSelectedArch] = useState<string | null>(null);
  const completedCount = sectionIds.filter(id => completed.has(id)).length;

  const activeGroup = architectureGroups.find(g => g.id === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
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
          Architectures ·· {architectureGroups.length} Groups
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {data.architectures.sectionTitle}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          {data.architectures.sectionSubtitle}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--border-subtle)',
          overflowX: 'auto',
        }}>
          {architectureGroups.map(group => (
            <button
              key={group.id}
              onClick={() => { setActiveTab(group.id); setSelectedArch(null); }}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === group.id ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === group.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
                marginBottom: -1,
                position: 'relative',
              }}
            >
              {TAB_LABELS[group.id] ?? group.groupTitle}
              {/* Framer Motion tab indicator via layoutId */}
              {activeTab === group.id && (
                <motion.div
                  layoutId="tab-indicator"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'var(--accent)',
                    borderRadius: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeGroup && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}
            className="arch-grid"
          >
            {/* Left: Architecture list */}
            <div>
              <div style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}>
                Architectures
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activeGroup.architectures.map((arch, idx) => (
                  <motion.button
                    key={arch}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedArch(selectedArch === arch ? null : arch)}
                    style={{
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      color: selectedArch === arch ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      transition: 'color 0.15s',
                      textDecoration: selectedArch === arch ? 'underline' : 'none',
                      textUnderlineOffset: 3,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { if (selectedArch !== arch) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                  >
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>○</span>
                    <span style={{ lineHeight: 1.4 }}>{arch}</span>
                  </motion.button>
                ))}
              </div>

              {/* Group description */}
              <div style={{
                marginTop: 20,
                padding: '12px',
                borderLeft: '2px solid var(--border-subtle)',
                fontSize: 12,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}>
                {activeGroup.description}
              </div>
            </div>

            {/* Right: Resources */}
            <div>
              <div style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}>
                Resources · {activeGroup.resources.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {activeGroup.resources.map((r, idx) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    completed={completed.has(r.id)}
                    onToggle={() => toggleCompleted(r.id)}
                    index={idx}
                  />
                ))}
              </div>

              {activeGroup.resources.filter(r => completed.has(r.id)).length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 10 }}>
                  Nothing tracked yet. Start with resource 01.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <style>{`
        @media (max-width: 640px) {
          .arch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
