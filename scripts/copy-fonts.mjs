import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'fonts');
const FONTSOURCE = join(ROOT, 'node_modules', '@fontsource');

const COPIES = [
  [
    'jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2',
    'jetbrains-mono-latin-500-normal.woff2',
  ],
  ['jetbrains-mono/LICENSE', 'OFL-JetBrainsMono.txt'],
  [
    'ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2',
    'ibm-plex-sans-latin-400-normal.woff2',
  ],
  ['ibm-plex-sans/LICENSE', 'OFL-IBMPlexSans.txt'],
];

mkdirSync(OUT_DIR, { recursive: true });
for (const [from, to] of COPIES) {
  copyFileSync(join(FONTSOURCE, from), join(OUT_DIR, to));
}
