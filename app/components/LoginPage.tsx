'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onLogin: (userId: string) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const userRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setError('Enter both user ID and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim(), password }),
      });

      const data = await res.json();
      if (data.ok) {
        onLogin(data.userId);
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 360 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            0 <span style={{ color: 'var(--accent)' }}>→</span> AI
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            learning tracker · sign in
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* User ID */}
          <div>
            <label
              htmlFor="userId"
              style={{
                display: 'block',
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                marginBottom: 6,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              User ID
            </label>
            <input
              ref={userRef}
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoComplete="username"
              placeholder="e.g. sambhog"
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                padding: '10px 14px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                marginBottom: 6,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                padding: '10px 14px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 12,
                  color: 'var(--red)',
                  fontFamily: 'var(--font-mono)',
                  padding: '8px 12px',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 3,
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 3,
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              letterSpacing: '0.04em',
              marginTop: 4,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </motion.button>
        </form>

        {/* Footer note */}
        <div
          style={{
            marginTop: 32,
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.7,
          }}
        >
          <div>No registration. Credentials set via .env</div>
          <div style={{ opacity: 0.6 }}>USER_&#123;ID&#125;_PASSWORD=your_password</div>
        </div>
      </motion.div>
    </div>
  );
}
