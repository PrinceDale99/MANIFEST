const fs = require('fs');
const path = require('path');
const walk = (dir) => {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
};

for (const file of walk('src')) {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('useParams') && !content.includes('useParams} from') && !content.includes('useParams } from')) {
      content = "import { useParams } from 'react-router-dom';\n" + content;
    }
    fs.writeFileSync(file, content);
  }
}

let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
tsconfig.compilerOptions.paths = { "@/*": ["./src/*"] };
tsconfig.compilerOptions.erasableSyntaxOnly = false;
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

console.log("Fixes applied!");
