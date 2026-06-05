'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resource } from '../types';

interface Props {
  resource: Resource;
  completed: boolean;
  onToggle: () => void;
  index?: number;
}

export function ResourceCard({ resource, completed, onToggle, index = 0 }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!completed) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
    onToggle();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.2 }}
        onClick={() => setDrawerOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          border: '1px solid var(--border-subtle)',
          borderRadius: 3,
          cursor: 'pointer',
          background: completed ? 'rgba(99,102,241,0.04)' : 'transparent',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        whileHover={{ background: 'var(--surface-hover)' }}
      >
        {/* Completion flash overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--accent)',
                pointerEvents: 'none',
                borderRadius: 3,
              }}
            />
          )}
        </AnimatePresence>

        {/* Completion dot */}
        <motion.button
          onClick={handleToggle}
          whileTap={{ scale: [null, 1.4, 1] }}
          transition={{ duration: 0.25, times: [0, 0.4, 1] }}
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            border: `1.5px solid ${completed ? 'var(--accent)' : 'var(--text-muted)'}`,
            background: completed ? 'var(--accent)' : 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
            transition: 'background 0.2s, border-color 0.2s',
          }}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        />

        {/* Resource name */}
        <span style={{
          flex: 1,
          fontSize: 13,
          color: completed ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: completed ? 'line-through' : 'none',
          transition: 'color 0.2s',
          lineHeight: 1.4,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {resource.name}
        </span>

        {/* University badge */}
        {resource.university && (
          <span style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            border: '1px solid var(--border)',
            borderRadius: 2,
            padding: '1px 6px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            {resource.university}
          </span>
        )}

        {/* Type tag */}
        {resource.type && (
          <span style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'none',
          }}
          className="resource-type"
          >
            {resource.type}
          </span>
        )}

        {/* Arrow */}
        <motion.span
          style={{
            color: 'var(--text-muted)',
            fontSize: 13,
            flexShrink: 0,
          }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.15 }}
        >
          →
        </motion.span>
      </motion.div>

      {/* Drawer */}
      <ResourceDrawer
        resource={resource}
        completed={completed}
        onToggle={onToggle}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <style>{`
        @media (min-width: 600px) {
          .resource-type { display: block !important; }
        }
      `}</style>
    </>
  );
}

// ── RESOURCE DRAWER ───────────────────────────────────────────────────────────

interface DrawerProps {
  resource: Resource;
  completed: boolean;
  onToggle: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function ResourceDrawer({ resource, completed, onToggle, isOpen, onClose }: DrawerProps) {
  const rating = resource.rating ?? 0;
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 100,
            }}
          />

          {/* Drawer panel - slides from right on desktop, bottom on mobile */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { x: 420 }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: 420 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            style={{
              position: 'fixed',
              background: 'var(--surface)',
              zIndex: 101,
              overflowY: 'auto',
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
            className="resource-drawer"
          >
            {/* Mobile handle */}
            {isMobile && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '-20px 0 12px',
              }}>
                <div style={{
                  width: 40,
                  height: 4,
                  background: 'var(--border)',
                  borderRadius: 2,
                }} />
              </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {resource.name}
                </div>
                {resource.instructor && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    {resource.instructor}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Rating */}
            {rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>rating</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 2 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: i < rating ? 'var(--accent)' : 'var(--border)' }}>
                      {i < rating ? '■' : '□'}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {resource.university && (
                <Pill>{resource.university}</Pill>
              )}
              {resource.type && (
                <Pill>{resource.type}</Pill>
              )}
              {resource.platform && (
                <Pill>{resource.platform}</Pill>
              )}
              {resource.isFree && (
                <Pill accent>Free</Pill>
              )}
            </div>

            {/* Description */}
            {resource.description && (
              <div style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                fontStyle: 'italic',
                borderLeft: '2px solid var(--accent)',
                paddingLeft: 12,
              }}>
                {resource.description}
              </div>
            )}

            {/* Audit note */}
            {resource.auditNote && (
              <div style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                background: 'var(--accent-dim)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 3,
                padding: '8px 12px',
              }}>
                {resource.auditNote}
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {resource.tags.map(tag => (
                  <Pill key={tag}>{tag}</Pill>
                ))}
              </div>
            )}

            {/* Format */}
            {resource.format && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Format: {resource.format}
              </div>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: 3,
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Open Resource
                <span>→</span>
              </a>

              <motion.button
                onClick={onToggle}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: `1px solid ${completed ? 'var(--green)' : 'var(--border)'}`,
                  color: completed ? 'var(--green)' : 'var(--text-secondary)',
                  borderRadius: 3,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
              >
                <span>{completed ? '● Completed' : '○ Mark as Complete'}</span>
                {completed && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>✓</span>}
              </motion.button>
            </div>

            <style>{`
              .resource-drawer {
                top: 0;
                right: 0;
                bottom: 0;
                width: 420px;
                border-left: 1px solid var(--border);
              }

              @media (max-width: 768px) {
                .resource-drawer {
                  top: auto;
                  right: 0;
                  bottom: 0;
                  left: 0;
                  width: 100%;
                  max-height: 85vh;
                  border-left: none;
                  border-top-left-radius: 16px;
                  border-top-right-radius: 16px;
                  padding: 24px 20px !important;
                }
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      fontSize: 11,
      color: accent ? 'var(--accent)' : 'var(--text-muted)',
      border: `1px solid ${accent ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
      borderRadius: 2,
      padding: '2px 8px',
      fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}
