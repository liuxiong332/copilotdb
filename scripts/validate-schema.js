#!/usr/bin/env node

/**
 * Schema validation script
 * Validates SQL migration files for syntax errors
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

function validateSQL(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Basic SQL syntax checks
    const checks = [
        {
            name: 'Balanced parentheses',
            test: (sql) => {
                const open = (sql.match(/\(/g) || []).length;
                const close = (sql.match(/\)/g) || []).length;
                return open === close;
            }
        },
        {
            name: 'No unterminated strings',
            test: (sql) => {
                // Remove escaped quotes and comments
                const cleaned = sql
                    .replace(/--.*$/gm, '') // Remove line comments
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                    .replace(/\\'/g, '') // Remove escaped single quotes
                    .replace(/\\"/g, ''); // Remove escaped double quotes

                const singleQuotes = (cleaned.match(/'/g) || []).length;
                const doubleQuotes = (cleaned.match(/"/g) || []).length;

                return singleQuotes % 2 === 0 && doubleQuotes % 2 === 0;
            }
        },
        {
            name: 'Valid CREATE TABLE statements',
            test: (sql) => {
                const createTables = sql.match(/CREATE TABLE[^;]+;/gi) || [];
                return createTables.every(stmt =>
                    stmt.includes('(') && stmt.includes(')')
                );
            }
        },
        {
            name: 'Valid RLS policies',
            test: (sql) => {
                const policies = sql.match(/CREATE POLICY[^;]+;/gi) || [];
                return policies.every(policy =>
                    policy.includes('ON') && (policy.includes('FOR') || policy.includes('USING'))
                );
            }
        }
    ];

    console.log(`\n📋 Validating ${path.basename(filePath)}:`);

    let allPassed = true;
    checks.forEach(check => {
        try {
            const passed = check.test(content);
            console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
            if (!passed) allPassed = false;
        } catch (error) {
            console.log(`  ❌ ${check.name} (Error: ${error.message})`);
            allPassed = false;
        }
    });

    return allPassed;
}

function main() {
    console.log('🔍 Validating SQL migration files...\n');

    if (!fs.existsSync(MIGRATIONS_DIR)) {
        console.log('❌ Migrations directory not found');
        process.exit(1);
    }

    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
        .filter(file => file.endsWith('.sql'))
        .sort();

    if (migrationFiles.length === 0) {
        console.log('⚠️  No migration files found');
        process.exit(0);
    }

    let allValid = true;

    migrationFiles.forEach(file => {
        const filePath = path.join(MIGRATIONS_DIR, file);
        const isValid = validateSQL(filePath);
        if (!isValid) allValid = false;
    });

    console.log('\n' + '='.repeat(50));
    if (allValid) {
        console.log('✅ All migration files passed validation!');
        process.exit(0);
    } else {
        console.log('❌ Some migration files have issues');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}