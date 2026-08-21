const fs = require('fs')
const path = require('path')

const fixExports = (dir) => {
  const packageJsonPath = path.join(dir, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    let changed = false

    const fixObj = (obj) => {
      if (typeof obj !== 'object' || obj === null) return
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if ('default' in obj[key]) {
            const val = obj[key]['default']
            delete obj[key]['default']
            obj[key]['default'] = val
            changed = true
          }
          fixObj(obj[key])
        }
      }
    }

    if (pkg.exports) {
      fixObj(pkg.exports)
    }

    if (changed) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2))
      console.log('Fixed exports for', pkg.name)
    }
  }

  const nodeModules = path.join(dir, 'node_modules')
  if (fs.existsSync(nodeModules)) {
    const scopes = fs.readdirSync(nodeModules)
    for (const scope of scopes) {
      if (scope.startsWith('@')) {
        const pkgs = fs.readdirSync(path.join(nodeModules, scope))
        for (const pkg of pkgs) {
          fixExports(path.join(nodeModules, scope, pkg))
        }
      } else {
        fixExports(path.join(nodeModules, scope))
      }
    }
  }
}

fixExports(__dirname)
