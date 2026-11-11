import { browser, type PublicPath } from 'wxt/browser';

/**
 * Font family name of the bundled JetBrains Mono 500 face.
 * The prefix keeps it from clashing with a font that the page declares.
 */
export const MONO_FAMILY = 'JLC JetBrains Mono';

/**
 * Font family name of the bundled IBM Plex Sans 400 face.
 * The prefix keeps it from clashing with a font that the page declares.
 */
export const SANS_FAMILY = 'JLC IBM Plex Sans';

interface FaceSpec {
  family: string;
  path: PublicPath;
  weight: string;
}

const FACES: readonly FaceSpec[] = [
  { family: MONO_FAMILY, path: '/fonts/jetbrains-mono-latin-500-normal.woff2', weight: '500' },
  { family: SANS_FAMILY, path: '/fonts/ibm-plex-sans-latin-400-normal.woff2', weight: '400' },
];

let loading: Promise<void> | undefined;

/**
 * Registers the bundled toast fonts on the page document.
 *
 * The fonts load from extension bytes, not from a URL that the page fetches, so the page
 * Content-Security-Policy does not block them. Faces go on `document.fonts` because Chromium
 * ignores `@font-face` rules inside a shadow root. A second call reuses the first load, and a
 * family that is already registered is skipped. The promise never rejects: on failure no face
 * is added and the toast uses its fallback fonts.
 */
export function loadToastFonts(): Promise<void> {
  loading ??= loadMissingFaces();
  return loading;
}

async function loadMissingFaces(): Promise<void> {
  try {
    const missing = FACES.filter((spec) => !isRegistered(spec.family));
    const faces = await Promise.all(missing.map(loadFace));
    for (const face of faces) {
      document.fonts.add(face);
    }
  } catch {
    // Fonts are cosmetic: the toast CSS font stacks fall back to system fonts.
  }
}

async function loadFace(spec: FaceSpec): Promise<FontFace> {
  const response = await fetch(browser.runtime.getURL(spec.path));
  const buffer = await response.arrayBuffer();
  const face = new FontFace(spec.family, buffer, { weight: spec.weight, style: 'normal' });
  return face.load();
}

function isRegistered(family: string): boolean {
  let found = false;
  document.fonts.forEach((face) => {
    if (face.family.replace(/^["']|["']$/g, '') === family) {
      found = true;
    }
  });
  return found;
}
