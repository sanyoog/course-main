'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, NavSection } from '../types';
import { OverviewPage } from './OverviewPage';
import { MathPage } from './MathPage';
import { PythonPage } from './PythonPage';
import { MLPage } from './MLPage';
import { DeepLearningPage } from './DeepLearningPage';
import { ArchitecturesPage } from './ArchitecturesPage';
import { BooksPage } from './BooksPage';
import { SchedulePage } from './SchedulePage';
import { LoginPage } from './LoginPage';

interface Props {
  data: AppData;
}

const NAV_ITEMS: { id: NavSection; label: string; phaseId?: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'math', label: 'Mathematics', phaseId: 'phase-1' },
  { id: 'python', label: 'Python', phaseId: 'phase-2' },
  { id: 'ml', label: 'ML', phaseId: 'phase-3' },
  { id: 'deeplearning', label: 'Deep Learning', phaseId: 'phase-4' },
  { id: 'architectures', label: 'Architectures', phaseId: 'phase-5' },
  { id: 'books', label: 'Books & Papers' },
  { id: 'schedule', label: 'Schedule' },
];

// Collect all resource IDs from data
function getAllResourceIds(data: AppData): string[] {
  const ids: string[] = [];
  data.mathematics.topics.forEach(t => t.resources.forEach(r => ids.push(r.id)));
  data.pythonML.topics.forEach(t => t.resources.forEach(r => ids.push(r.id)));
  data.machineLearning.courses.forEach(r => ids.push(r.id));
  data.deepLearning.courses.forEach(r => ids.push(r.id));
  data.architectures.architectureGroups.forEach(g => g.resources.forEach(r => ids.push(r.id)));
  data.freeBooksAndPapers.books.forEach(b => ids.push(b.id));
  data.freeBooksAndPapers.seminalPapers.forEach(p => ids.push(p.id));
  return ids;
}

function getResourcesBySection(data: AppData): Record<string, string[]> {
  return {
    math: data.mathematics.topics.flatMap(t => t.resources.map(r => r.id)),
    python: data.pythonML.topics.flatMap(t => t.resources.map(r => r.id)),
    ml: data.machineLearning.courses.map(r => r.id),
    deeplearning: data.deepLearning.courses.map(r => r.id),
    architectures: data.architectures.architectureGroups.flatMap(g => g.resources.map(r => r.id)),
    books: [...data.freeBooksAndPapers.books.map(b => b.id), ...data.freeBooksAndPapers.seminalPapers.map(p => p.id)],
  };
}

export function AppShell({ data }: Props) {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavDrawerOpen, setMobileNavDrawerOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check session cookie on mount, then load user data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Read cookie
    const match = document.cookie.match(/ai-tracker-user=([^;]+)/);
    const uid = match ? decodeURIComponent(match[1]) : null;
    if (uid) {
      setUserId(uid);
      // Load from API
      fetch(`/api/user?userId=${encodeURIComponent(uid)}`)
        .then(r => r.json())
        .then(profile => {
          if (profile.completedResources?.length) {
            setCompleted(new Set(profile.completedResources));
          } else {
            // fall back to localStorage
            try {
              const stored = localStorage.getItem('ai-tracker-completed');
              if (stored) setCompleted(new Set(JSON.parse(stored)));
            } catch { /* ignore */ }
          }
        })
        .catch(() => {
          try {
            const stored = localStorage.getItem('ai-tracker-completed');
            if (stored) setCompleted(new Set(JSON.parse(stored)));
          } catch { /* ignore */ }
        })
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  const saveToAPI = useCallback((ids: string[], uid: string | null) => {
    if (!uid) return;
    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: uid,
        data: {
          userId: uid,
          completedResources: ids,
          schedule: { selectedPhase: 'phase-1', startDate: null, completedDays: {}, skippedDays: {} },
        },
      }),
    }).catch(() => { /* silent fail */ });
  }, []);

  const toggleCompleted = useCallback((id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      const arr = [...next];
      localStorage.setItem('ai-tracker-completed', JSON.stringify(arr));
      saveToAPI(arr, userId);
      return next;
    });
  }, [userId, saveToAPI]);

  const resetSection = useCallback((sectionIds: string[]) => {
    setCompleted(prev => {
      const next = new Set(prev);
      sectionIds.forEach(id => next.delete(id));
      const arr = [...next];
      localStorage.setItem('ai-tracker-completed', JSON.stringify(arr));
      saveToAPI(arr, userId);
      return next;
    });
  }, [userId, saveToAPI]);

  const handleLogin = useCallback((uid: string) => {
    setUserId(uid);
    // Reload user data after login
    fetch(`/api/user?userId=${encodeURIComponent(uid)}`)
      .then(r => r.json())
      .then(profile => {
        if (profile.completedResources?.length) setCompleted(new Set(profile.completedResources));
      })
      .catch(() => {});
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setUserId(null);
    setCompleted(new Set());
  }, []);

  const allIds = getAllResourceIds(data);
  const bySection = getResourcesBySection(data);
  const totalCompleted = allIds.filter(id => completed.has(id)).length;
  const totalResources = allIds.length;
  const overallPct = totalResources > 0 ? Math.round((totalCompleted / totalResources) * 100) : 0;

  const sectionProgress = (section: string) => {
    const ids = bySection[section] || [];
    if (ids.length === 0) return 0;
    return Math.round((ids.filter(id => completed.has(id)).length / ids.length) * 100);
  };

  const phaseProgress = (phaseId: string) => {
    // map phase to section
    const phaseMap: Record<string, string> = {
      'phase-1': 'math',
      'phase-2': 'python',
      'phase-3': 'ml',
      'phase-4': 'deeplearning',
      'phase-5': 'architectures',
    };
    const section = phaseMap[phaseId];
    return section ? sectionProgress(section) : 0;
  };

  // Show login gate if not authenticated
  if (!authChecked) return null;
  if (!userId) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {(mobileNavOpen || mobileNavDrawerOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setMobileNavOpen(false);
              setMobileNavDrawerOpen(false);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 40,
              display: 'none',
            }}
            className="mobile-overlay"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={(s) => { setActiveSection(s); setMobileNavOpen(false); }}
        sectionProgress={sectionProgress}
        phaseProgress={phaseProgress}
        mobileOpen={mobileNavOpen}
      />

      {/* Mobile Navigation Drawer (slides from bottom) */}
      <MobileNavDrawer
        activeSection={activeSection}
        setActiveSection={(s) => { 
          setActiveSection(s); 
          setMobileNavDrawerOpen(false); 
        }}
        sectionProgress={sectionProgress}
        isOpen={mobileNavDrawerOpen}
        onClose={() => setMobileNavDrawerOpen(false)}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar (desktop only) */}
        <TopBar
          totalCompleted={totalCompleted}
          totalResources={totalResources}
          overallPct={overallPct}
          onMenuToggle={() => setMobileNavOpen(v => !v)}
          userId={userId}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', maxWidth: '100%' }} className="main-content">
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {activeSection === 'overview' && (
                  <OverviewPage
                    data={data}
                    completed={completed}
                    bySection={bySection}
                    phaseProgress={phaseProgress}
                    setActiveSection={setActiveSection}
                  />
                )}
                {activeSection === 'math' && (
                  <MathPage
                    data={data}
                    completed={completed}
                    toggleCompleted={toggleCompleted}
                    sectionIds={bySection.math}
                    resetSection={resetSection}
                  />
                )}
                {activeSection === 'python' && (
                  <PythonPage
                    data={data}
                    completed={completed}
                    toggleCompleted={toggleCompleted}
                    sectionIds={bySection.python}
                    resetSection={resetSection}
                  />
                )}
                {activeSection === 'ml' && (
                  <MLPage
                    data={data}
                    completed={completed}
                    toggleCompleted={toggleCompleted}
                    sectionIds={bySection.ml}
                    resetSection={resetSection}
                  />
                )}
                {activeSection === 'deeplearning' && (
                  <DeepLearningPage
                    data={data}
                    completed={completed}
                    toggleCompleted={toggleCompleted}
                    sectionIds={bySection.deeplearning}
                    resetSection={resetSection}
                  />
                )}
                {activeSection === 'architectures' && (
                  <ArchitecturesPage
                    data={data}
                    completed={completed}
                    toggleCompleted={toggleCompleted}
                    sectionIds={bySection.architectures}
                    resetSection={resetSection}
                  />
                )}
                {activeSection === 'books' && (
                  <BooksPage
                    data={data}
                    completed={completed}
                    toggleCompleted={toggleCompleted}
                    sectionIds={bySection.books}
                    resetSection={resetSection}
                  />
                )}
                {activeSection === 'schedule' && (
                  <SchedulePage data={data} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeSection={activeSection}
          onNavigate={setActiveSection}
          onNavDrawerOpen={() => setMobileNavDrawerOpen(true)}
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
          .main-content { 
            padding: 24px 20px 80px !important; 
          }
        }
      `}</style>
    </div>
  );
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeSection: NavSection;
  setActiveSection: (s: NavSection) => void;
  sectionProgress: (section: string) => number;
  phaseProgress: (phaseId: string) => number;
  mobileOpen: boolean;
}

function Sidebar({ activeSection, setActiveSection, sectionProgress, mobileOpen }: SidebarProps) {
  const sectionKey: Partial<Record<NavSection, string>> = {
    math: 'math',
    python: 'python',
    ml: 'ml',
    deeplearning: 'deeplearning',
    architectures: 'architectures',
    books: 'books',
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        width: 220,
        minWidth: 220,
        height: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'relative',
        zIndex: 50,
        flexShrink: 0,
      }}
      className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
    >
      {/* App name */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          0 <span style={{ color: 'var(--accent)' }}>→</span> AI
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
          learning tracker
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const progKey = sectionKey[item.id];
            const pct = progKey ? sectionProgress(progKey) : -1;

            return (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, x: -8 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <button
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 20px',
                    background: 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-inter)',
                    transition: 'color 0.15s, border-color 0.15s',
                    letterSpacing: '0.01em',
                    lineHeight: 1.4,
                    paddingLeft: isActive ? 18 : 20,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  {item.label}
                </button>
                {/* Progress bar */}
                {pct >= 0 && (
                  <div style={{
                    height: 2,
                    background: 'var(--border-subtle)',
                    margin: '0 20px 4px',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                      style={{
                        height: '100%',
                        background: pct === 100 ? 'var(--green)' : 'var(--accent)',
                        borderRadius: 1,
                      }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </nav>

      {/* Bottom info */}
      <div style={{
        padding: '16px 20px 0',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 11,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        lineHeight: 1.8,
      }}>
        <div>18–24 months</div>
        <div>University-grade</div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            display: none !important;
          }
        }
      `}</style>
    </motion.aside>
  );
}

// ── TOP BAR ──────────────────────────────────────────────────────────────────

interface TopBarProps {
  totalCompleted: number;
  totalResources: number;
  overallPct: number;
  onMenuToggle: () => void;
  userId: string | null;
  onLogout: () => void;
}

function TopBar({ totalCompleted, totalResources, overallPct, onMenuToggle, userId, onLogout }: TopBarProps) {
  return (
    <div style={{
      height: 48,
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 48px',
      gap: 16,
      background: 'var(--surface)',
      flexShrink: 0,
    }}>
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: 18,
          padding: '4px 8px',
        }}
        className="mobile-menu-btn"
      >
        ≡
      </button>

      {/* Progress bar */}
      <div style={{ flex: 1, height: 2, background: 'var(--border-subtle)', borderRadius: 1, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.3 }}
          style={{
            height: '100%',
            background: overallPct === 100 ? 'var(--green)' : 'var(--accent)',
            borderRadius: 1,
          }}
        />
      </div>

      {/* Stats + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {totalCompleted} of {totalResources} completed
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: overallPct > 0 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 500 }}>
          {overallPct}%
        </span>
        {userId && (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderLeft: '1px solid var(--border-subtle)', paddingLeft: 12 }}>{userId}</span>
            <button onClick={onLogout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 2, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >sign out</button>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          div[style*="height: 48"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── MOBILE BOTTOM NAV ────────────────────────────────────────────────────────

interface MobileBottomNavProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onNavDrawerOpen: () => void;
}

function MobileBottomNav({ activeSection, onNavigate, onNavDrawerOpen }: MobileBottomNavProps) {
  return (
    <div
      className="mobile-bottom-nav"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        zIndex: 30,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '100%',
        padding: '0 8px',
      }}>
        {/* Overview Button */}
        <button
          onClick={() => onNavigate('overview')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: activeSection === 'overview' ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.2s',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}>
            Overview
          </span>
        </button>

        {/* Nav Menu Button */}
        <button
          onClick={onNavDrawerOpen}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--text-muted)',
            transition: 'color 0.2s',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}>
            Sections
          </span>
        </button>

        {/* Schedule Button */}
        <button
          onClick={() => onNavigate('schedule')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: activeSection === 'schedule' ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.2s',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}>
            Schedule
          </span>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── MOBILE NAV DRAWER ────────────────────────────────────────────────────────

interface MobileNavDrawerProps {
  activeSection: NavSection;
  setActiveSection: (s: NavSection) => void;
  sectionProgress: (section: string) => number;
  isOpen: boolean;
  onClose: () => void;
}

function MobileNavDrawer({ activeSection, setActiveSection, sectionProgress, isOpen, onClose }: MobileNavDrawerProps) {
  const navItems = [
    { id: 'math' as NavSection, label: 'Mathematics', icon: '∑', section: 'math' },
    { id: 'python' as NavSection, label: 'Python', icon: '🐍', section: 'python' },
    { id: 'ml' as NavSection, label: 'Machine Learning', icon: '⚙️', section: 'ml' },
    { id: 'deeplearning' as NavSection, label: 'Deep Learning', icon: '🧠', section: 'deeplearning' },
    { id: 'architectures' as NavSection, label: 'Architectures', icon: '🏗️', section: 'architectures' },
    { id: 'books' as NavSection, label: 'Books & Papers', icon: '📚', section: 'books' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '70vh',
            background: 'var(--surface)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
            zIndex: 50,
            display: 'none',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="mobile-nav-drawer"
        >
          {/* Handle */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: 40,
              height: 4,
              background: 'var(--border)',
              borderRadius: 2,
            }} />
          </div>

          {/* Header */}
          <div style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.02em',
            }}>
              Learning Sections
            </div>
          </div>

          {/* Nav Items */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 0',
          }}>
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const pct = sectionProgress(item.section);

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: isActive ? 'var(--surface-hover)' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}></span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        marginBottom: 2,
                      }}>
                        {item.label}
                      </div>
                      {/* Progress bar */}
                      <div style={{
                        width: 120,
                        height: 3,
                        background: 'var(--border-subtle)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: pct === 100 ? 'var(--green)' : 'var(--accent)',
                          borderRadius: 2,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: pct > 0 ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: 500,
                  }}>
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>

          <style>{`
            @media (max-width: 768px) {
              .mobile-nav-drawer {
                display: flex !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
