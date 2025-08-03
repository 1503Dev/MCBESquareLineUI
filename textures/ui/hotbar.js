const fs = require('fs');
const path = require('path');

const sourcePath = './textures/ui/hotbar_0.png';
const destinationDir = './textures/ui/';

if (!fs.existsSync(sourcePath)) {
    process.exit(1);
}
try {
    const fileData = fs.readFileSync(sourcePath);
    for (let i = 1; i <= 8; i++) {
        const destPath = path.join(destinationDir, `hotbar_${i}.png`);
        fs.writeFileSync(destPath, fileData);
        console.log(`${destPath}`);
    }
} catch (err) {
    console.error(err);
}