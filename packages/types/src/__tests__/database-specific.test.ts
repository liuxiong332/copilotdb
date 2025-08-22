import { describe, it, expect } from 'vitest';
import type {
    MongoConnectionConfig,
    MySQLConnectionConfig,
    PostgreSQLConnectionConfig,
    SQLiteConnectionConfig,
    DatabaseSpecificConnectionConfig,
    DatabaseCapabilities
} from '../database-specific';
import { 
    DATABASE_CAPABILITIES, 
    DEFAULT_PORTS, 
    CONNECTION_STRING_PATTERNS 
} from '../database-specific';

describe('Database Specific Types', () => {
    describe('MongoConnectionConfig', () => {
        it('should have MongoDB specific properties', () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'testdb',
                authSource: 'admin',
                replicaSet: 'rs0',
                readPreference: 'secondary'
            };

            expect(config.type).toBe('mongodb');
            expect(config.authSource).toBe('admin');
            expect(config.replicaSet).toBe('rs0');
            expect(config.readPreference).toBe('secondary');
        });

        it('should support SSL configuration', () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                database: 'testdb',
                ssl: true,
                sslValidate: false,
                sslCA: '/path/to/ca.pem'
            };

            expect(config.ssl).toBe(true);
            expect(config.sslValidate).toBe(false);
            expect(config.sslCA).toBe('/path/to/ca.pem');
        });
    });

    describe('MySQLConnectionConfig', () => {
        it('should have MySQL specific properties', () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'testdb',
                username: 'user',
                password: 'pass',
                charset: 'utf8mb4',
                timezone: '+00:00'
            };

            expect(config.type).toBe('mysql');
            expect(config.charset).toBe('utf8mb4');
            expect(config.timezone).toBe('+00:00');
        });

        it('should support SSL configuration', () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                database: 'testdb',
                ssl: {
                    ca: '/path/to/ca.pem',
                    cert: '/path/to/cert.pem',
                    key: '/path/to/key.pem',
                    rejectUnauthorized: false
                }
            };

            expect(typeof config.ssl).toBe('object');
            expect((config.ssl as any).ca).toBe('/path/to/ca.pem');
        });
    });

    describe('PostgreSQLConnectionConfig', () => {
        it('should have PostgreSQL specific properties', () => {
            const config: PostgreSQLConnectionConfig = {
                type: 'postgresql',
                host: 'localhost',
                port: 5432,
                database: 'testdb',
                username: 'user',
                password: 'pass',
                schema: 'public',
                applicationName: 'MyApp'
            };

            expect(config.type).toBe('postgresql');
            expect(config.schema).toBe('public');
            expect(config.applicationName).toBe('MyApp');
        });

        it('should support timeout configurations', () => {
            const config: PostgreSQLConnectionConfig = {
                type: 'postgresql',
                database: 'testdb',
                statement_timeout: 30000,
                query_timeout: 60000
            };

            expect(config.statement_timeout).toBe(30000);
            expect(config.query_timeout).toBe(60000);
        });
    });

    describe('SQLiteConnectionConfig', () => {
        it('should have SQLite specific properties', () => {
            const config: SQLiteConnectionConfig = {
                type: 'sqlite',
                database: 'testdb',
                filePath: '/path/to/database.db',
                mode: 'rw',
                cache: 'shared'
            };

            expect(config.type).toBe('sqlite');
            expect(config.filePath).toBe('/path/to/database.db');
            expect(config.mode).toBe('rw');
            expect(config.cache).toBe('shared');
        });

        it('should support timeout configurations', () => {
            const config: SQLiteConnectionConfig = {
                type: 'sqlite',
                database: 'testdb',
                filePath: '/path/to/database.db',
                timeout: 5000,
                busyTimeout: 10000
            };

            expect(config.timeout).toBe(5000);
            expect(config.busyTimeout).toBe(10000);
        });
    });

    describe('DatabaseSpecificConnectionConfig Union Type', () => {
        it('should accept all database specific configs', () => {
            const configs: DatabaseSpecificConnectionConfig[] = [
                { type: 'mongodb', database: 'test' },
                { type: 'mysql', database: 'test' },
                { type: 'postgresql', database: 'test' },
                { type: 'sqlite', database: 'test', filePath: '/test.db' }
            ];

            configs.forEach(config => {
                expect(['mongodb', 'mysql', 'postgresql', 'sqlite']).toContain(config.type);
            });
        });
    });

    describe('DATABASE_CAPABILITIES', () => {
        it('should have capabilities for all database types', () => {
            expect(DATABASE_CAPABILITIES.mongodb).toBeDefined();
            expect(DATABASE_CAPABILITIES.mysql).toBeDefined();
            expect(DATABASE_CAPABILITIES.postgresql).toBeDefined();
            expect(DATABASE_CAPABILITIES.sqlite).toBeDefined();
        });

        it('should have correct MongoDB capabilities', () => {
            const capabilities = DATABASE_CAPABILITIES.mongodb;
            expect(capabilities.supportsTransactions).toBe(true);
            expect(capabilities.supportsJoins).toBe(true);
            expect(capabilities.supportsJSON).toBe(true);
            expect(capabilities.supportsArrays).toBe(true);
            expect(capabilities.supportsStoredProcedures).toBe(false);
        });

        it('should have correct MySQL capabilities', () => {
            const capabilities = DATABASE_CAPABILITIES.mysql;
            expect(capabilities.supportsTransactions).toBe(true);
            expect(capabilities.supportsJoins).toBe(true);
            expect(capabilities.supportsStoredProcedures).toBe(true);
            expect(capabilities.supportsArrays).toBe(false);
            expect(capabilities.maxConnections).toBe(151);
        });

        it('should have correct PostgreSQL capabilities', () => {
            const capabilities = DATABASE_CAPABILITIES.postgresql;
            expect(capabilities.supportsTransactions).toBe(true);
            expect(capabilities.supportsJoins).toBe(true);
            expect(capabilities.supportsJSON).toBe(true);
            expect(capabilities.supportsArrays).toBe(true);
            expect(capabilities.supportsStoredProcedures).toBe(true);
        });

        it('should have correct SQLite capabilities', () => {
            const capabilities = DATABASE_CAPABILITIES.sqlite;
            expect(capabilities.supportsTransactions).toBe(true);
            expect(capabilities.supportsJoins).toBe(true);
            expect(capabilities.supportsStoredProcedures).toBe(false);
            expect(capabilities.supportsArrays).toBe(false);
            expect(capabilities.maxConnections).toBe(1);
        });
    });

    describe('DEFAULT_PORTS', () => {
        it('should have correct default ports', () => {
            expect(DEFAULT_PORTS.mongodb).toBe(27017);
            expect(DEFAULT_PORTS.mysql).toBe(3306);
            expect(DEFAULT_PORTS.postgresql).toBe(5432);
            expect(DEFAULT_PORTS.sqlite).toBe(0);
        });
    });

    describe('CONNECTION_STRING_PATTERNS', () => {
        it('should validate MongoDB connection strings', () => {
            const pattern = CONNECTION_STRING_PATTERNS.mongodb;
            expect(pattern.test('mongodb://localhost:27017/test')).toBe(true);
            expect(pattern.test('mongodb+srv://cluster.mongodb.net/test')).toBe(true);
            expect(pattern.test('mysql://localhost:3306/test')).toBe(false);
        });

        it('should validate MySQL connection strings', () => {
            const pattern = CONNECTION_STRING_PATTERNS.mysql;
            expect(pattern.test('mysql://user:pass@localhost:3306/test')).toBe(true);
            expect(pattern.test('postgresql://localhost:5432/test')).toBe(false);
        });

        it('should validate PostgreSQL connection strings', () => {
            const pattern = CONNECTION_STRING_PATTERNS.postgresql;
            expect(pattern.test('postgresql://user:pass@localhost:5432/test')).toBe(true);
            expect(pattern.test('postgres://user:pass@localhost:5432/test')).toBe(true);
            expect(pattern.test('mysql://localhost:3306/test')).toBe(false);
        });

        it('should validate SQLite connection strings', () => {
            const pattern = CONNECTION_STRING_PATTERNS.sqlite;
            expect(pattern.test('sqlite:///path/to/database.db')).toBe(true);
            expect(pattern.test('file:/path/to/database.db')).toBe(true);
            expect(pattern.test('mysql://localhost:3306/test')).toBe(false);
        });
    });
});