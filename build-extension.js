const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');


const targets = ['chrome', 'firefox'];
const rootDir = __dirname;
const srcDir = path.join(rootDir, 'dist');
const buildDir = path.join(rootDir, 'build');

const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
const version = pkg.version;

function cleanDir(dir) {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

function cleanZips(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.zip')) fs.unlinkSync(path.join(dir, file));
    });
}

function copyRecursiveSync(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        if (entry.name === '.DS_Store') continue;

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath);
            copyRecursiveSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function copyExtras(outDir) {
    // Copy icons from src/icons to build/[target]/icons
    const iconsSrc = path.join(rootDir, 'src', 'icons');
    const iconsDest = path.join(outDir, 'icons');
    if (fs.existsSync(iconsSrc)) {
        fs.mkdirSync(iconsDest, { recursive: true });
        copyRecursiveSync(iconsSrc, iconsDest);
    }
}

function writeManifest(target, outDir) {
    const manifestPath = path.join(rootDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest.version = version;
    if (target !== 'firefox') {
        delete manifest.browser_specific_settings;
    }
    const manifestOutPath = path.join(outDir, 'manifest.json');
    fs.writeFileSync(manifestOutPath, JSON.stringify(manifest, null, 2));
}

function zipDirectory(srcDir, outPath) {
    const output = fs.createWriteStream(outPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });
    return new Promise((resolve, reject) => {
        archive.pipe(output);
        archive.directory(srcDir, false);
        archive.on('error', reject);
        archive.on('end', resolve);
        archive.finalize();
    });
}

(async () => {

    cleanDir(buildDir);
    cleanZips(buildDir);

    for (let target of targets) {
        const outDir = path.join(buildDir, target);
        cleanDir(outDir);

        copyRecursiveSync(srcDir, outDir);
        copyExtras(outDir); // Icons
        writeManifest(target, outDir);

        const zipName = `tempus-fugit-${target}.zip`;
        const zipPath = path.join(buildDir, zipName);
        await zipDirectory(outDir, zipPath);

        console.log(`✅ Built ${target} → ${zipPath}`);
    }

    console.log(`📦 Version ${version} build complete.`);
})();
