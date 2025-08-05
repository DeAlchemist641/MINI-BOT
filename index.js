import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';

const TEMP_DIR = path.join(os.tmpdir(), 'mini-bot');
const ZIP_URL = 'https://github.com/PrinceXtremeX/MINI-BOT/archive/refs/heads/main.zip';
const ZIP_PATH = path.join(TEMP_DIR, 'bot.zip');

async function downloadBot() {
  console.log('[⬇️] Downloading bot files from GitHub...');
  const res = await fetch(ZIP_URL);
  if (!res.ok) throw new Error(`Failed to download ZIP: ${res.statusText}`);
  const buffer = await res.buffer();
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  fs.writeFileSync(ZIP_PATH, buffer);
  console.log('[✅] ZIP file downloaded successfully.');
}

function extractZip() {
  console.log('[🧩] Extracting ZIP file...');
  const zip = new AdmZip(ZIP_PATH);
  zip.extractAllTo(TEMP_DIR, true);
  console.log('[📂] Extraction completed.');
}

function installDependencies() {
  const extractedPath = path.join(TEMP_DIR, 'MINI-BOT-main');
  console.log('[📦] Installing dependencies...');

  try {
    console.log('[⬆️] Updating npm to latest version...');
    execSync('npm install -g npm@10', { stdio: 'inherit' }); // 👈 Force npm v10+
    console.log('[✅] npm updated successfully.');
  } catch (err) {
    console.error('[❌] Failed to update npm:', err.message);
  }

  try {
    execSync('npm install', { cwd: extractedPath, stdio: 'inherit' });
    console.log('[✅] Dependencies installed.');
  } catch (err) {
    console.error('[💥] Failed to install dependencies:', err.message);
    process.exit(1);
  }
}

function startBot() {
  const extractedPath = path.join(TEMP_DIR, 'MINI-BOT-main');
  console.log('[🚀] Starting the bot...');
  try {
    execSync('pm2 start index.js --name MINI-BOT', { cwd: extractedPath, stdio: 'inherit' });
  } catch (err) {
    console.error('[💥] Failed to start bot with PM2:', err.message);
  }
}

(async () => {
  try {
    await downloadBot();
    extractZip();
    installDependencies();
    startBot();
  } catch (err) {
    console.error('[🔥] Fatal error:', err.message);
  }
})();
