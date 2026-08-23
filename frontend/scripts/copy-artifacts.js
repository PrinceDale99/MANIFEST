import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const keysDir = path.resolve(__dirname, '../src/managed/keys');
const zkirDir = path.resolve(__dirname, '../src/managed/zkir');

[
  { src: keysDir, dest: path.join(publicDir, 'keys') },
  { src: zkirDir, dest: path.join(publicDir, 'zkir') }
].forEach(({ src, dest }) => {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(file => {
    fs.copyFileSync(path.join(src, file), path.join(dest, 'manifest#' + file));
  });
});
