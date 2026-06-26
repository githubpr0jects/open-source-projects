'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved === 'dark' || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    if (next) root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" aria-pressed={isDark}>
      <span aria-hidden>{isDark ? '☾' : '☀'}</span>
      <span>{isDark ? 'Night' : 'Day'}</span>
    </button>
  );
}
