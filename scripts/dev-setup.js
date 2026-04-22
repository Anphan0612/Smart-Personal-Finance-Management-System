const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync } = require('child_process');
const net = require('net');
const readline = require('readline');
const chalk = require('chalk');

// --- Configuration ---
const DB_PORT = 3307;
const BACKEND_PORT = 8080;
const AI_PORT = 8000;
const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const MOBILE_ENV_PATH = path.join(ROOT_DIR, 'mobile', '.env');

// --- State ---
const processes = [];

// --- Helpers ---

function log(service, message, color = 'white') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = chalk[color](`[${service}]`);
  console.log(`${chalk.gray(timestamp)} ${prefix} ${message}`);
}

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const config = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      config[match[1]] = value.trim();
    }
  });
  return config;
}

/**
 * Gets all valid IPv4 addresses and asks user to choose if multiple exist
 */
async function selectLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const netInfo of interfaces[name]) {
      if (netInfo.family === 'IPv4' && !netInfo.internal) {
        candidates.push({
          name: name,
          address: netInfo.address,
          isVirtual: /virtual|vbox|docker|vpn|wsl|tailscale/i.test(name)
        });
      }
    }
  }

  if (candidates.length === 0) return '127.0.0.1';
  if (candidates.length === 1) return candidates[0].address;

  console.log(chalk.cyan('\n🌐 Multiple network interfaces detected:'));
  candidates.forEach((c, i) => {
    const label = c.isVirtual ? chalk.gray(`(Virtual: ${c.name})`) : chalk.green(`(Physical: ${c.name})`);
    console.log(`  ${i + 1}. ${chalk.bold(c.address.padEnd(15))} ${label}`);
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  const choice = await new Promise(resolve => {
    rl.question(chalk.yellow(`\n❓ Select the IP address for Mobile connection (1-${candidates.length}) [default 1]: `), (answer) => {
      const idx = parseInt(answer) - 1;
      resolve(candidates[idx] ? candidates[idx].address : candidates[0].address);
    });
  });
  
  rl.close();
  return choice;
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createConnection({ port, host: '127.0.0.1' }, () => {
      server.end();
      resolve(true);
    });
    server.on('error', () => resolve(false));
    server.setTimeout(500, () => {
      server.destroy();
      resolve(false);
    });
  });
}

function updateMobileEnv(ip) {
  log('SETUP', `Syncing IP ${chalk.cyan(ip)} to Mobile .env`, 'magenta');
  const apiUrl = `http://${ip}:${BACKEND_PORT}/api/v1`;
  let content = fs.existsSync(MOBILE_ENV_PATH) ? fs.readFileSync(MOBILE_ENV_PATH, 'utf-8') : '';
  const newEntry = `EXPO_PUBLIC_API_URL=${apiUrl}`;
  
  if (content.includes('EXPO_PUBLIC_API_URL=')) {
    content = content.replace(/^EXPO_PUBLIC_API_URL=.*$/m, newEntry);
  } else {
    content += `\n${newEntry}\n`;
  }
  fs.writeFileSync(MOBILE_ENV_PATH, content);
}

function startService(name, command, args, cwd, env, color) {
  log('SYSTEM', `Starting ${chalk.bold(name)}...`, color);
  const proc = spawn(command, args, { cwd, env, shell: true });

  proc.stdout.on('data', (data) => {
    data.toString().split('\n').forEach(line => {
      if (line.trim()) log(name, line, color);
    });
  });

  proc.stderr.on('data', (data) => {
    data.toString().split('\n').forEach(line => {
      if (line.trim()) log(name, chalk.red(line), color);
    });
  });

  proc.on('exit', (code) => {
    log('SYSTEM', `${name} exited with code ${code}`, 'red');
  });

  processes.push(proc);
  return proc;
}

// --- Cleanup ---
function cleanup() {
  console.log('\n' + chalk.yellow('🧹 Shutting down all services...'));
  processes.forEach(p => {
    if (os.platform() === 'win32') {
      spawn('taskkill', ['/pid', p.pid, '/f', '/t']);
    } else {
      p.kill('SIGINT');
    }
  });
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// --- Main ---

async function main() {
  console.clear();
  console.log(chalk.blue.bold(`
   ╔══════════════════════════════════════════════════════════════╗
   ║        🚀 SMART FINANCE MANAGEMENT SYSTEM - DEV MODE         ║
   ╚══════════════════════════════════════════════════════════════╝
  `));

  const rootConfig = parseEnv(ENV_PATH);
  const lanIp = await selectLanIp();
  updateMobileEnv(lanIp);

  // 1. Database Check
  const isDbUp = await checkPort(DB_PORT);
  if (!isDbUp) {
    log('DB', chalk.yellow(`Port ${DB_PORT} is closed. Attempting to start Docker DB...`), 'yellow');
    try {
      execSync('docker compose up -d db', { stdio: 'inherit', cwd: ROOT_DIR });
      log('DB', chalk.green('Docker DB started successfully.'), 'green');
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      log('DB', chalk.red('Failed to start Docker DB. Please check Docker Desktop.'), 'red');
    }
  } else {
    log('DB', chalk.green('Database is already running.'), 'green');
  }

  // 1.5 Stop existing App containers in Docker (to avoid port conflicts)
  log('DOCKER', 'Ensuring no app containers are running in Docker...', 'yellow');
  try {
    execSync('docker compose stop backend ai-service', { stdio: 'ignore', cwd: ROOT_DIR });
  } catch (e) {
    // Ignore errors if containers don't exist
  }

  const commonEnv = { ...process.env, ...rootConfig };

  // 2. Start AI Service
  const aiEnv = { ...commonEnv, HF_HOME: path.join(ROOT_DIR, 'ai-service', 'models', 'cache') };
  const psPath = os.platform() === 'win32' ? 'powershell.exe' : 'pwsh';
  startService(
    'AI-SVC', 
    psPath, 
    ['-ExecutionPolicy', 'Bypass', '-File', path.join(ROOT_DIR, 'ai-service', 'start-ai.ps1')], 
    ROOT_DIR, 
    aiEnv, 
    'cyan'
  );

  // 3. Start Backend
  const backendEnv = { 
    ...commonEnv, 
    DB_URL: `jdbc:mysql://localhost:${DB_PORT}/${rootConfig.MYSQL_DATABASE || 'smart_money_tracking'}`,
    DB_USERNAME: rootConfig.MYSQL_USER,
    DB_PASSWORD: rootConfig.MYSQL_PASSWORD,
    NLP_SERVICE_URL: `http://localhost:${AI_PORT}`
  };
  
  const mvnBase = os.platform() === 'win32' ? 'mvnw.cmd' : './mvnw';
  const mvnPath = path.join(ROOT_DIR, 'backend', mvnBase);
  
  startService(
    'BACKEND', 
    mvnPath, 
    ['spring-boot:run'], 
    path.join(ROOT_DIR, 'backend'), 
    backendEnv, 
    'green'
  );

  log('SYSTEM', chalk.bold.magenta('All services are booting up. Press Ctrl+C to stop.'), 'magenta');
}

main().catch(err => {
  console.error(chalk.red('💥 Fatal error:'), err);
  cleanup();
});
