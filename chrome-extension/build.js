// Simple build script - Copy files to dist
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy manifest.json
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

// Copy content scripts
const contentSrc = path.join(srcDir, 'content');
fs.copyFileSync(
  path.join(contentSrc, 'content.js'),
  path.join(distDir, 'content.js')
);
fs.copyFileSync(
  path.join(contentSrc, 'content.css'),
  path.join(distDir, 'content.css')
);

// Copy background script
const backgroundSrc = path.join(srcDir, 'background');
fs.copyFileSync(
  path.join(backgroundSrc, 'background.js'),
  path.join(distDir, 'background.js')
);

// Copy popup files
const popupSrc = path.join(srcDir, 'popup');
fs.copyFileSync(
  path.join(popupSrc, 'popup.html'),
  path.join(distDir, 'popup.html')
);
fs.copyFileSync(
  path.join(popupSrc, 'popup.js'),
  path.join(distDir, 'popup.js')
);

// Create assets directory
const assetsDir = path.join(distDir, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

console.log('✅ Build completed successfully!');
console.log(`📦 Extension files are in: ${distDir}`);
console.log('\nTo load the extension:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the dist folder');
