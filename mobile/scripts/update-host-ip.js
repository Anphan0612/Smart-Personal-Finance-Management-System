/* global __dirname */
const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Auto IP Injection Script
 *
 * Detects the host machine's LAN IP and updates EXPO_PUBLIC_API_URL
 * in mobile/.env before Expo starts. Designed to run transparently
 * as part of `npm run start:local`.
 *
 * Features:
 *   - Smart interface filtering (skips virtual adapters)
 *   - Priority-based IP selection (Wi-Fi/Ethernet > others)
 *   - Regex-based .env update (preserves all other variables)
 *   - Atomic file write (temp file + rename)
 */

const ENV_PATH = path.join(__dirname, '../.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '../.env.example');
const KEY = 'EXPO_PUBLIC_API_URL';
const BACKEND_PORT = 8080;
const API_PREFIX = '/api/v1';

// ─── Interface filtering ────────────────────────────────────────

/** Adapter name patterns that are NOT real LAN connections */
const VIRTUAL_ADAPTER_PATTERNS = [
  /^vEthernet/i, // Hyper-V / WSL
  /^VirtualBox/i, // VirtualBox Host-Only
  /^VMware/i, // VMware virtual adapters
  /^docker/i, // Docker Desktop
  /^br-/i, // Docker bridge networks
  /^vboxnet/i, // VirtualBox (Linux)
  /^virbr/i, // libvirt bridge (Linux)
  /^ham/i, // Hamachi VPN
  /^Tailscale/i, // Tailscale VPN
  /^ZeroTier/i, // ZeroTier VPN
  /^utun/i, // macOS VPN tunnels
  /^tun/i, // Linux VPN tunnels
  /^tap/i, // TAP virtual adapters
];

/** IP ranges that are typical LAN addresses */
const LAN_RANGES = [
  /^192\.168\./, // Class C private (most home routers)
  /^10\./, // Class A private (enterprise / some routers)
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
];

/**
 * Check if an adapter name looks like a virtual/VPN interface
 */
function isVirtualAdapter(adapterName) {
  return VIRTUAL_ADAPTER_PATTERNS.some((pattern) => pattern.test(adapterName));
}

/**
 * Check if an IP is in a standard LAN range
 */
function isLanIP(ip) {
  return LAN_RANGES.some((pattern) => pattern.test(ip));
}

// ─── IP Detection ───────────────────────────────────────────────

/**
 * Scans all network interfaces and returns the best LAN IP.
 *
 * Priority order:
 *   1. Real adapter + LAN IP  (e.g. Wi-Fi 192.168.1.5)
 *   2. Real adapter + non-LAN IP (unusual but possible)
 *   3. Virtual adapter + LAN IP (last resort)
 *
 * @returns {{ ip: string, adapter: string, priority: number } | null}
 */
function detectBestIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [adapterName, nets] of Object.entries(interfaces)) {
    for (const net of nets) {
      if (net.family !== 'IPv4' || net.internal) continue;

      const isVirtual = isVirtualAdapter(adapterName);
      const isLan = isLanIP(net.address);

      // Priority: lower = better
      let priority;
      if (!isVirtual && isLan)
        priority = 1; // Best: real + LAN
      else if (!isVirtual && !isLan)
        priority = 2; // OK: real + unusual range
      else if (isVirtual && isLan)
        priority = 3; // Fallback: virtual + LAN
      else priority = 4; // Last resort

      candidates.push({
        ip: net.address,
        adapter: adapterName,
        priority,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Sort by priority (ascending), then by adapter name for stability
  candidates.sort((a, b) => a.priority - b.priority || a.adapter.localeCompare(b.adapter));

  // Log all candidates for transparency
  console.log('📡 Detected network interfaces:');
  candidates.forEach((c, i) => {
    const marker = i === 0 ? ' ← selected' : '';
    const tag = c.priority <= 2 ? '🟢' : '🟡';
    console.log(`   ${tag} ${c.ip.padEnd(16)} (${c.adapter})${marker}`);
  });

  return candidates[0];
}

// ─── .env File Handling ─────────────────────────────────────────

/**
 * Ensures .env exists. Creates from .env.example or from scratch.
 */
function ensureEnvFile() {
  if (fs.existsSync(ENV_PATH)) return;

  if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    console.log('📝 .env not found — copying from .env.example');
    fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
  } else {
    console.log('📝 .env not found — creating a fresh one');
    fs.writeFileSync(ENV_PATH, '# API Configuration\n');
  }
}

/**
 * Updates EXPO_PUBLIC_API_URL in .env using regex replacement.
 * Only touches the target line; all other content is preserved.
 * Uses atomic write (write to .tmp then rename) for safety.
 *
 * @param {string} newUrl - The full API URL to set
 */
function updateEnvFile(newUrl) {
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  const lineRegex = new RegExp(`^${KEY}=.*`, 'm');

  let updated;
  if (lineRegex.test(content)) {
    updated = content.replace(lineRegex, `${KEY}=${newUrl}`);
  } else {
    // Append if key doesn't exist yet
    const separator = content.endsWith('\n') ? '' : '\n';
    updated = `${content}${separator}${KEY}=${newUrl}\n`;
  }

  // Atomic write: temp file → rename
  const tmpPath = `${ENV_PATH}.tmp`;
  fs.writeFileSync(tmpPath, updated);
  fs.renameSync(tmpPath, ENV_PATH);
}

// ─── Main ───────────────────────────────────────────────────────

function main() {
  console.log('');
  console.log('──────────────────────────────────────────────────');
  console.log('🔍 Auto IP Injection — Scanning network...');
  console.log('──────────────────────────────────────────────────');

  const best = detectBestIP();

  if (!best) {
    console.error('❌ No valid LAN IP found. Check your network connection.');
    console.error('   Script will exit — Expo will NOT start.');
    process.exit(1);
  }

  const newUrl = `http://${best.ip}:${BACKEND_PORT}${API_PREFIX}`;

  ensureEnvFile();

  try {
    updateEnvFile(newUrl);
  } catch (err) {
    console.error(`❌ Failed to update .env: ${err.message}`);
    process.exit(1);
  }

  console.log('');
  console.log(`✅ Selected IP : ${best.ip} (${best.adapter})`);
  console.log(`🔗 API URL     : ${newUrl}`);
  console.log('');
  console.log("💡 Can't connect? Check Windows Firewall allows port 8080.");
  console.log('──────────────────────────────────────────────────');
  console.log('');
}

main();
