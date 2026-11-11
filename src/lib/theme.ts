/**
 * Name of a toast colour mode: `tokyo` is Tokyo Night (dark), `day` is Tokyo Day (light).
 */
export type ThemeName = 'tokyo' | 'day';

/**
 * Colour tokens that the toast card uses.
 */
export interface ThemeTokens {
  /** Card background. */
  panel: string;
  /** Primary text. */
  fg: string;
  /** Secondary text. */
  fg2: string;
  /** Card border. */
  border: string;
  /** Kicker text on a success card. */
  accent: string;
  /** Border and kicker text on an error card. */
  red: string;
  /** Card `box-shadow` value. */
  shadow: string;
}

/**
 * Token values for each colour mode.
 */
export const THEMES: Readonly<Record<ThemeName, ThemeTokens>> = {
  tokyo: {
    panel: '#1f2335',
    fg: '#c0caf5',
    fg2: '#a9b1d6',
    border: '#3b4261',
    accent: '#7aa2f7',
    red: '#f7768e',
    shadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  },
  day: {
    panel: '#e9e9ed',
    fg: '#3760bf',
    fg2: '#4b5a8f',
    border: '#a8aecb',
    accent: '#2e7de9',
    red: '#c64343',
    shadow: '0 8px 24px rgba(55, 96, 191, 0.15)',
  },
};

const DARK_LUMINANCE_LIMIT = 0.2;

const RGB_PATTERN =
  /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+)%?\s*)?\)$/i;

/**
 * Picks the toast colour mode that matches the page.
 *
 * The first decisive signal wins: the `data-color-mode` attribute on the root element (set by
 * Atlassian), then a plain `dark` or `light` `data-theme` attribute, then the computed
 * background colour of the body and then of the root element, and last the
 * `prefers-color-scheme` media query. A transparent or unreadable background is not decisive.
 */
export function detectTheme(doc: Document, win: Window): ThemeName {
  const root = doc.documentElement;
  const fromAttribute =
    modeFromAttribute(root.getAttribute('data-color-mode')) ??
    modeFromAttribute(root.getAttribute('data-theme'));
  if (fromAttribute) {
    return fromAttribute;
  }

  for (const element of [doc.body, root]) {
    const luminance = element ? backgroundLuminance(win, element) : undefined;
    if (luminance !== undefined) {
      return luminance < DARK_LUMINANCE_LIMIT ? 'tokyo' : 'day';
    }
  }

  return win.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'tokyo' : 'day';
}

function modeFromAttribute(value: string | null): ThemeName | undefined {
  if (value === 'dark') {
    return 'tokyo';
  }
  if (value === 'light') {
    return 'day';
  }
  return undefined;
}

function backgroundLuminance(win: Window, element: Element): number | undefined {
  const match = RGB_PATTERN.exec(win.getComputedStyle(element).backgroundColor.trim());
  if (!match) {
    return undefined;
  }
  // An omitted alpha group is undefined at run time; Number(undefined) is NaN, not 0.
  const [, r, g, b, alpha] = match;
  if (Number(alpha) === 0) {
    return undefined;
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function channel(value: string): number {
  const srgb = Number(value) / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}
