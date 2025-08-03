const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const minify = require('jsonminify');


const manifestPath = path.join(__dirname, 'manifest.json');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(minify(manifestContent));


const rpName = manifest.header.name;
const rpVer = `v${manifest.header.version.join('.')}`;


const outputPath = path.join(__dirname, 'dist', `${rpName}_${rpVer}.mcpack`);


const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}


const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log(`Built to ${outputPath}`);
  console.log(`Compressed size: ${Math.round((archive.pointer() / 1024 + Number.EPSILON) * 100) / 100} KB`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);


const excludedExtensions = new Set(['.js', '.xcf', '.psd', '.md']);
const excludedFiles = new Set(['node_modules', 'dist', '.git', '.gitignore', 'package.json', 'package-lock.json']);


function addDirectoryToArchive(dirPath, rootDir = '') {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.join(rootDir, file);
    const stat = fs.statSync(fullPath);


    if (file.startsWith('__')) return;


    if (excludedFiles.has(file)) return;


    const ext = path.extname(file).toLowerCase();
    if (excludedExtensions.has(ext)) return;

    if (stat.isDirectory()) {
      addDirectoryToArchive(fullPath, relativePath);
    } else {
      if (ext === '.json') {
        const content = fs.readFileSync(fullPath, 'utf8');
        const minified = minify(content);
        archive.append(minified, { name: relativePath });
      } else {
        archive.file(fullPath, { name: relativePath });
      }
    }
  });
}


addDirectoryToArchive(__dirname);

archive.finalize();