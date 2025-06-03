import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copyPrismaEngines() {
  try {
    // Possible Prisma engine locations
    const possiblePrismaDirs = [
      join(__dirname, '../node_modules/.prisma/client'),
      join(__dirname, '../node_modules/@prisma/client'),
      join(__dirname, '../.prisma/client')
    ];

    // Find the first directory that exists
    const PRISMA_DIR = possiblePrismaDirs.find(dir => existsSync(dir));
    
    if (!PRISMA_DIR) {
      throw new Error('Could not find Prisma engine directory. Tried:\n' + possiblePrismaDirs.join('\n'));
    }

    console.log('Found Prisma directory:', PRISMA_DIR);

    // Target directories
    const TARGET_DIRS = [
      join(__dirname, '../netlify/functions'),
      join(__dirname, '../server/generated/prisma')
    ];

    // Copy to each target directory
    TARGET_DIRS.forEach(targetDir => {
      // Ensure target directory exists
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
        console.log('Created directory:', targetDir);
      }

      // Copy engine files
      const engineFiles = readdirSync(PRISMA_DIR)
        .filter(file => file.includes('libquery_engine'));

      if (engineFiles.length === 0) {
        console.warn('No engine files found in', PRISMA_DIR);
        return;
      }

      engineFiles.forEach(file => {
        const sourcePath = join(PRISMA_DIR, file);
        const targetPath = join(targetDir, file);
        copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${file} to ${targetDir}`);
      });
    });

    console.log('Successfully copied all Prisma engine files');
  } catch (error) {
    console.error('Error copying Prisma engines:', error);
    process.exit(1);
  }
}

copyPrismaEngines(); 