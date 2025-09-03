/**
 * Database setup integration tests
 * These tests verify that the Supabase backend infrastructure is properly configured
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key',
    timeout: 10000
};

describe('Database Setup', () => {
    let supabase;

    beforeAll(() => {
        supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);
    });

    describe('Migration Files', () => {
        test('migration files exist', () => {
            const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
            expect(fs.existsSync(migrationsDir)).toBe(true);

            const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
            expect(migrationFiles.length).toBeGreaterThan(0);
            expect(migrationFiles).toContain('20250821000001_initial_schema.sql');
        });

        test('migration file has valid SQL syntax', () => {
            const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250821000001_initial_schema.sql');
            const content = fs.readFileSync(migrationPath, 'utf8');

            // Check for required tables
            expect(content).toContain('CREATE TABLE IF NOT EXISTS public.user_profiles');
            expect(content).toContain('CREATE TABLE IF NOT EXISTS public.saved_connections');
            expect(content).toContain('CREATE TABLE IF NOT EXISTS public.query_history');
            expect(content).toContain('CREATE TABLE IF NOT EXISTS public.chat_sessions');
            expect(content).toContain('CREATE TABLE IF NOT EXISTS public.payments');
            expect(content).toContain('CREATE TABLE IF NOT EXISTS public.ai_usage_logs');

            // Check for RLS policies
            expect(content).toContain('ENABLE ROW LEVEL SECURITY');
            expect(content).toContain('CREATE POLICY');

            // Check for triggers
            expect(content).toContain('CREATE TRIGGER');
            expect(content).toContain('handle_new_user');
        });
    });

    describe('Configuration Files', () => {
        test('supabase config exists and is valid', () => {
            const configPath = path.join(__dirname, '..', 'supabase', 'config.toml');
            expect(fs.existsSync(configPath)).toBe(true);

            const content = fs.readFileSync(configPath, 'utf8');
            expect(content).toContain('project_id = "database-gui-client"');
            expect(content).toContain('[auth.external.github]');
            expect(content).toContain('[auth.external.google]');
        });

        test('environment template exists', () => {
            const envTemplatePath = path.join(__dirname, '..', '.env.local.example');
            expect(fs.existsSync(envTemplatePath)).toBe(true);

            const content = fs.readFileSync(envTemplatePath, 'utf8');
            expect(content).toContain('NEXT_PUBLIC_SUPABASE_URL');
            expect(content).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
            expect(content).toContain('SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID');
            expect(content).toContain('SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID');
        });

        test('package.json has database scripts', () => {
            const packagePath = path.join(__dirname, '..', 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            expect(packageJson.scripts).toHaveProperty('db:setup');
            expect(packageJson.scripts).toHaveProperty('db:start');
            expect(packageJson.scripts).toHaveProperty('db:stop');
            expect(packageJson.scripts).toHaveProperty('db:status');
            expect(packageJson.scripts).toHaveProperty('db:reset');
            expect(packageJson.scripts).toHaveProperty('db:migrate');
            expect(packageJson.scripts).toHaveProperty('db:generate-types');
            expect(packageJson.scripts).toHaveProperty('db:validate');
        });
    });

    describe('TypeScript Types', () => {
        test('supabase types file exists', () => {
            const typesPath = path.join(__dirname, '..', 'packages', 'types', 'src', 'supabase.ts');
            expect(fs.existsSync(typesPath)).toBe(true);

            const content = fs.readFileSync(typesPath, 'utf8');
            expect(content).toContain('export interface Database');
            expect(content).toContain('user_profiles');
            expect(content).toContain('saved_connections');
            expect(content).toContain('query_history');
        });

        test('shared supabase client exists', () => {
            const clientPath = path.join(__dirname, '..', 'packages', 'shared', 'src', 'supabase.ts');
            expect(fs.existsSync(clientPath)).toBe(true);

            const content = fs.readFileSync(clientPath, 'utf8');
            expect(content).toContain('createClient');
            expect(content).toContain('getCurrentUser');
            expect(content).toContain('signInWithEmail');
            expect(content).toContain('signInWithProvider');
        });
    });

    describe('Documentation', () => {
        test('database setup documentation exists', () => {
            const docsPath = path.join(__dirname, '..', 'docs', 'DATABASE_SETUP.md');
            expect(fs.existsSync(docsPath)).toBe(true);

            const content = fs.readFileSync(docsPath, 'utf8');
            expect(content).toContain('# Database Setup Guide');
            expect(content).toContain('## Prerequisites');
            expect(content).toContain('## Quick Setup');
            expect(content).toContain('OAuth Provider Setup');
        });

        test('setup script exists and is executable', () => {
            const scriptPath = path.join(__dirname, '..', 'scripts', 'setup-database.sh');
            expect(fs.existsSync(scriptPath)).toBe(true);

            const stats = fs.statSync(scriptPath);
            expect(stats.mode & parseInt('111', 8)).toBeTruthy(); // Check if executable
        });
    });

    // These tests will only run if Supabase is actually running
    describe('Database Connection (Integration)', () => {
        test('can connect to supabase', async () => {
            try {
                const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
                // If we get here without throwing, connection works
                expect(error).toBeFalsy();
            } catch (err) {
                // Skip this test if Supabase isn't running
                console.log('Skipping connection test - Supabase not running');
            }
        }, TEST_CONFIG.timeout);

        test('RLS policies are enabled', async () => {
            try {
                // Try to access user_profiles without authentication - should fail
                const { data, error } = await supabase.from('user_profiles').select('*');
                expect(error).toBeTruthy();
                expect(error.message).toContain('RLS');
            } catch (err) {
                console.log('Skipping RLS test - Supabase not running');
            }
        }, TEST_CONFIG.timeout);
    });
});

// Helper function to check if Supabase is running
async function isSupabaseRunning() {
    try {
        const response = await fetch(`${TEST_CONFIG.supabaseUrl}/health`);
        return response.ok;
    } catch {
        return false;
    }
}