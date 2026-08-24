const fs = require('fs');
const path = require('path');

const contractZkPath = path.join(__dirname, '..', '..', 'contract', 'dist');
const frontendZkirPath = path.join(__dirname, '..', 'public', 'zkir');
const frontendKeysPath = path.join(__dirname, '..', 'public', 'keys');

// Ensure directories exist
if (!fs.existsSync(frontendZkirPath)) fs.mkdirSync(frontendZkirPath, { recursive: true });
if (!fs.existsSync(frontendKeysPath)) fs.mkdirSync(frontendKeysPath, { recursive: true });

fs.readdirSync(contractZkPath).forEach(file => {
    // Add "manifest#" prefix!
    const destName = 'manifest#' + file;
    const src = path.join(contractZkPath, file);
    if (file.endsWith('.zkir') || file.endsWith('.bzkir')) {
        fs.copyFileSync(src, path.join(frontendZkirPath, destName));
    } else if (file.endsWith('.prover') || file.endsWith('.verifier')) {
        fs.copyFileSync(src, path.join(frontendKeysPath, destName));
    }
});
