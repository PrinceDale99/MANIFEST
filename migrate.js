const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NEXT_DIR = path.join(__dirname, 'frontend');
const VITE_DIR = path.join(__dirname, 'frontend-vite');

// 1. Scaffold Vite
if (!fs.existsSync(VITE_DIR)) {
  execSync('npm create vite@latest frontend-vite -- --template react-ts', { stdio: 'inherit' });
}

// 2. Install dependencies
const packageJsonPath = path.join(NEXT_DIR, 'package.json');
const nextPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const deps = Object.keys(nextPkg.dependencies).filter(d => !d.includes('next') && !d.includes('react-dom') && !d.includes('react'));
execSync(`npm install ${deps.join(' ')} react-router-dom`, { cwd: VITE_DIR, stdio: 'inherit' });
execSync(`npm install -D tailwindcss postcss autoprefixer vite-plugin-top-level-await vite-plugin-wasm`, { cwd: VITE_DIR, stdio: 'inherit' });

fs.writeFileSync(path.join(VITE_DIR, 'postcss.config.js'), `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`);

// 3. Configure Tailwind
fs.writeFileSync(path.join(VITE_DIR, 'tailwind.config.js'), `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`);
fs.writeFileSync(path.join(VITE_DIR, 'src', 'index.css'), `
@tailwind base;
@tailwind components;
@tailwind utilities;
`);

// 4. Move folders
const dirsToMove = ['components', 'lib', 'managed', 'types'];
for (const dir of dirsToMove) {
  const src = path.join(NEXT_DIR, 'src', dir);
  const dest = path.join(VITE_DIR, 'src', dir);
  if (fs.existsSync(src)) {
    execSync(`xcopy /E /I /Y "${src}" "${dest}"`);
  }
}

// 5. Parse App Router and Convert to React Router
const pagesDir = path.join(NEXT_DIR, 'src', 'app');
const reactRouterPages = [];

function walkDir(currentPath, baseRoute = '') {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name !== 'api' && entry.name !== 'fonts') {
        let newBase = baseRoute + '/' + entry.name;
        if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
          newBase = baseRoute + '/:' + entry.name.slice(1, -1);
        }
        walkDir(path.join(currentPath, entry.name), newBase);
      }
    } else if (entry.name === 'page.tsx') {
      const fullPath = path.join(currentPath, entry.name);
      let route = baseRoute || '/';
      const destPath = path.join(VITE_DIR, 'src', 'pages', route === '/' ? 'Home.tsx' : route.replace(/:/g, '_').substring(1) + '.tsx');
      
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Convert Next.js imports
      content = content.replace(/import .* from 'next\/image';?/g, '');
      content = content.replace(/import .* from 'next\/link';?/g, `import { Link } from 'react-router-dom';`);
      content = content.replace(/import { useRouter } from 'next\/navigation';?/g, `import { useNavigate, useParams } from 'react-router-dom';`);
      content = content.replace(/<Image[^>]*src=\{([^}]+)\}[^>]*>/g, `<img src={$1} className="w-full h-full object-cover" />`);
      content = content.replace(/<Image[^>]*src="([^"]+)"[^>]*>/g, `<img src="$1" className="w-full h-full object-cover" />`);
      content = content.replace(/useRouter\(\)/g, 'useNavigate()');
      content = content.replace(/router\.push/g, 'navigate');
      
      // Convert params
      if (route.includes(':')) {
        content = content.replace(/({ params }: { params: { [^}]+ } })/g, '()');
        content = content.replace(/params\.(\w+)/g, '(useParams().$1 as string)');
      }
      
      fs.writeFileSync(destPath, content);
      
      reactRouterPages.push({
        route,
        componentName: 'Page' + reactRouterPages.length,
        importPath: './pages/' + (route === '/' ? 'Home' : route.replace(/:/g, '_').substring(1))
      });
    }
  }
}

walkDir(pagesDir);

// 6. Generate App.tsx
let appTsx = `
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './components/Providers';
import Navbar from './components/Navbar';
`;

for (const p of reactRouterPages) {
  appTsx += `import ${p.componentName} from '${p.importPath}';\n`;
}

appTsx += `
function App() {
  return (
    <Providers>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
`;

for (const p of reactRouterPages) {
  appTsx += `              <Route path="${p.route}" element={<${p.componentName} />} />\n`;
}

appTsx += `
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Providers>
  );
}
export default App;
`;

fs.writeFileSync(path.join(VITE_DIR, 'src', 'App.tsx'), appTsx);

// 7. Fix vite.config.ts
fs.writeFileSync(path.join(VITE_DIR, 'vite.config.ts'), `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      '@': '/src',
    }
  },
  build: {
    target: 'esnext'
  }
})
`);

// 8. Move API routes for Vercel
const apiDir = path.join(__dirname, 'api');
if (fs.existsSync(apiDir)) fs.rmSync(apiDir, { recursive: true, force: true });
fs.mkdirSync(apiDir, { recursive: true });

const nextApiDir = path.join(NEXT_DIR, 'src', 'app', 'api');
if (fs.existsSync(nextApiDir)) {
  execSync(`xcopy /E /I /Y "${nextApiDir}" "${apiDir}"`);
}

// Write vercel.json
fs.writeFileSync(path.join(VITE_DIR, 'vercel.json'), JSON.stringify({
  rewrites: [
    { source: "/api/(.*)", destination: "/api/$1" },
    { source: "/(.*)", destination: "/index.html" }
  ]
}, null, 2));

console.log("Migration script complete!");
