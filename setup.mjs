#!/usr/bin/env node

/**
 * ShopEase Setup Script
 * Automated setup for development environment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function execute(command, description) {
  log(`\n${description}...`, colors.cyan);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} completed`, colors.green);
    return true;
  } catch (error) {
    log(`✗ ${description} failed`, colors.red);
    return false;
  }
}

async function setup() {
  log('\n╔═══════════════════════════════════════╗', colors.bright);
  log('║   ShopEase E-Commerce Setup Script   ║', colors.bright);
  log('╚═══════════════════════════════════════╝\n', colors.bright);

  // Check .env file
  log('Checking environment configuration...', colors.cyan);
  const envPath = join(process.cwd(), '.env');
  
  if (!existsSync(envPath)) {
    log('✗ .env file not found!', colors.red);
    log('\nPlease create .env file with your database credentials:', colors.yellow);
    log('1. Copy .env.example to .env', colors.yellow);
    log('2. Update DATABASE_URL with your Neon connection string', colors.yellow);
    log('3. Update JWT_SECRET with a random string', colors.yellow);
    process.exit(1);
  }
  
  const envContent = readFileSync(envPath, 'utf-8');
  if (envContent.includes('your-neon-endpoint')) {
    log('✗ Please update .env with your actual Neon database URL', colors.red);
    process.exit(1);
  }
  
  log('✓ Environment configuration found', colors.green);

  // Install dependencies
  if (!execute('npm install', 'Installing dependencies')) {
    process.exit(1);
  }

  // Generate Prisma Client
  if (!execute('npx prisma generate', 'Generating Prisma Client')) {
    process.exit(1);
  }

  // Push database schema
  log('\nPushing database schema...', colors.cyan);
  log('This will create all tables in your Neon database', colors.yellow);
  if (!execute('npx prisma db push', 'Pushing database schema')) {
    process.exit(1);
  }

  // Seed database
  log('\nSeeding database with sample data...', colors.cyan);
  log('This includes products, users, and categories', colors.yellow);
  if (!execute('npm run prisma:seed', 'Seeding database')) {
    log('Note: Seeding failed. You can run "npm run prisma:seed" manually later', colors.yellow);
  }

  // Success message
  log('\n╔═══════════════════════════════════════╗', colors.green);
  log('║          Setup Complete! 🎉           ║', colors.green);
  log('╚═══════════════════════════════════════╝\n', colors.green);

  log('Next steps:', colors.bright);
  log('1. Run "npm run dev" to start development server', colors.cyan);
  log('2. Visit http://localhost:5173', colors.cyan);
  log('3. Login with: demo@shopease.in / demo123', colors.cyan);
  log('\nFor production deployment:', colors.bright);
  log('1. Read DEPLOYMENT.md for detailed instructions', colors.cyan);
  log('2. Configure Vercel environment variables', colors.cyan);
  log('3. Run "vercel --prod" to deploy\n', colors.cyan);
}

setup().catch((error) => {
  log(`\n✗ Setup failed: ${error.message}`, colors.red);
  process.exit(1);
});
