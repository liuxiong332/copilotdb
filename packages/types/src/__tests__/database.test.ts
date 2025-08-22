import { describe, it, expect } from 'vitest';
import type { 
    DatabaseConnection, 
    ConnectionConfig, 
    DatabaseInfo, 
    DatabaseType,
    DatabaseSpecificOptions 
} from '../database';

describe('Database Types', () => {
    describe('DatabaseConnection', () => {
        it('should have all required properties', () => {
            const connection: DatabaseConnection = {
                id: 'test-connection',
                type: 'mysql',
                config: {
                    host: 'localhost',
                    port: 3306,
                    database: 'testdb',
                    username: 'user',
                    password: 'pass'
                },
                status: 'connected',
                lastConnected: new Date()
            };

            expect(connection.id).toBe('test-connection');
            expect(connection.type).toBe('mysql');
            expect(connection.status).toBe('connected');
            expect(connection.config).toBeDefined();
            expect(connection.lastConnected).toBeInstanceOf(Date);
        });

        it('should support optional metadata', () => {
            const connection: DatabaseConnection = {
                id: 'test-connection',
                type: 'postgresql',
                config: { database: 'testdb' },
                status: 'connected',
                metadata: {
                    version: '14.5',
                    serverInfo: { encoding: 'UTF8' },
                    capabilities: ['transactions', 'json']
                }
            };

            expect(connection.metadata?.version).toBe('14.5');
            expect(connection.metadata?.capabilities).toContain('transactions');
        });

        it('should support error status with error message', () => {
            const connection: DatabaseConnection = {
                id: 'failed-connection',
                type: 'mongodb',
                config: { database: 'testdb' },
                status: 'error',
                error: 'Connection timeout'
            };

            expect(connection.status).toBe('error');
            expect(connection.error).toBe('Connection timeout');
        });
    });

    describe('ConnectionConfig', () => {
        it('should support basic connection parameters', () => {
            const config: ConnectionConfig = {
                host: 'localhost',
                port: 5432,
                database: 'mydb',
                username: 'admin',
                password: 'secret',
                ssl: true
            };

            expect(config.host).toBe('localhost');
            expect(config.port).toBe(5432);
            expect(config.ssl).toBe(true);
        });

        it('should support SQLite file path', () => {
            const config: ConnectionConfig = {
                database: 'mydb',
                filePath: '/path/to/database.db'
            };

            expect(config.filePath).toBe('/path/to/database.db');
        });

        it('should support connection string', () => {
            const config: ConnectionConfig = {
                database: 'mydb',
                connectionString: 'postgresql://user:pass@localhost:5432/mydb'
            };

            expect(config.connectionString).toBe('postgresql://user:pass@localhost:5432/mydb');
        });

        it('should support pool settings', () => {
            const config: ConnectionConfig = {
                database: 'mydb',
                poolSize: 10,
                timeout: 30000,
                retryAttempts: 3
            };

            expect(config.poolSize).toBe(10);
            expect(config.timeout).toBe(30000);
            expect(config.retryAttempts).toBe(3);
        });
    });

    describe('DatabaseSpecificOptions', () => {
        it('should support MongoDB options', () => {
            const options: DatabaseSpecificOptions = {
                authSource: 'admin',
                replicaSet: 'rs0',
                readPreference: 'secondary'
            };

            expect(options.authSource).toBe('admin');
            expect(options.replicaSet).toBe('rs0');
            expect(options.readPreference).toBe('secondary');
        });

        it('should support MySQL options', () => {
            const options: DatabaseSpecificOptions = {
                charset: 'utf8mb4',
                timezone: '+00:00',
                acquireTimeout: 60000
            };

            expect(options.charset).toBe('utf8mb4');
            expect(options.timezone).toBe('+00:00');
            expect(options.acquireTimeout).toBe(60000);
        });

        it('should support PostgreSQL options', () => {
            const options: DatabaseSpecificOptions = {
                schema: 'public',
                applicationName: 'MyApp'
            };

            expect(options.schema).toBe('public');
            expect(options.applicationName).toBe('MyApp');
        });

        it('should support SQLite options', () => {
            const options: DatabaseSpecificOptions = {
                mode: 'rw',
                cache: 'shared'
            };

            expect(options.mode).toBe('rw');
            expect(options.cache).toBe('shared');
        });

        it('should support generic options', () => {
            const options: DatabaseSpecificOptions = {
                customOption: 'value',
                anotherOption: 123
            };

            expect(options.customOption).toBe('value');
            expect(options.anotherOption).toBe(123);
        });
    });

    describe('DatabaseInfo', () => {
        it('should have required properties', () => {
            const info: DatabaseInfo = {
                name: 'testdb',
                type: 'mysql'
            };

            expect(info.name).toBe('testdb');
            expect(info.type).toBe('mysql');
        });

        it('should support optional metadata', () => {
            const info: DatabaseInfo = {
                name: 'testdb',
                type: 'postgresql',
                version: '14.5',
                size: 1024000,
                tables: 15,
                charset: 'UTF8',
                collation: 'en_US.UTF-8'
            };

            expect(info.version).toBe('14.5');
            expect(info.size).toBe(1024000);
            expect(info.tables).toBe(15);
            expect(info.charset).toBe('UTF8');
            expect(info.collation).toBe('en_US.UTF-8');
        });

        it('should support MongoDB collections count', () => {
            const info: DatabaseInfo = {
                name: 'testdb',
                type: 'mongodb',
                collections: 8
            };

            expect(info.collections).toBe(8);
        });
    });

    describe('DatabaseType', () => {
        it('should accept valid database types', () => {
            const types: DatabaseType[] = ['mongodb', 'mysql', 'postgresql', 'sqlite'];
            
            types.forEach(type => {
                expect(['mongodb', 'mysql', 'postgresql', 'sqlite']).toContain(type);
            });
        });
    });
});