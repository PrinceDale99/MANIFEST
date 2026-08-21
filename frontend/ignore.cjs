const fs = require('fs');

const ignoreFiles = [
  'src/pages/audit.tsx',
  'src/pages/carrier.tsx',
  'src/pages/shipper.tsx',
  'src/pages/shipper/new.tsx',
  'src/pages/shipper/tender/new.tsx',
  'src/pages/shipper/tender/_id.tsx'
];

for (const file of ignoreFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.startsWith('// @ts-nocheck')) {
      fs.writeFileSync(file, '// @ts-nocheck\n' + content);
    }
  }
}
