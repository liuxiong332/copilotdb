// Database connection service tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock database drivers first
vi.mock('mongodb', () => ({
    MongoClient: vi.fn().mockImplementation(() => ({
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        db: vi.fn().mockReturnValue({
            admin: () => ({
                ping: vi.fn().mockResolvedValue({}),
                listDatabases: vi.fn().mockResolvedValue({ databases: [{ name: 'test' }] })
            }),
            listCollections: () => ({
                toArray: vi.fn().mockResolvedValue([{ name: 'users' }])
            }),
            collection: () => ({
                find: () => ({
                    limit: vi.fn().mockReturnThis(),
                    skip: vi.fn().mockReturnThis(),
                    toArray: vi.fn().mockResolvedValue([{ _id: '1', name: 'test' }])
                }),
                countDocuments: vi.fn().mockResolvedValue(1),
                aggregate: () => ({
                    toArray: vi.fn().mockResolvedValue([{ count: 1 }])
                }),
                indexes: vi.fn().mockResolvedValue([])
            })
        })
    }))
}));

vi.mock('mysql2/promise', () => ({
    default: {
        createConnection: vi.fn().mockResolvedValue({
            execute: vi.fn().mockResolvedValue([
                [{ id: 1, name: 'test' }],
                [{ name: 'id', type: 'int' }]
            ]),
            ping: vi.fn().mockResolvedValue(undefined),
            end: vi.fn().mockResolvedValue(undefined)
        })
    }
}));

vi.mock('pg', () => ({
    Client: vi.fn().mockImplementation(() => ({
        connect: vi.fn().mockResolvedValue(undefined),
        end: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue({
            rows: [{ id: 1, name: 'test' }],
            fields: [{ name: 'id', dataTypeID: 23 }],
            rowCount: 1
        })
    }))
}));

vi.mock('sqlite3', () => ({
    Database: vi.fn().mockImplementation((path, mode, callback) => {
        // Call callback asynchronously to simulate real behavior
        setTimeout(() => callback(null), 0);
        return {
            run: vi.fn().mockImplementation((sql, params, callback) => {
                if (typeof params === 'function') {
                    callback = params;
                    params = [];
                }
                callback.call({ changes: 1, lastID: 1 }, null);
            }),
            all: vi.fn().mockImplementation((sql, params, callback) => {
                if (typeof params === 'function') {
                    callback = params;
                    params = [];
                }
                callback(null, [{ id: 1, name: 'test' }]);
            }),
            close: vi.fn().mockImplementation((callback) => {
                callback(null);
            })
        };
    }),
    OPEN_READONLY: 1,
    OPEN_READWRITE: 2,
    OPEN_CREATE: 4
}));

import {
    DatabaseConnectionService,
    createDatabaseClient,
    MongoDBClient,
    MySQLClient,
    PostgreSQLClient,
    SQLiteClient
} from '../database-connection-service';
import type {
    DatabaseSpecificConnectionConfig,
    MongoConnectionConfig,
    MySQLConnectionConfig,
    PostgreSQLConnectionConfig,
    SQLiteConnectionConfig,
    QueryRequest
} from '@database-gui/types';

describe('DatabaseConnectionService', () => {
    let service: DatabaseConnectionService;

    beforeEach(() => {
        service = new DatabaseConnectionService();
    });

    afterEach(async () => {
        await service.disconnectAll();
    });

    describe('createConnection', () => {
        it('should create a MongoDB connection successfully', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            const connection = await service.createConnection('mongo-1', config);

            expect(connection.status).toBe('connected');
            expect(connection.type).toBe('mongodb');
            expect(connection.id).toBe('mongo-1');
        });

        it('should create a MySQL connection successfully', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            const connection = await service.createConnection('mysql-1', config);

            expect(connection.status).toBe('connected');
            expect(connection.type).toBe('mysql');
            expect(connection.id).toBe('mysql-1');
        });

        it('should create a PostgreSQL connection successfully', async () => {
            const config: PostgreSQLConnectionConfig = {
                type: 'postgresql',
                host: 'localhost',
                port: 5432,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            const connection = await service.createConnection('pg-1', config);

            expect(connection.status).toBe('connected');
            expect(connection.type).toBe('postgresql');
            expect(connection.id).toBe('pg-1');
        });

        it('should create a SQLite connection successfully', async () => {
            const config: SQLiteConnectionConfig = {
                type: 'sqlite',
                database: 'test',
                filePath: '/tmp/test.db'
            };

            const connection = await service.createConnection('sqlite-1', config);

            expect(connection.status).toBe('connected');
            expect(connection.type).toBe('sqlite');
            expect(connection.id).toBe('sqlite-1');
        });
    });

    describe('testConnection', () => {
        it('should test MongoDB connection successfully', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            const result = await service.testConnection(config);
            expect(result).toBe(true);
        });
    });

    describe('executeQuery', () => {
        it('should execute MongoDB query successfully', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await service.createConnection('mongo-query', config);

            const request: QueryRequest = {
                connectionId: 'mongo-query',
                query: 'users.find({})'
            };

            const result = await service.executeQuery('mongo-query', request);

            expect(result.error).toBeUndefined();
            expect(result.data).toHaveLength(1);
            expect(result.totalRows).toBe(1);
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should execute MySQL query successfully', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await service.createConnection('mysql-query', config);

            const request: QueryRequest = {
                connectionId: 'mysql-query',
                query: 'SELECT * FROM users'
            };

            const result = await service.executeQuery('mysql-query', request);

            expect(result.error).toBeUndefined();
            expect(result.data).toHaveLength(1);
            expect(result.totalRows).toBe(1);
        });

        it('should handle query execution for non-existent connection', async () => {
            const request: QueryRequest = {
                connectionId: 'non-existent',
                query: 'SELECT 1'
            };

            const result = await service.executeQuery('non-existent', request);

            expect(result.error).toContain('Connection non-existent not found');
            expect(result.data).toHaveLength(0);
        });
    });

    describe('getSchema', () => {
        it('should get MongoDB schema successfully', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await service.createConnection('mongo-schema', config);
            const schema = await service.getSchema('mongo-schema');

            expect(schema).toHaveProperty('database', 'test');
            expect(schema).toHaveProperty('collections');
            expect(schema.collections).toHaveLength(1);
        });

        it('should get MySQL schema successfully', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await service.createConnection('mysql-schema', config);
            const schema = await service.getSchema('mysql-schema');

            expect(schema).toHaveProperty('database', 'test');
            expect(schema).toHaveProperty('tables');
        });
    });

    describe('connection management', () => {
        it('should track active connections', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await service.createConnection('mongo-track', config);
            const activeConnections = service.getActiveConnections();

            expect(activeConnections).toContain('mongo-track');
            expect(activeConnections).toHaveLength(1);
        });

        it('should disconnect specific connection', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await service.createConnection('mongo-disconnect', config);
            expect(service.getActiveConnections()).toContain('mongo-disconnect');

            await service.disconnect('mongo-disconnect');
            expect(service.getActiveConnections()).not.toContain('mongo-disconnect');
        });

        it('should disconnect all connections', async () => {
            const config1: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test1'
            };

            const config2: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test2',
                username: 'user',
                password: 'pass'
            };

            await service.createConnection('mongo-all', config1);
            await service.createConnection('mysql-all', config2);

            expect(service.getActiveConnections()).toHaveLength(2);

            await service.disconnectAll();
            expect(service.getActiveConnections()).toHaveLength(0);
        });

        it('should get connection status', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await service.createConnection('mongo-status', config);
            const status = service.getConnectionStatus('mongo-status');

            expect(status).toBe('connected');
        });

        it('should get connection info', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await service.createConnection('mongo-info', config);
            const info = service.getConnectionInfo('mongo-info');

            expect(info).toHaveProperty('id', 'mongo-info');
            expect(info).toHaveProperty('type', 'mongodb');
            expect(info).toHaveProperty('status', 'connected');
            expect(info).toHaveProperty('connectionTime');
        });

        it('should get pool statistics', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await service.createConnection('mongo-pool', config);
            const stats = service.getPoolStats();

            expect(stats).toHaveProperty('mongodb');
            expect(stats.mongodb.active).toBe(1);
            expect(stats.mongodb.max).toBe(10);
        });

        it('should perform health check on connections', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await service.createConnection('mongo-health', config);
            const healthResults = await service.healthCheck();

            expect(healthResults).toHaveProperty('mongo-health', true);
        });
    });
});

describe('createDatabaseClient', () => {
    it('should create MongoDB client', () => {
        const config: MongoConnectionConfig = {
            type: 'mongodb',
            host: 'localhost',
            port: 27017,
            database: 'test'
        };

        const client = createDatabaseClient('test', config);
        expect(client).toBeInstanceOf(MongoDBClient);
    });

    it('should create MySQL client', () => {
        const config: MySQLConnectionConfig = {
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            database: 'test',
            username: 'user',
            password: 'pass'
        };

        const client = createDatabaseClient('test', config);
        expect(client).toBeInstanceOf(MySQLClient);
    });

    it('should create PostgreSQL client', () => {
        const config: PostgreSQLConnectionConfig = {
            type: 'postgresql',
            host: 'localhost',
            port: 5432,
            database: 'test',
            username: 'user',
            password: 'pass'
        };

        const client = createDatabaseClient('test', config);
        expect(client).toBeInstanceOf(PostgreSQLClient);
    });

    it('should create SQLite client', () => {
        const config: SQLiteConnectionConfig = {
            type: 'sqlite',
            database: 'test',
            filePath: '/tmp/test.db'
        };

        const client = createDatabaseClient('test', config);
        expect(client).toBeInstanceOf(SQLiteClient);
    });

    it('should throw error for unsupported database type', () => {
        const config = {
            type: 'unsupported',
            database: 'test'
        } as any;

        expect(() => createDatabaseClient('test', config)).toThrow('Unsupported database type');
    });
});

describe('Database Client Validation', () => {
    it('should validate MongoDB configuration', async () => {
        const config: MongoConnectionConfig = {
            type: 'mongodb',
            host: 'localhost',
            port: 27017,
            database: '' // Invalid: empty database name
        };

        const client = createDatabaseClient('test', config);
        await expect(client.connect()).rejects.toThrow('Database name is required');
    });

    it('should validate MySQL configuration', async () => {
        const config: MySQLConnectionConfig = {
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            database: '', // Invalid: empty database name
            username: 'user',
            password: 'pass'
        };

        const client = createDatabaseClient('test', config);
        await expect(client.connect()).rejects.toThrow('Database name is required');
    });

    it('should validate SQLite configuration', async () => {
        const config: SQLiteConnectionConfig = {
            type: 'sqlite',
            database: 'test',
            filePath: '' // Invalid: empty file path
        };

        const client = createDatabaseClient('test', config);
        await expect(client.connect()).rejects.toThrow('SQLite file path is required');
    });
});