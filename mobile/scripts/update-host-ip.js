const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Script to automatically detect LAN IP and update .env for Expo
 * Follows PLAN-auto-ip-dev-script.md
 */

const ENV_PATH = path.join(__dirname, '../.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '../.env.example');
const KEY = 'EXPO_PUBLIC_API_URL';

async function updateIP() {
  console.log('🔍 Scanning for valid network interfaces...');

  // 1. Get all network interfaces
  const interfaces = os.networkInterfaces();
  const validIPs = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Filter for IPv4, non-internal, and likely LAN addresses
      if (net.family === 'IPv4' && !net.internal) {
        // Exclude common VPN/Docker/Loopback ranges if possible, 
        // but prioritize 192.168.* and 10.*
        validIPs.push({
          ip: net.address,
          name: name
        });
      }
    }
  }

  if (validIPs.length === 0) {
    console.error('❌ No valid LAN IP found. Please check your network connection.');
    process.exit(1);
  }

  let selectedIP;

  if (validIPs.length === 1) {
    selectedIP = validIPs[0].ip;
    console.log(`✅ Automatically selected IP: ${selectedIP} (${validIPs[0].name})`);
  } else {
    // Interactive selection if multiple IPs found
    console.log('\nMultiple network adapters detected. Please select one:');
    validIPs.forEach((item, index) => {
      console.log(`${index + 1}. ${item.ip} (${item.name})`);
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question('\nEnter number (default is 1): ', (ans) => {
        const idx = parseInt(ans) - 1;
        resolve(validIPs[idx] || validIPs[0]);
      });
    });

    selectedIP = answer.ip;
    rl.close();
    console.log(`✅ Selected IP: ${selectedIP}`);
  }

  // 2. Handle .env template if missing
  if (!fs.existsSync(ENV_PATH)) {
    if (fs.existsSync(ENV_EXAMPLE_PATH)) {
      console.log('📝 .env missing. Copying from .env.example...');
      fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
    } else {
      console.log('📝 .env missing. Creating a new one...');
      fs.writeFileSync(ENV_PATH, '# API Configuration\n');
    }
  }

  // 3. Atomic Write to .env
  try {
    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    const newUrl = `http://${selectedIP}:8080/api/v1`;
    
    let updatedContent;
    const regex = new RegExp(`^${KEY}=.*`, 'm');

    if (regex.test(envContent)) {
      updatedContent = envContent.replace(regex, `${KEY}=${newUrl}`);
    } else {
      updatedContent = envContent + `\n${KEY}=${newUrl}\n`;
    }

    // Write to temp file then rename (Atomic)
    const tempPath = `${ENV_PATH}.tmp`;
    fs.writeFileSync(tempPath, updatedContent);
    fs.renameSync(tempPath, ENV_PATH);

    console.log(`\n🚀 IP updated to ${selectedIP} in .env`);
    console.log(`🔗 API URL: ${newUrl}`);
    console.log('\n💡 Tip: If you can\'t connect, please check if port 8080 is open in your Windows Firewall.');
    console.log('--------------------------------------------------\n');

  } catch (err) {
    console.error('❌ Error updating .env:', err.message);
    process.exit(1);
  }
}

updateIP();
