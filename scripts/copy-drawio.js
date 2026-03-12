const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'tmp', 'drawio', 'src', 'main', 'webapp');
const destDir = path.join(__dirname, '..', 'dist', 'drawio');

// Lists of files and directories to filter
const ROOT_FILE_WHITELIST = new Set([
  'index.html',
  'export3.html',
  'export-fonts.css',
  'favicon.ico',
]);

const DIRECTORY_BLACKLIST = new Set([
  'WEB-INF',
  'META-INF',
  'stencils',
  'templates',
  'plugins',
  'connect',
  'images',
  'resources',
  'img',
  'shapes',
  'math4',
]);

const JS_FILE_WHITELIST = new Set([
  'app.min.js',
  'bootstrap.js',
  'main.js',
  'export.js',
  'export-init.js',
  'PreConfig.js',
  'PostConfig.js',
]);

function isAllowed(srcPath, entry) {
  const relativePath = path.relative(srcDir, srcPath);
  const pathParts = relativePath.split(path.sep);

  if (entry.isDirectory()) {
    // Root level directories matching blacklist are skipped
    if (pathParts.length === 1 && DIRECTORY_BLACKLIST.has(entry.name)) {
      return false;
    }
    // Exclude all subdirectories inside js/ (e.g. js/diagramly, js/mermaid)
    if (pathParts[0] === 'js' && pathParts.length > 1) {
      return false;
    }
    return true;
  } else {
    // Skip sourcemaps
    if (entry.name.endsWith('.map')) {
      return false;
    }
    
    if (pathParts.length === 1) {
      // Root level files must be in the whitelist
      return ROOT_FILE_WHITELIST.has(entry.name);
    }
    
    if (pathParts[0] === 'js' && pathParts.length === 2) {
      // js/ directory files must be in the whitelist or match shapes-*.min.js
      if (JS_FILE_WHITELIST.has(entry.name) || (entry.name.startsWith('shapes-') && entry.name.endsWith('.min.js'))) {
        return true;
      }
      return false;
    }
    
    // Allow other files inside allowed directories (shapes/, mxgraph/, math4/, etc)
    return true;
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (!isAllowed(srcPath, entry)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying drawio core to dist/drawio...');
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
copyDir(srcDir, destDir);
console.log('Done!');
