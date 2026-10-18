export type Theme = 'light' | 'dark';

/** Same key as public/theme-init.js, which applies the saved theme before first paint. */
export const THEME_KEY = 'blindspot-theme';

const THEME_COLOR: Record<Theme, string> = { light: '#f7f6f2', dark: '#0e0e0d' };

const prefersDark = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** The theme on screen now: an explicit choice if there is one, otherwise the system's. */
export function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return prefersDark() ? 'dark' : 'light';
}

/** Applies a theme to the page and remembers the choice. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the theme still applies for this visit.
  }
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * Switches theme. Where the browser supports view transitions, the new theme spreads
 * out in a circle from `origin` (the toggle button); otherwise it switches instantly.
 */
export function switchTheme(theme: Theme, origin?: { x: number; y: number }): void {
  const doc = document as ViewTransitionDocument;
  if (!origin || !doc.startViewTransition || prefersReducedMotion()) {
    applyTheme(theme);
    return;
  }
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  const transition = doc.startViewTransition(() => applyTheme(theme));
  void transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${origin.x}px ${origin.y}px)`,
          `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
        ],
      },
      {
        duration: 620,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  });
}
