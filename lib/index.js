import {
  configureTermux,
  getInstallStatus,
  installProot,
  installUbuntu,
  setupProotUbuntu,
  setupBionicBypassInProot,
  runInProot,
  runInProotWithCallback
} from './installer.js';
import { isAndroid } from './bionic-bypass.js';
import { spawn } from 'child_process';

const VERSION = '1.0.0';

function printBanner() {
  console.log(`
  
     OPENCLAW-DROID v${VERSION}
  
`);
}

function printHelp() {
  console.log(`
Usage: openclaw [command] [args...]

If run without arguments, it starts the OpenClaw gateway.

Commands:
  start       Start OpenClaw gateway (Default)
  setup       Full installation (proot + Ubuntu + OpenClaw)
  update      Update OpenClaw to the latest version
  repair      Re-install OpenClaw and dependencies
  status      Check installation status
  shell       Open Ubuntu shell with OpenClaw ready
  help        Show this help message
  openclaw onboarding     
  openclaw gateway -v      
  openclaw doctor          

Examples:
  openclaw                   # Start gateway
  openclaw setup             # First-time setup
  openclaw update            # Update OpenClaw
  openclaw repair            # Fix installation
  openclaw shell             # Enter Ubuntu shell
`);
}

async function runSetup() {
  console.log('Starting OpenClaw Droid setup for Termux...\n');

  if (!isAndroid()) {
    console.log('Warning: This package is designed for Android/Termux.');
    console.log('Some features may not work on other platforms.\n');
  }

  let status = getInstallStatus();

  console.log('[1/5] Checking proot-distro...');
  if (!status.proot) {
    installProot();
  } else {
    console.log('  ✓ proot-distro installed');
  }
  console.log('');

  console.log('[2/5] Checking Ubuntu in proot...');
  status = getInstallStatus();
  if (!status.ubuntu) {
    installUbuntu();
  } else {
    console.log('  ✓ Ubuntu installed');
  }
  console.log('');

  console.log('[3/5] Setting up Node.js and OpenClaw in Ubuntu...');
  status = getInstallStatus();
  if (!status.openClawInProot) {
    setupProotUbuntu();
  } else {
    console.log('  ✓ OpenClaw already installed in proot');
  }
  console.log('');

  console.log('[4/5] Setting up Bionic Bypass in proot...');
  setupBionicBypassInProot();
  console.log('');

  console.log('[5/5] Configuring Termux...');
  configureTermux();
  console.log('');

  console.log('═══════════════════════════════════════════');
  console.log('Setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run onboarding: openclaw onboarding');
  console.log('     → Select "Loopback (127.0.0.1)" when asked!');
  console.log('  2. Start gateway:  openclaw start');
  console.log('');
  console.log('Dashboard: http://127.0.0.1:18789');
  console.log('═══════════════════════════════════════════');
}

function showStatus() {
  process.stdout.write('Checking installation status...');
  const status = getInstallStatus();
  process.stdout.write('\r' + ' '.repeat(35) + '\r');

  console.log('Installation Status:\n');
  console.log('Termux:');
  console.log(`  proot-distro:     ${status.proot ? '✓ installed' : '✗ missing'}`);
  console.log(`  Ubuntu (proot):   ${status.ubuntu ? '✓ installed' : '✗ not installed'}`);
  console.log('');

  if (status.ubuntu) {
    console.log('Inside Ubuntu:');
    console.log(`  OpenClaw:         ${status.openClawInProot ? '✓ installed' : '✗ not installed'}`);
    console.log(`  Bionic Bypass:    ${status.bionicBypassInProot ? '✓ configured' : '✗ not configured'}`);
    console.log('');
  }

  if (status.proot && status.ubuntu && status.openClawInProot) {
    console.log('Status: ✓ Ready to run!');
    console.log('');
  } else {
    console.log('Status: ✗ Setup incomplete');
    console.log('Run: clawdroid setup');
  }
}

function updateOpenClaw() {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu) {
    console.error('proot/Ubuntu not installed. Run: openclaw setup');
    process.exit(1);
  }

  console.log('Updating OpenClaw to the latest version...');
  
  const proc = runInProotWithCallback('npm install -g openclaw@latest', () => {
    console.log('npm output:');
  });

  proc.on('close', (code) => {
    if (code === 0) {
      console.log('\n✓ OpenClaw updated successfully!');
    console.log('Run "openclaw start" to launch the gateway.');
    } else {
      console.error(`\n✗ Update failed with code ${code}`);
    }
  });
}

function startGateway() {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu) {
    console.error('proot/Ubuntu not installed. Run: clawdroid setup');
    process.exit(1);
  }

  if (!status.openClawInProot) {
    console.error('OpenClaw not installed in proot. Run: clawdroid setup');
    process.exit(1);
  }

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  let started = false;
  const DASHBOARD_URL = 'http://127.0.0.1:18789';

  const spinner = setInterval(() => {
    if (!started) {
      process.stdout.write(`\r${frames[i++ % frames.length]} Starting OpenClaw gateway...`);
    }
  }, 80);

  const checkDashboard = setInterval(async () => {
    if (started) return;
    try {
      const response = await fetch(DASHBOARD_URL, { method: 'HEAD', signal: AbortSignal.timeout(1000) });
      if (response.ok || response.status < 500) {
        started = true;
        clearInterval(spinner);
        clearInterval(checkDashboard);
        process.stdout.write('\r' + ' '.repeat(40) + '\r');
        console.log('✓ OpenClaw gateway started!\n');
        console.log(`Dashboard: ${DASHBOARD_URL}`);
        console.log('Press Ctrl+C to stop\n');
        console.log('─'.repeat(45) + '\n');
      }
    } catch {}
  }, 500);

  const gateway = runInProot('openclaw gateway --verbose');

  gateway.on('error', (err) => {
    clearInterval(spinner);
    clearInterval(checkDashboard);
    console.error('\nFailed to start gateway:', err.message);
  });

  gateway.on('close', (code) => {
    clearInterval(spinner);
    clearInterval(checkDashboard);
    if (!started) {
      console.log('\nGateway exited before starting. Run: clawdroid onboarding');
    }
  });
}

function runOpenclawCommand(args) {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu || !status.openClawInProot) {
    console.error('Setup not complete. Run: clawdroid setup');
    process.exit(1);
  }

  const command = args.join(' ');
  console.log(`Running: openclaw ${command}\n`);

  if (args[0] === 'onboarding') {
    console.log('TIP: Select "Loopback (127.0.0.1)" when asked for binding!\n');
  }

  const proc = runInProot(`openclaw ${command}`);

  proc.on('error', (err) => {
    console.error('Failed to run command:', err.message);
  });
}

function openShell() {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu) {
    console.error('proot/Ubuntu not installed. Run: clawdroid setup');
    process.exit(1);
  }

  console.log('Entering Ubuntu shell...');
  console.log('Type "exit" to return to Termux\n');

  const shell = spawn('proot-distro', ['login', 'ubuntu'], {
    stdio: 'inherit'
  });

  shell.on('error', (err) => {
    console.error('Failed to open shell:', err.message);
  });
}

export async function main(args) {
  const command = args[0] || 'start';

  printBanner();

  switch (command) {
    case 'setup':
    case 'install':
      await runSetup();
      break;

    case 'status':
      showStatus();
      break;

    case 'update':
      updateOpenClaw();
      break;

    case 'repair':
      console.log('Repairing installation...');
      await setupProotUbuntu();
      setupBionicBypassInProot();
      console.log('Repair complete!');
      break;

    case 'start':
    case 'run':
      startGateway();
      break;

    case 'shell':
    case 'ubuntu':
      openShell();
      break;

    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    default:
      runOpenclawCommand(args);
      break;
  }
}
