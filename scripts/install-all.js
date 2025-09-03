#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const apps = [
    { name: 'Backend', path: 'backend' },
    { name: 'Web App', path: 'apps/web' },
    { name: 'Desktop App', path: 'apps/desktop' }
];

console.log('Installing dependencies for all applications...\n');

for (const app of apps) {
    console.log(`📦 Installing ${app.name} dependencies...`);
    try {
        process.chdir(path.join(__dirname, '..', app.path));
        execSync('npm install', { stdio: 'inherit' });
        console.log(`✅ ${app.name} dependencies installed successfully\n`);
    } catch (error) {
        console.error(`❌ Failed to install ${app.name} dependencies:`, error.message);
        process.exit(1);
    }
}

console.log('🎉 All dependencies installed successfully!');
console.log('\nNext steps:');
console.log('1. Set up environment variables in each app');
console.log('2. Start the backend: cd backend && npm run db:start');
console.log('3. Start development servers:');
console.log('   - Web: cd apps/web && npm run dev');
console.log('   - Desktop: cd apps/desktop && npm run dev');