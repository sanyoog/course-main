'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppData, Paper } from '../types';

interface Props {
  data: AppData;
  completed: Set<string>;
  toggleCompleted: (id: string) => void;
  sectionIds: string[];
  resetSection: (ids: string[]) => void;
}

type SortBooks = 'default' | 'title';
type SortPapers = 'year' | 'title';

export function BooksPage({ data, completed, toggleCompleted, sectionIds, resetSection }: Props) {
  const { books, seminalPapers } = data.freeBooksAndPapers;
  const [sortBooks, setSortBooks] = useState<SortBooks>('default');
  const [sortPapers, setSortPapers] = useState<SortPapers>('year');
  const completedCount = sectionIds.filter(id => completed.has(id)).length;

  const sortedBooks = [...books].sort((a, b) => {
    if (sortBooks === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const sortedPapers = [...seminalPapers].sort((a: Paper, b: Paper) => {
    if (sortPapers === 'year') return b.year - a.year;
    return a.title.localeCompare(b.title);
  });

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
          Library ·· {books.length} Books · {seminalPapers.length} Papers
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {data.freeBooksAndPapers.sectionTitle}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          {data.freeBooksAndPapers.sectionSubtitle}
        </p>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }} className="books-grid">
        {/* Books */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Books · {books.length}
            </div>
            {/* Sort toggle */}
            <div style={{ display: 'flex', gap: 1 }}>
              {(['default', 'title'] as SortBooks[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBooks(s)}
                  style={{
                    background: sortBooks === s ? 'var(--surface)' : 'transparent',
                    border: '1px solid var(--border)',
                    color: sortBooks === s ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: s === 'default' ? '2px 0 0 2px' : '0 2px 2px 0',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {s === 'default' ? 'default' : 'A–Z'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sortedBooks.map((book, idx) => {
              const isCompleted = completed.has(book.id);
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                  style={{
                    padding: '12px 14px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 3,
                    borderLeft: isCompleted ? '2px solid var(--green)' : '2px solid var(--border-subtle)',
                    background: isCompleted ? 'rgba(34,197,94,0.04)' : 'transparent',
                    transition: 'background 0.15s, border-color 0.15s',
                    cursor: 'default',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    {/* Completion dot */}
                    <motion.button
                      onClick={() => toggleCompleted(book.id)}
                      whileTap={{ scale: [null, 1.4, 1] } as never}
                      transition={{ duration: 0.25 }}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        border: `1.5px solid ${isCompleted ? 'var(--green)' : 'var(--text-muted)'}`,
                        background: isCompleted ? 'var(--green)' : 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: 0,
                        marginTop: 3,
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a
                        href={book.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          lineHeight: 1.3,
                          display: 'block',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'}
                      >
                        {book.title} →
                      </a>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        {book.authors.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                    {book.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {book.coverTopics?.slice(0, 4).map(t => (
                      <span key={t} style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                        borderRadius: 2,
                        padding: '1px 6px',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Papers */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Seminal Papers · {seminalPapers.length}
            </div>
            {/* Sort toggle */}
            <div style={{ display: 'flex', gap: 1 }}>
              {(['year', 'title'] as SortPapers[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSortPapers(s)}
                  style={{
                    background: sortPapers === s ? 'var(--surface)' : 'transparent',
                    border: '1px solid var(--border)',
                    color: sortPapers === s ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: s === 'year' ? '2px 0 0 2px' : '0 2px 2px 0',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {s === 'year' ? 'year' : 'A–Z'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sortedPapers.map((paper, idx) => {
              const isCompleted = completed.has(paper.id);
              return (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                  style={{
                    padding: '12px 14px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 3,
                    background: isCompleted ? 'rgba(34,197,94,0.04)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                    {/* Completion dot */}
                    <motion.button
                      onClick={() => toggleCompleted(paper.id)}
                      whileTap={{ scale: [null, 1.4, 1] } as never}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        border: `1.5px solid ${isCompleted ? 'var(--green)' : 'var(--text-muted)'}`,
                        background: isCompleted ? 'var(--green)' : 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: 0,
                        marginTop: 3,
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Year badge + title */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--accent)',
                          border: '1px solid rgba(99,102,241,0.25)',
                          borderRadius: 2,
                          padding: '1px 5px',
                          flexShrink: 0,
                          marginTop: 1,
                        }}>
                          {paper.year}
                        </span>
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            lineHeight: 1.3,
                            flex: 1,
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'}
                          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'}
                        >
                          {paper.title} →
                        </a>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        {paper.authors.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Significance */}
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginLeft: 18 }}>
                    {paper.significance}
                  </p>

                  {/* Must read badge */}
                  {paper.mustRead && (
                    <div style={{ marginLeft: 18, marginTop: 6 }}>
                      <span style={{
                        fontSize: 10,
                        color: 'var(--accent)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: 2,
                        padding: '1px 6px',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        must-read
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reset */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {completedCount} of {sectionIds.length} items completed
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
        @media (max-width: 700px) {
          .books-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
