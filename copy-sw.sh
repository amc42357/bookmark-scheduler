#!/bin/zsh
# Copy background.js and manifest.json to dist/browser after build
mkdir -p dist/browser
cp public/background.js dist/browser/background.js
cp src/manifest.json dist/browser/manifest.json
