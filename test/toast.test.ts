jest.mock('wxt/browser', () => ({ browser: { runtime: { getURL: (path: string) => path } } }));
jest.mock('../src/lib/fonts', () => ({
  ...jest.requireActual<typeof import('../src/lib/fonts')>('../src/lib/fonts'),
  loadToastFonts: jest.fn(() => Promise.resolve()),
}));

import { loadToastFonts } from '../src/lib/fonts';
import { showToast } from '../src/lib/toast';

const success = {
  kind: 'success',
  kicker: 'Copied',
  title: 'ABC-123: Example summary',
  body: 'https://<host>/browse/ABC-123',
} as const;

function host(): HTMLElement | null {
  return document.getElementById('jira-link-copy-root');
}

function card(): HTMLElement {
  const found = host()?.shadowRoot?.querySelector<HTMLElement>('.card');
  if (!found) {
    throw new Error('toast card not rendered');
  }
  return found;
}

function styleText(): string {
  return host()?.shadowRoot?.querySelector('style')?.textContent ?? '';
}

describe('showToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    host()?.remove();
    document.documentElement.removeAttribute('data-color-mode');
    jest.mocked(loadToastFonts).mockClear();
  });

  it('renders a tokyo card on a dark page', () => {
    document.documentElement.setAttribute('data-color-mode', 'dark');

    showToast(success);

    expect(card().getAttribute('data-theme')).toBe('tokyo');
    expect(card().getAttribute('role')).toBe('status');
    expect(card().className).toBe('card card-success');
    expect(styleText()).toContain('--jlc-panel: #1f2335;');
    expect(styleText()).toContain('--jlc-accent: #7aa2f7;');
    expect(styleText()).toContain('--jlc-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);');
  });

  it('renders a day card on a light page', () => {
    document.documentElement.setAttribute('data-color-mode', 'light');

    showToast(success);

    expect(card().getAttribute('data-theme')).toBe('day');
    expect(styleText()).toContain('--jlc-panel: #e9e9ed;');
    expect(styleText()).toContain('--jlc-red: #c64343;');
  });

  it('uses only custom properties for colours in the rules', () => {
    showToast(success);

    const rules = styleText().replace(/\.card \{[^}]*--jlc-[^}]*\}/, '');
    expect(rules).toContain('background: var(--jlc-panel);');
    expect(rules).toContain('border: 1px solid var(--jlc-border);');
    expect(rules).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('builds the font stacks from the bundled family names', () => {
    showToast(success);

    expect(styleText()).toContain(
      'font-family: "JLC JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;',
    );
    expect(styleText()).toContain(
      'font-family: "JLC IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;',
    );
  });

  it('starts loading the fonts without waiting for them', () => {
    jest.mocked(loadToastFonts).mockReturnValueOnce(new Promise<void>(() => undefined));

    showToast(success);

    expect(loadToastFonts).toHaveBeenCalledTimes(1);
    expect(card().querySelector('.title')?.textContent).toBe('ABC-123: Example summary');
  });

  it('renders kicker, title and body text', () => {
    showToast(success);

    expect(card().querySelector('.kicker')?.textContent).toBe('Copied');
    expect(card().querySelector('.title')?.textContent).toBe('ABC-123: Example summary');
    expect(card().querySelector('.body')?.textContent).toBe('https://<host>/browse/ABC-123');
  });

  it('gives the error kind the error class and omits a missing body', () => {
    showToast({ kind: 'error', kicker: 'Copy failed', title: 'Could not copy' });

    expect(card().className).toBe('card card-error');
    expect(card().querySelector('.body')).toBeNull();
    expect(styleText()).toMatch(/\.card-error \.kicker \{\s*color: var\(--jlc-red\);/);
  });

  it('replaces the previous card', () => {
    showToast(success);
    showToast({ kind: 'error', kicker: 'Not found', title: 'No issue' });

    expect(document.querySelectorAll('#jira-link-copy-root')).toHaveLength(1);
    expect(card().querySelector('.kicker')?.textContent).toBe('Not found');
  });

  it('removes the host after 2800 ms', () => {
    showToast(success);

    jest.advanceTimersByTime(2799);
    expect(host()).not.toBeNull();

    jest.advanceTimersByTime(1);
    expect(host()).toBeNull();
  });
});
