import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 在 ES module 裡要自己定義
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagePath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

const versionParts = pkg.version.split('.').map(Number);
versionParts[2] += 1; // patch +1
const newVersion = versionParts.join('.');

pkg.version = newVersion;

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Version bumped to ${newVersion}`);
