import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, '../..');
const lockPath = path.join(siteRoot, 'content/content.lock.json');
const [productId, sourceSha, sourceRepository = ''] = process.argv.slice(2);

if (!productId || !sourceSha) {
  throw new Error(
    'Usage: node scripts/content/update-lock.mjs <product-id> <sha> [repository]',
  );
}

if (!/^[0-9a-f]{40}$/i.test(sourceSha)) {
  throw new Error(`Invalid source SHA: ${sourceSha}`);
}

const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const source = lock.sources?.[productId];

if (!source) {
  throw new Error(`Unknown product ID: ${productId}`);
}

if (sourceRepository && source.repository !== sourceRepository) {
  throw new Error(
    `Repository mismatch for ${productId}: expected ${source.repository}, received ${sourceRepository}`,
  );
}

source.sha = sourceSha.toLowerCase();
fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
console.log(`Locked ${productId} to ${source.sha}`);
