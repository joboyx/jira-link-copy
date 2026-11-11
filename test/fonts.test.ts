jest.mock('wxt/browser', () => ({
  browser: { runtime: { getURL: (path: string) => `chrome-extension://id${path}` } },
}));

interface RegisteredFace {
  family: string;
  weight: string;
  style: string;
}

class FakeFontFace implements RegisteredFace {
  readonly weight: string;
  readonly style: string;

  constructor(
    readonly family: string,
    readonly source: ArrayBuffer,
    descriptors: FontFaceDescriptors,
  ) {
    this.weight = descriptors.weight ?? '';
    this.style = descriptors.style ?? '';
  }

  load(): Promise<this> {
    return Promise.resolve(this);
  }
}

describe('loadToastFonts', () => {
  let registered: RegisteredFace[];
  let fetched: string[];
  let fetchFails: boolean;

  beforeEach(() => {
    jest.resetModules();
    registered = [];
    fetched = [];
    fetchFails = false;
    Object.defineProperty(globalThis, 'FontFace', { configurable: true, value: FakeFontFace });
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        add: (face: RegisteredFace) => registered.push(face),
        forEach: (callback: (face: RegisteredFace) => void) => registered.forEach(callback),
      },
    });
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: (url: string) => {
        fetched.push(url);
        if (fetchFails) {
          return Promise.reject(new Error('network down'));
        }
        return Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
      },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'FontFace');
    Reflect.deleteProperty(document, 'fonts');
    Reflect.deleteProperty(globalThis, 'fetch');
  });

  it('registers both bundled faces from extension URLs', async () => {
    const { loadToastFonts } = await import('../src/lib/fonts');

    await loadToastFonts();

    expect(fetched).toEqual([
      'chrome-extension://id/fonts/jetbrains-mono-latin-500-normal.woff2',
      'chrome-extension://id/fonts/ibm-plex-sans-latin-400-normal.woff2',
    ]);
    expect(registered.map(({ family, weight, style }) => ({ family, weight, style }))).toEqual([
      { family: 'JLC JetBrains Mono', weight: '500', style: 'normal' },
      { family: 'JLC IBM Plex Sans', weight: '400', style: 'normal' },
    ]);
  });

  it('does not fetch again on a second call', async () => {
    const { loadToastFonts } = await import('../src/lib/fonts');

    await loadToastFonts();
    await loadToastFonts();

    expect(fetched).toHaveLength(2);
    expect(registered).toHaveLength(2);
  });

  it('skips a family that the page document already has, even when quoted', async () => {
    registered.push({ family: '"JLC JetBrains Mono"', weight: '500', style: 'normal' });
    const { loadToastFonts } = await import('../src/lib/fonts');

    await loadToastFonts();

    expect(fetched).toEqual(['chrome-extension://id/fonts/ibm-plex-sans-latin-400-normal.woff2']);
    expect(registered.map((face) => face.family)).toEqual([
      '"JLC JetBrains Mono"',
      'JLC IBM Plex Sans',
    ]);
  });

  it('resolves and adds nothing when a fetch fails', async () => {
    fetchFails = true;
    const { loadToastFonts } = await import('../src/lib/fonts');

    await expect(loadToastFonts()).resolves.toBeUndefined();
    expect(registered).toEqual([]);
  });
});
