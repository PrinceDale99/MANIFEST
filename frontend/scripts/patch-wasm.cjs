const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/@midnightntwrk/onchain-runtime-v4/midnight_onchain_runtime_wasm_bg.js',
  'node_modules/@midnight-ntwrk/ledger-v8/midnight_ledger_wasm_bg.js',
  'node_modules/@midnight-ntwrk/zswap/midnight_zswap_wasm_bg.js'
];

for (const file of filesToPatch) {
  const fullPath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/if \(!\(instance instanceof klass\)\) \{/g, 'if (false) {');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Patched', file);
  } else {
    console.warn('Could not find', file);
  }
}
