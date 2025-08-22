// Database schema service tests

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
                    toArray: vi.fn().mockResolvedValue([{ _id: '1', name: 'test', age: 25 }])
                }),
                countDocuments: vi.fn().mockResolvedValue(1),
                aggregate: () => ({
                    toArray: vi.fn().mockResolvedValue([{ count: 1 }])
                }),
                indexes: vi.fn().mockResolvedValue([
                    { name: '_id_', key: { _id: 1 }, unique: true }
                ])
            })
        })
    }))
}));

vi.mock('mysql2/promise', () => ({
    default: {
        createConnection: vi.fn().mockResolvedValue({
            execute: vi.fn().mockImplementation((query) => {
                if (query.includes('information_schema.COLUMNS')) {
                    return [[
                        {
                            COLUMN_NAME: 'id',
                            DATA_TYPE: 'int',
                            IS_NULLABLE: 'NO',
                            COLUMN_KEY: 'PRI',
                            COLUMN_DEFAULT: null,
                            EXTRA: 'auto_increment',
                            CHARACTER_MAXIMUM_LENGTH: null,
                            NUMERIC_PRECISION: 10,
                            NUMERIC_SCALE: 0,
                            COLUMN_COMMENT: 'Primary key',
                            COLLATION_NAME: null,
                            CHARACTER_SET_NAME: null
                        },
                        {
                            COLUMN_NAME: 'name',
                            DATA_TYPE: 'varchar',
                            IS_NULLABLE: 'YES',
                            COLUMN_KEY: '',
                            COLUMN_DEFAULT: null,
                            EXTRA: '',
                            CHARACTER_MAXIMUM_LENGTH: 255,
                            NUMERIC_PRECISION: null,
                            NUMERIC_SCALE: null,
                            COLUMN_COMMENT: 'User name',
                            COLLATION_NAME: 'utf8mb4_unicode_ci',
                            CHARACTER_SET_NAME: 'utf8mb4'
                        }
                    ], []];
                } else if (query.includes('information_schema.STATISTICS')) {
                    return [[
                        {
                            INDEX_NAME: 'PRIMARY',
                            COLUMN_NAME: 'id',
                            NON_UNIQUE: 0,
                            INDEX_TYPE: 'BTREE',
                            INDEX_COMMENT: ''
                        }
                    ], []];
                } else if (query.includes('information_schema.KEY_COLUMN_USAGE')) {
                    return [[], []];
                } else if (query.includes('information_schema.TABLES')) {
                    return [[
                        {
                            TABLE_NAME: 'users',
                            TABLE_TYPE: 'BASE TABLE',
                            TABLE_COMMENT: 'User table'
                        }
                    ], []];
                } else {
                    return [[{ id: 1, name: 'test' }], [{ name: 'id', type: 'int' }]];
                }
            }),
            ping: vi.fn().mockResolvedValue(undefined),
            end: vi.fn().mockResolvedValue(undefined)
        })
    }
}));

vi.mock('pg', () => ({
    Client: vi.fn().mockImplementation(() => ({
        connect: vi.fn().mockResolvedValue(undefined),
        end: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockImplementation((query) => {
            if (query.includes('information_schema.columns')) {
                return {
                    rows: [
                        {
                            column_name: 'id',
                            data_type: 'integer',
                            is_nullable: 'NO',
                            column_default: 'nextval(\'users_id_seq\'::regclass)',
                            character_maximum_length: null,
                            numeric_precision: 32,
                            numeric_scale: 0
                        },
                        {
                            column_name: 'name',
                            data_type: 'character varying',
                            is_nullable: 'YES',
                            column_default: null,
                            character_maximum_length: 255,
                            numeric_precision: null,
                            numeric_scale: null
                        }
                    ],
                    fields: [{ name: 'column_name', dataTypeID: 25 }],
                    rowCount: 2
                };
            } else if (query.includes('information_schema.tables')) {
                return {
                    rows: [
                        {
                            table_name: 'users',
                            table_type: 'BASE TABLE'
                        }
                    ],
                    fields: [{ name: 'table_name', dataTypeID: 25 }],
                    rowCount: 1
                };
            } else {
                return {
                    rows: [{ id: 1, name: 'test' }],
                    fields: [{ name: 'id', dataTypeID: 23 }],
                    rowCount: 1
                };
            }
        })
    }))
}));

vi.mock('sqlite3', () => ({
    Database: vi.fn().mockImplementation((path, mode, callback) => {
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



                if (sql.includes('PRAGMA table_info') || sql.includes('table_info')) {
                    callback(null, [
                        { cid: 0, name: 'id', type: 'INTEGER', notnull: 1, dflt_value: null, pk: 1 },
                        { cid: 1, name: 'name', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 }
                    ]);
                } else if (sql.includes('PRAGMA index_list')) {
                    callback(null, [
                        { seq: 0, name: 'sqlite_autoindex_users_1', unique: 1, origin: 'pk', partial: 0 }
                    ]);
                } else if (sql.includes('PRAGMA index_info')) {
                    callback(null, [
                        { seqno: 0, cid: 0, name: 'id' }
                    ]);
                } else if (sql.includes('sqlite_master')) {
                    callback(null, [
                        { name: 'users', type: 'table' }
                    ]);
                } else {
                    callback(null, [{ id: 1, name: 'test' }]);
                }
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
    DatabaseSchemaService,
    type DatabaseSchema,
    type TableSchema,
    type ColumnSchema
} from '../database-schema-service';
import { DatabaseConnectionService } from '../database-connection-service';
import type {
    MongoConnectionConfig,
    MySQLConnectionConfig,
    PostgreSQLConnectionConfig,
    SQLiteConnectionConfig
} from '@database-gui/types';

describe('DatabaseSchemaService', () => {
    let connectionService: DatabaseConnectionService;
    let schemaService: DatabaseSchemaService;

    beforeEach(() => {
        connectionService = new DatabaseConnectionService();
        schemaService = new DatabaseSchemaService(connectionService, {
            cacheEnabled: true,
            defaultCacheTTL: 5000, // 5 seconds for testing
            maxCacheSize: 10
        });
    });

    afterEach(async () => {
        await connectionService.disconnectAll();
        schemaService.destroy();
    });

    describe('MongoDB Schema', () => {
        it('should fetch MongoDB schema successfully', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-schema', config);
            const schema = await schemaService.getSchema('mongo-schema');

            expect(schema.databaseType).toBe('mongodb');
            expect(schema.databaseName).toBe('test');
            expect(schema.tables).toHaveLength(1);
            expect(schema.tables[0].name).toBe('users');
            expect(schema.tables[0].type).toBe('collection');
            expect(schema.tables[0].columns).toHaveLength(3); // _id, name, age
            expect(schema.lastUpdated).toBeInstanceOf(Date);
        });

        it('should infer MongoDB column types correctly', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-columns', config);
            const schema = await schemaService.getSchema('mongo-columns');

            const table = schema.tables[0];
            const idColumn = table.columns.find(col => col.name === '_id');
            const nameColumn = table.columns.find(col => col.name === 'name');
            const ageColumn = table.columns.find(col => col.name === 'age');

            expect(idColumn?.primaryKey).toBe(true);
            expect(nameColumn?.type).toBe('string');
            expect(ageColumn?.type).toBe('int');
        });
    });

    describe('MySQL Schema', () => {
        it('should fetch MySQL schema successfully', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-schema', config);
            const schema = await schemaService.getSchema('mysql-schema');

            expect(schema.databaseType).toBe('mysql');
            expect(schema.databaseName).toBe('test');
            expect(schema.tables).toHaveLength(1);
            expect(schema.lastUpdated).toBeInstanceOf(Date);
        });

        it('should fetch MySQL column details correctly', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-columns', config);
            const columns = await schemaService.getTableColumns('mysql-columns', 'users');

            expect(columns).toHaveLength(2);

            const idColumn = columns.find(col => col.name === 'id');
            const nameColumn = columns.find(col => col.name === 'name');

            expect(idColumn?.type).toBe('int');
            expect(idColumn?.primaryKey).toBe(true);
            expect(idColumn?.autoIncrement).toBe(true);
            expect(idColumn?.nullable).toBe(false);
            expect(idColumn?.comment).toBe('Primary key');

            expect(nameColumn?.type).toBe('varchar');
            expect(nameColumn?.nullable).toBe(true);
            expect(nameColumn?.length).toBe(255);
            expect(nameColumn?.charset).toBe('utf8mb4');
        });

        it('should fetch MySQL indexes correctly', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-indexes', config);
            const indexes = await schemaService.getTableIndexes('mysql-indexes', 'users');

            expect(indexes).toHaveLength(1);
            expect(indexes[0].name).toBe('PRIMARY');
            expect(indexes[0].unique).toBe(true);
            expect(indexes[0].columns).toContain('id');
            expect(indexes[0].type).toBe('btree');
        });
    });

    describe('PostgreSQL Schema', () => {
        it('should fetch PostgreSQL schema successfully', async () => {
            const config: PostgreSQLConnectionConfig = {
                type: 'postgresql',
                host: 'localhost',
                port: 5432,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('pg-schema', config);
            const schema = await schemaService.getSchema('pg-schema');

            expect(schema.databaseType).toBe('postgresql');
            expect(schema.databaseName).toBe('test');
            expect(schema.tables).toHaveLength(1);
            expect(schema.lastUpdated).toBeInstanceOf(Date);
        });

        it('should fetch PostgreSQL column details correctly', async () => {
            const config: PostgreSQLConnectionConfig = {
                type: 'postgresql',
                host: 'localhost',
                port: 5432,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('pg-columns', config);
            const columns = await schemaService.getTableColumns('pg-columns', 'users');

            expect(columns).toHaveLength(2);

            const idColumn = columns.find(col => col.name === 'id');
            const nameColumn = columns.find(col => col.name === 'name');

            expect(idColumn?.type).toBe('integer');
            expect(idColumn?.nullable).toBe(false);
            expect(idColumn?.precision).toBe(32);

            expect(nameColumn?.type).toBe('character varying');
            expect(nameColumn?.nullable).toBe(true);
            expect(nameColumn?.length).toBe(255);
        });
    });

    describe('SQLite Schema', () => {
        it('should fetch SQLite schema successfully', async () => {
            const config: SQLiteConnectionConfig = {
                type: 'sqlite',
                database: 'test',
                filePath: '/tmp/test.db'
            };

            await connectionService.createConnection('sqlite-schema', config);
            const schema = await schemaService.getSchema('sqlite-schema');

            expect(schema.databaseType).toBe('sqlite');
            expect(schema.databaseName).toBe('test');
            expect(schema.tables).toHaveLength(1);
            expect(schema.lastUpdated).toBeInstanceOf(Date);
        });

        it('should fetch SQLite column details correctly', async () => {
            const config: SQLiteConnectionConfig = {
                type: 'sqlite',
                database: 'test',
                filePath: '/tmp/test.db'
            };

            await connectionService.createConnection('sqlite-columns', config);
            const columns = await schemaService.getTableColumns('sqlite-columns', 'users');

            expect(columns).toHaveLength(2);

            const idColumn = columns.find(col => col.name === 'id');
            const nameColumn = columns.find(col => col.name === 'name');

            expect(idColumn?.type).toBe('INTEGER');
            expect(idColumn?.primaryKey).toBe(true);
            expect(idColumn?.nullable).toBe(false);

            expect(nameColumn?.type).toBe('TEXT');
            expect(nameColumn?.nullable).toBe(true);
        });

        it('should fetch SQLite indexes correctly', async () => {
            const config: SQLiteConnectionConfig = {
                type: 'sqlite',
                database: 'test',
                filePath: '/tmp/test.db'
            };

            await connectionService.createConnection('sqlite-indexes', config);
            const indexes = await schemaService.getTableIndexes('sqlite-indexes', 'users');

            expect(indexes).toHaveLength(1);
            expect(indexes[0].name).toBe('sqlite_autoindex_users_1');
            expect(indexes[0].unique).toBe(true);
            expect(indexes[0].columns).toContain('id');
        });
    });

    describe('Caching', () => {
        it('should cache schema results', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-cache', config);

            // First call should fetch from database
            const schema1 = await schemaService.getSchema('mongo-cache');

            // Second call should return cached result
            const schema2 = await schemaService.getSchema('mongo-cache');

            expect(schema1).toBe(schema2); // Same object reference indicates cache hit
        });

        it('should force refresh when requested', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-refresh', config);

            const schema1 = await schemaService.getSchema('mongo-refresh');
            const schema2 = await schemaService.getSchema('mongo-refresh', true); // Force refresh

            expect(schema1).not.toBe(schema2); // Different objects indicate fresh fetch
        });

        it('should clear cache correctly', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-clear', config);

            await schemaService.getSchema('mongo-clear');

            let stats = schemaService.getCacheStats();
            expect(stats.size).toBe(1);

            schemaService.clearCache('mongo-clear');

            stats = schemaService.getCacheStats();
            expect(stats.size).toBe(0);
        });

        it('should clear all cache when no connection specified', async () => {
            const config1: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test1'
            };

            const config2: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test2'
            };

            await connectionService.createConnection('mongo-clear-1', config1);
            await connectionService.createConnection('mongo-clear-2', config2);

            await schemaService.getSchema('mongo-clear-1');
            await schemaService.getSchema('mongo-clear-2');

            let stats = schemaService.getCacheStats();
            expect(stats.size).toBe(2);

            schemaService.clearCache(); // Clear all

            stats = schemaService.getCacheStats();
            expect(stats.size).toBe(0);
        });
    });

    describe('Search functionality', () => {
        it('should search tables by name', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-search', config);

            const results = await schemaService.searchTables('mongo-search', 'user');

            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('users');
        });

        it('should search columns by name', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-search-cols', config);

            const results = await schemaService.searchColumns('mongo-search-cols', 'name');

            expect(results).toHaveLength(1);
            expect(results[0].table).toBe('users');
            expect(results[0].column.name).toBe('name');
        });
    });

    describe('Error handling', () => {
        it('should handle non-existent connection', async () => {
            await expect(schemaService.getSchema('non-existent')).rejects.toThrow('Connection non-existent not found');
        });

        it('should return null for non-existent table', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-no-table', config);

            const table = await schemaService.getTableSchema('mongo-no-table', 'non_existent');
            expect(table).toBeNull();
        });

        it('should return empty array for columns of non-existent table', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-no-cols', config);

            const columns = await schemaService.getTableColumns('mongo-no-cols', 'non_existent');
            expect(columns).toEqual([]);
        });
    });

    describe('Service configuration', () => {
        it('should respect cache configuration', () => {
            const customService = new DatabaseSchemaService(connectionService, {
                cacheEnabled: false,
                maxCacheSize: 5
            });

            const stats = customService.getCacheStats();
            expect(stats.maxSize).toBe(5);

            customService.destroy();
        });

        it('should provide cache statistics', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-stats', config);
            await schemaService.getSchema('mongo-stats');

            const stats = schemaService.getCacheStats();
            expect(stats).toHaveProperty('size');
            expect(stats).toHaveProperty('maxSize');
            expect(stats.size).toBe(1);
        });
    });
});