// Copy background.js and manifest.json to the dist/browser directory after build
const fs = require('fs');
const path = require('path');

const filesToCopy = ['background.js', 'manifest.json'];
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist', 'browser');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

filesToCopy.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(distDir, file);
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`Copied ${file} to dist/browser`);
    }
});
