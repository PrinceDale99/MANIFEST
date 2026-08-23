const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/@midnightntwrk/onchain-runtime-v4/midnight_onchain_runtime_wasm_bg.js',
  'node_modules/@midnight-ntwrk/ledger-v8/midnight_ledger_wasm_bg.js',
  'node_modules/@midnight-ntwrk/zswap/midnight_zswap_wasm_bg.js'
];

const patchFn = `
function _patchVersionBytes(raw) {
    if (!raw || !raw.length) return raw;
    for (let i = 0; i < raw.length - 4; i++) {
        if (raw[i] === 0x5b && raw[i+1] === 0x76 && raw[i+3] === 0x5d && raw[i+4] === 0x3a) {
            if (raw[i+2] === 0x38) {
                raw[i+2] = 0x36;
            } else if (raw[i+2] === 0x32) {
                raw[i+2] = 0x31;
            }
        }
    }
    return raw;
}
`;

for (const file of filesToPatch) {
  const fullPath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 1. Patch _assertClass
    content = content.replace(/if \(!\(instance instanceof klass\)\) \{/g, 'if (false) {');
    
    // 2. Inject _patchVersionBytes if missing
    if (file.includes('ledger-v8') && !content.includes('_patchVersionBytes(raw) {')) {
        content = patchFn + content;
    }

    if (file.includes('ledger-v8')) {
        // 3. Patch passArray8ToWasm0 just in case
        if (!content.includes('_patchVersionBytes(arg);')) {
            content = content.replace(/function passArray8ToWasm0\(arg, malloc\) \{/g, 'function passArray8ToWasm0(arg, malloc) { _patchVersionBytes(arg);');
        }
        
        // 4. Patch deserialize functions directly!
        if (!content.includes('_patchVersionBytes(raw);')) {
            content = content.replace(/static deserialize\(([^)]*raw)\) \{/g, 'static deserialize($1) { _patchVersionBytes(raw);');
        }
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Patched', file);
  } else {
    console.warn('Could not find', file);
  }
}
