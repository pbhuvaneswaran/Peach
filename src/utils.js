import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = `${__dirname}/../output`;

async function ensureOutputFolder() {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

export { ensureOutputFolder, OUTPUT_DIR };
