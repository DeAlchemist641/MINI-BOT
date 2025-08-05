const fetch = require('node-fetch');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const os = require('os');

const ZIP_URL = 'https://github.com/PrinceXtremeX/MINI-BOT/archive/refs/heads/main.zip';
const TEMP_DIR = path.join(os.tmpdir(), 'mini-bot');
const ZIP_PATH = path.join(TEMP_DIR, 'main.zip');
const EXTRACTED_DIR = path.join(TEMP_DIR, 'MINI-BOT-main');
const ENTRY_FILE = path.join(EXTRACTED_DIR, 'index.js');

// Create temp folder if not exists
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Function to download ZIP
async function downloadZip(url, dest) {
  console.log('[⬇️] Downloading bot files from GitHub...');
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Failed to download ZIP: ${res.status} ${res.statusText}`);

  const buffer = await res.buffer();
  fs.writeFileSync(dest, buffer);
  console.log('[✅] ZIP file downloaded successfully.');
}

// Function to unzip with adm-zip
function unzipWithAdmZip(zipPath, outputPath) {
  console.log('[🧩] Extracting ZIP file...');
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputPath, true);
  console.log('[📂] Extraction completed.');
}

// Function to install dependencies
function installDependencies(folder) {
  console.log('[📦] Installing dependencies...');
  try {
    // ✅ Use latest NPM to support 'npm:' package resolution
    execSync('npx npm@latest install', { cwd: folder, stdio: 'inherit' });
    console.log('[✅] Dependencies installed.');
  } catch (err) {
    console.error('[💥] Failed to install dependencies:', err.message);
    process.exit(1);
  }
}

// Function to start the bot
function startBot(entry) {
  if (!fs.existsSync(entry)) {
    console.error('[❌] Bot entry file not found:', entry);
    process.exit(1);
  }

  console.log('[🚀] Starting the bot...');
  const subprocess = exec(`node ${entry}`, { cwd: path.dirname(entry) });

  subprocess.stdout.on('data', (data) => process.stdout.write(data));
  subprocess.stderr.on('data', (data) => process.stderr.write(data));
  subprocess.on('exit', (code) => console.log(`[📦] Bot exited with code ${code}`));
}

// Main logic
(async () => {
  try {
    await downloadZip(ZIP_URL, ZIP_PATH);
    unzipWithAdmZip(ZIP_PATH, TEMP_DIR);
    installDependencies(EXTRACTED_DIR);
    startBot(ENTRY_FILE);
  } catch (err) {
    console.error('[💥] Error:', err.message);
  }
})();
