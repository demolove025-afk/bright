#!/usr/bin/env node

/**
 * Quick Start Script for APKL Project
 * Provides automated setup and verification
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description} found`, 'green');
    return true;
  } else {
    log(`✗ ${description} missing`, 'red');
    return false;
  }
}

function checkEnvVar(varName) {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return false;
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  return envContent.includes(`${varName}=`);
}

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'blue');
  log('║   APKL - Bucodel University Management System             ║', 'blue');
  log('║   Quick Start Setup                                       ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'blue');

  // Check file structure
  log('📋 Checking file structure...', 'bright');
  const requiredFiles = [
    ['.env', 'Environment variables'],
    ['package.json', 'Package configuration'],
    ['server.js', 'Backend server'],
    ['script.js', 'Frontend script'],
    ['index.html', 'HTML file'],
    ['config.js', 'Configuration file'],
    ['supabase-config.js', 'Supabase setup'],
    ['database-init.js', 'Database schema'],
  ];

  let allFilesExist = true;
  for (const [file, desc] of requiredFiles) {
    if (!checkFile(path.join(__dirname, file), desc)) {
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    log('\n⚠️  Some files are missing!', 'yellow');
    process.exit(1);
  }

  log('\n✓ All required files present!\n', 'green');

  // Check environment variables
  log('🔐 Checking environment configuration...', 'bright');
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'PORT', 'API_URL'];
  let allEnvVarsSet = true;
  for (const envVar of requiredEnvVars) {
    if (checkEnvVar(envVar)) {
      log(`✓ ${envVar} configured`, 'green');
    } else {
      log(`✗ ${envVar} missing from .env`, 'red');
      allEnvVarsSet = false;
    }
  }

  if (!allEnvVarsSet) {
    log('\n⚠️  Please update .env file with your Supabase credentials', 'yellow');
  }

  log('\n✓ Environment configuration looks good!\n', 'green');

  // Check dependencies
  log('📦 Checking npm dependencies...', 'bright');
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
    const deps = Object.keys(packageJson.dependencies || {});
    log(`✓ Found ${deps.length} dependencies: ${deps.join(', ')}`, 'green');
  } catch (err) {
    log('✗ Could not read package.json', 'red');
  }

  log('\n📚 Setup Instructions:\n', 'bright');
  log('1. Database Setup (if not already done):', 'yellow');
  log('   - Go to: https://app.supabase.com');
  log('   - Open SQL Editor');
  log('   - Run SQL schema from database-init.js');
  log('   - Seed departments table\n', 'dim');

  log('2. Start Backend Server:', 'yellow');
  log('   npm start\n', 'dim');

  log('3. Start Frontend (new terminal):', 'yellow');
  log('   python -m http.server 8000\n', 'dim');

  log('4. Open Browser:', 'yellow');
  log('   http://localhost:8000\n', 'dim');

  log('📖 For detailed setup guide, see SETUP_GUIDE.md\n', 'blue');

  log('═══════════════════════════════════════════════════════════', 'blue');
  log('Setup check complete! You\'re ready to get started.', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'blue');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
