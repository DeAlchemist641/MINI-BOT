import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import https from 'https';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CONFIG
const ZIP_URL = 'https://github.com/PrinceXtremeX/MINI-BOT/archive/refs/heads/main.zip';
const TEMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'bot-'));
const ZIP_PATH = path.join(TEMP_DIR, 'bot.zip');
const EXTRACTED_DIR = path.join(TEMP_DIR, 'extracted');

// Step 1: Download ZIP
console.log('[⬇️] Downloading bot files from GitHub...');
const downloadZip = () =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(ZIP_PATH);
    https.get(ZIP_URL, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error('Failed to download ZIP: ' + response.statusCode));
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });

// Step 2: Extract ZIP
const extractZip = () => {
  console.log('[🧩] Extracting ZIP file...');
  const zip = new AdmZip(ZIP_PATH);
  zip.extractAllTo(EXTRACTED_DIR, true);
  console.log('[📂] Extraction completed.');
};

// Step 3: Install Dependencies
const installDependencies = (dir) =>
  new Promise((resolve, reject) => {
    console.log('[📦] Installing dependencies...');
    exec('npm install', { cwd: dir }, (err, stdout, stderr) => {
      if (err) {
        console.error('[❌] npm install failed:\n' + stderr);
        return reject(err);
      }
      console.log(stdout);
      resolve();
    });
  });

// Step 4: Start Bot
const startBot = (dir) => {
  console.log('[🚀] Starting the bot...');
  const child = exec('node index.js', { cwd: dir });

  child.stdout.on('data', (data) => process.stdout.write(data));
  child.stderr.on('data', (data) => process.stderr.write(data));
};

(async () => {
  try {
    await downloadZip();
    console.log('[✅] ZIP file downloaded successfully.');
    extractZip();

    // Get the real path inside the extracted folder
    const folders = fs.readdirSync(EXTRACTED_DIR);
    const botFolder = path.join(EXTRACTED_DIR, folders.find(f => f.startsWith('MINI-BOT')));
    await installDependencies(botFolder);
    startBot(botFolder);
  } catch (error) {
    console.error('[❌] Error:', error);
  }
})();
