const fs = require('fs');
const path = require('path');

// Paths
const PRISMA_DIR = path.join(__dirname, '../node_modules/.prisma/client');
const TARGET_DIR = path.join(__dirname, '../netlify/functions');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Copy engine files
fs.readdirSync(PRISMA_DIR).forEach(file => {
  if (file.includes('libquery_engine')) {
    const sourcePath = path.join(PRISMA_DIR, file);
    const targetPath = path.join(TARGET_DIR, file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${file} to functions directory`);
  }
}); 