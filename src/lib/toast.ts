import { loadToastFonts, MONO_FAMILY, SANS_FAMILY } from './fonts';
import { detectTheme, THEMES, type ThemeName, type ThemeTokens } from './theme';

const ROOT_ID = 'jira-link-copy-root';

const MONO_STACK = `"${MONO_FAMILY}", ui-monospace, "SF Mono", Menlo, monospace`;
const SANS_STACK = `"${SANS_FAMILY}", system-ui, -apple-system, "Segoe UI", sans-serif`;

export interface ToastInput {
  kind: 'success' | 'error';
  kicker: string;
  title: string;
  body?: string;
}

/**
 * Shows a short confirmation card in the page. Replaces any previous card.
 */
export function showToast(input: ToastInput): void {
  void loadToastFonts();
  document.getElementById(ROOT_ID)?.remove();

  const host = document.createElement('div');
  host.id = ROOT_ID;
  host.style.all = 'initial';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.right = '24px';
  host.style.bottom = '24px';
  host.style.pointerEvents = 'none';

  const theme = detectTheme(document, window);
  const shadow = host.attachShadow({ mode: 'open' });
  const card = document.createElement('div');
  card.setAttribute('role', 'status');
  card.setAttribute('data-theme', theme);
  card.className = `card card-${input.kind}`;

  const kicker = document.createElement('div');
  kicker.className = 'kicker';
  kicker.textContent = input.kicker;

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = input.title;

  card.append(kicker, title);
  if (input.body) {
    const body = document.createElement('div');
    body.className = 'body';
    body.textContent = input.body;
    card.append(body);
  }

  const style = document.createElement('style');
  style.textContent = toastCss(theme);
  shadow.append(style, card);
  document.documentElement.append(host);

  window.setTimeout(() => {
    host.remove();
  }, 2800);
}

const TOKEN_PROPERTIES: Readonly<Record<keyof ThemeTokens, string>> = {
  panel: '--jlc-panel',
  fg: '--jlc-fg',
  fg2: '--jlc-fg2',
  border: '--jlc-border',
  accent: '--jlc-accent',
  red: '--jlc-red',
  shadow: '--jlc-shadow',
};

function tokenDeclarations(theme: ThemeName): string {
  const tokens = THEMES[theme];
  return (Object.keys(TOKEN_PROPERTIES) as (keyof ThemeTokens)[])
    .map((name) => `${TOKEN_PROPERTIES[name]}: ${tokens[name]};`)
    .join('\n      ');
}

function toastCss(theme: ThemeName): string {
  return `
    .card {
      ${tokenDeclarations(theme)}
    }
    .card {
      min-width: 220px;
      max-width: 360px;
      padding: 14px 16px 12px;
      background: var(--jlc-panel);
      color: var(--jlc-fg);
      border: 1px solid var(--jlc-border);
      border-radius: 8px;
      box-shadow: var(--jlc-shadow);
      transform: translateY(8px);
      animation: rise 180ms ease-out forwards;
    }
    .card-error {
      border-color: var(--jlc-red);
    }
    .kicker {
      font-family: ${MONO_STACK};
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--jlc-accent);
      margin-bottom: 6px;
    }
    .card-error .kicker {
      color: var(--jlc-red);
    }
    .title {
      font-family: ${MONO_STACK};
      font-size: 14px;
      font-weight: 500;
      line-height: 1.35;
      color: var(--jlc-fg);
    }
    .body {
      font-family: ${SANS_STACK};
      font-size: 12px;
      color: var(--jlc-fg2);
      margin-top: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @keyframes rise {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
}
