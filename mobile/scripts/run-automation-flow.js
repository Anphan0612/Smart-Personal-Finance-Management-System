#!/usr/bin/env node

const { spawnSync, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const isStrict = args.includes('--strict');
const appUrlArg = args.find((arg) => arg.startsWith('--app-url='));
const appUrl = appUrlArg ? appUrlArg.replace('--app-url=', '') : process.env.APP_URL;

const flowFile = isStrict ? '.maestro/flows/p0-strict.yaml' : '.maestro/flows/p0-smoke.yaml';
const env = { ...process.env };

if (appUrl) {
  env.APP_URL = appUrl;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  return result.status === 0;
}

function runCapture(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return { out: (result.stdout || '').trim(), status: result.status };
}

function sleepMs(ms) {
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  try {
    if (process.platform === 'win32') {
      execSync(`ping 127.0.0.1 -n ${seconds + 1} > nul`, {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else {
      execSync(`sleep ${seconds}`, { stdio: 'ignore' });
    }
  } catch {
    // ignore
  }
}

function listAdbDevices() {
  const { out } = runCapture('adb', ['devices']);
  const lines = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows = [];
  for (const line of lines) {
    if (line.includes('List of devices')) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const serial = parts[0];
    const state = parts[1];
    rows.push({ serial, state });
  }
  return rows;
}

function clearMaestroSessionsCache() {
  const base = process.env.USERPROFILE || process.env.HOME || '';
  if (!base) return;
  const sessionsFile = path.join(base, '.maestro', 'sessions');
  try {
    if (fs.existsSync(sessionsFile)) {
      fs.unlinkSync(sessionsFile);
      console.log('[MAESTRO] Đã xóa cache sessions cũ (.maestro/sessions).');
    }
  } catch {
    // ignore
  }
}

function pickAndroidSerial(ready) {
  const emulator = ready.find((d) => d.serial.startsWith('emulator-'));
  return (emulator || ready[0]).serial;
}

function maybeResetAdbForMaestro(rows) {
  const ready = rows.filter((d) => d.state === 'device');
  const bad = rows.some((d) => d.state === 'unauthorized' || d.state === 'offline');
  if (!bad || ready.length === 0) {
    return rows;
  }
  console.warn(
    '[MAESTRO] Có thiết bị unauthorized/offline; đang restart adb để Maestro nhìn thấy emulator (Windows thường gặp).'
  );
  spawnSync('adb', ['kill-server'], { shell: process.platform === 'win32' });
  spawnSync('adb', ['start-server'], { shell: process.platform === 'win32' });
  sleepMs(2000);
  return listAdbDevices();
}

function maybeReverseExpoBundling(serial) {
  const url = env.APP_URL || '';
  if (!serial || !url.includes('8081')) return;
  run('adb', ['-s', serial, 'reverse', 'tcp:8081', 'tcp:8081']);
}

if (!run('maestro', ['--version'])) {
  console.error('\n[MAESTRO] CLI chưa được cài hoặc chưa có trong PATH.');
  console.error('[MAESTRO] Cài đặt: https://docs.maestro.dev/getting-started/installing-maestro');
  process.exit(1);
}

clearMaestroSessionsCache();

let adbRows = listAdbDevices();
adbRows = maybeResetAdbForMaestro(adbRows);
const readyDevices = adbRows.filter((d) => d.state === 'device');

if (readyDevices.length === 0) {
  console.error('\n[MAESTRO] adb không có thiết bị trạng thái "device".');
  console.error('[MAESTRO] Mở Android Emulator hoặc bấm “Allow USB debugging” trên điện thoại, rồi chạy: adb devices');
  process.exit(1);
}

const androidSerial = pickAndroidSerial(readyDevices);
maybeReverseExpoBundling(androidSerial);

if (!env.APP_URL) {
  console.warn('\n[MAESTRO] Chưa cung cấp APP_URL.');
  console.warn('[MAESTRO] Sẽ chạy trên app đang mở sẵn trong emulator.');
  console.warn('[MAESTRO] Khuyến nghị PowerShell: $env:APP_URL="exp://127.0.0.1:8081"; npm run test:auto:strict');
}

console.log(`\n[MAESTRO] Running flow: ${flowFile}`);
console.log(`[MAESTRO] adb serial ưu tiên: ${androidSerial}`);

const maestroArgs = ['test', '--platform', 'android'];
if (readyDevices.length > 1) {
  maestroArgs.push('--udid', androidSerial);
}

if (env.APP_URL) {
  maestroArgs.push('-e', `APP_URL=${env.APP_URL}`);
}

maestroArgs.push(flowFile);

const ok = run('maestro', maestroArgs, { env });
process.exit(ok ? 0 : 1);
