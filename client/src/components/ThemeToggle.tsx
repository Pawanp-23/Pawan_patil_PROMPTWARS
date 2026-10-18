import { useState, type MouseEvent } from 'react';
import { currentTheme, switchTheme, type Theme } from '../lib/theme';

const RAYS = Array.from({ length: 8 }, (_, i) => i * 45);

/**
 * Light/dark switch drawn as the BlindSpot disc: in light the sun's rays are out,
 * in dark the disc turns to its shadow side and the rays fold away.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const next: Theme = theme === 'light' ? 'dark' : 'light';

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    switchTheme(next, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
        <g className="theme-rays">
          {RAYS.map((angle) => (
            <line
              key={angle}
              x1="16"
              y1="2.5"
              x2="16"
              y2="6"
              transform={`rotate(${angle} 16 16)`}
              strokeLinecap="round"
            />
          ))}
        </g>
        <g className="theme-disc">
          <circle cx="16" cy="16" r="7.5" className="theme-disc-shadow" />
          <path d="M16 8.5 A7.5 7.5 0 0 1 16 23.5 Z" className="theme-disc-light" />
          <circle cx="16" cy="16" r="7.5" className="theme-disc-ring" />
        </g>
      </svg>
    </button>
  );
}
