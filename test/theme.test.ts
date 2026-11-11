import { detectTheme } from '../src/lib/theme';

describe('detectTheme', () => {
  const root = document.documentElement;
  const originalBody = document.body;

  function stubPrefersDark(matches: boolean | undefined): void {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value:
        matches === undefined
          ? undefined
          : (query: string) => ({ matches: query === '(prefers-color-scheme: dark)' && matches }),
    });
  }

  beforeEach(() => {
    stubPrefersDark(false);
  });

  afterEach(() => {
    root.removeAttribute('data-color-mode');
    root.removeAttribute('data-theme');
    root.removeAttribute('style');
    if (!document.body) {
      root.append(originalBody);
    }
    document.body.removeAttribute('style');
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('returns tokyo for data-color-mode dark even on a light body', () => {
    root.setAttribute('data-color-mode', 'dark');
    document.body.style.backgroundColor = 'rgb(255, 255, 255)';

    expect(detectTheme(document, window)).toBe('tokyo');
  });

  it('returns day for data-color-mode light even on a dark body', () => {
    root.setAttribute('data-color-mode', 'light');
    document.body.style.backgroundColor = 'rgb(0, 0, 0)';
    stubPrefersDark(true);

    expect(detectTheme(document, window)).toBe('day');
  });

  it('prefers data-color-mode over a contrary data-theme', () => {
    root.setAttribute('data-color-mode', 'light');
    root.setAttribute('data-theme', 'dark');

    expect(detectTheme(document, window)).toBe('day');
  });

  it('uses a plain data-theme when data-color-mode is missing', () => {
    root.setAttribute('data-theme', 'dark');
    document.body.style.backgroundColor = 'rgb(255, 255, 255)';

    expect(detectTheme(document, window)).toBe('tokyo');
  });

  it('returns day for a plain light data-theme', () => {
    root.setAttribute('data-theme', 'light');
    stubPrefersDark(true);

    expect(detectTheme(document, window)).toBe('day');
  });

  it('ignores a compound data-theme and reads the body background', () => {
    root.setAttribute('data-color-mode', 'auto');
    root.setAttribute('data-theme', 'dark:dark light:light');
    document.body.style.backgroundColor = 'rgb(255, 255, 255)';

    expect(detectTheme(document, window)).toBe('day');
  });

  it('returns tokyo for a dark body background', () => {
    document.body.style.backgroundColor = '#1a1b26';

    expect(detectTheme(document, window)).toBe('tokyo');
  });

  it('treats a mid-grey just under the luminance limit as dark', () => {
    document.body.style.backgroundColor = 'rgb(118, 118, 118)';

    expect(detectTheme(document, window)).toBe('tokyo');
  });

  it('treats a mid-grey just over the luminance limit as light', () => {
    document.body.style.backgroundColor = 'rgb(128, 128, 128)';
    stubPrefersDark(true);

    expect(detectTheme(document, window)).toBe('day');
  });

  it('reads a semi-transparent rgba body background', () => {
    document.body.style.backgroundColor = 'rgba(20, 20, 20, 0.5)';

    expect(detectTheme(document, window)).toBe('tokyo');
  });

  it('falls through a transparent body to the html background', () => {
    document.body.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    root.style.backgroundColor = 'rgb(10, 10, 10)';

    expect(detectTheme(document, window)).toBe('tokyo');
  });

  it('falls through to the html background when the body is missing', () => {
    document.body.remove();
    root.style.backgroundColor = 'rgb(250, 250, 250)';
    stubPrefersDark(true);

    expect(detectTheme(document, window)).toBe('day');
  });

  it('falls through a transparent body and html to prefers-color-scheme dark', () => {
    document.body.style.backgroundColor = 'transparent';
    root.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    stubPrefersDark(true);

    expect(detectTheme(document, window)).toBe('tokyo');
  });

  it('returns day when prefers-color-scheme is light and no background is set', () => {
    expect(detectTheme(document, window)).toBe('day');
  });

  it('returns day when matchMedia is missing and no background is set', () => {
    stubPrefersDark(undefined);

    expect(detectTheme(document, window)).toBe('day');
  });

  describe('with computed colours that jsdom does not produce', () => {
    function fakeWindow(bodyColour: string, htmlColour: string): Window {
      const colours = new Map<Element, string>([
        [document.body, bodyColour],
        [root, htmlColour],
      ]);
      return {
        getComputedStyle: (element: Element) => ({ backgroundColor: colours.get(element) }),
        matchMedia: () => ({ matches: true }),
      } as unknown as Window;
    }

    it('skips a space-separated rgb body at 0% alpha and reads the html colour', () => {
      expect(detectTheme(document, fakeWindow('rgb(0 0 0 / 0%)', 'rgb(240 240 240 / 1)'))).toBe(
        'day',
      );
    });

    it('reads a space-separated rgb body without alpha', () => {
      expect(detectTheme(document, fakeWindow('rgb(250 250 250)', 'rgb(0 0 0)'))).toBe('day');
    });

    it('skips an unparseable body colour and reads the html colour', () => {
      expect(detectTheme(document, fakeWindow('color(srgb 0 0 0)', 'rgb(245, 245, 245)'))).toBe(
        'day',
      );
    });

    it('falls back to prefers-color-scheme when both colours are unparseable', () => {
      expect(detectTheme(document, fakeWindow('canvas', ''))).toBe('tokyo');
    });
  });
});
