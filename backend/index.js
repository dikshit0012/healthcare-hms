const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, 'dist', 'main.js'),
  path.join(__dirname, 'dist', 'src', 'main.js'),
  path.join(__dirname, 'dist', 'main'),
  path.join(__dirname, 'dist', 'src', 'main')
];

let entryPoint = null;
for (const c of candidates) {
  if (fs.existsSync(c)) {
    entryPoint = c;
    break;
  }
}

if (!entryPoint) {
  console.error('❌ Could not find compiled main entry point in dist/ or dist/src/');
  console.error('Contents of dist:', fs.existsSync(path.join(__dirname, 'dist')) ? fs.readdirSync(path.join(__dirname, 'dist')) : 'dist directory missing');
  process.exit(1);
}

console.log(`🚀 Starting HMS Backend from ${entryPoint}...`);
require(entryPoint);
