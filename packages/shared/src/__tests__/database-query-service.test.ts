// Database query service tests

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
                indexes: vi.fn().mockResolvedValue([])
            })
        })
    }))
}));

vi.mock('mysql2/promise', () => ({
    default: {
        createConnection: vi.fn().mockResolvedValue({
            execute: vi.fn().mockImplementation((query) => {
                if (query.includes('EXPLAIN')) {
                    return [[{
                        query_block: {
                            select_id: 1,
                            cost_info: { query_cost: '1.00' }
                        }
                    }], []];
                } else if (query.includes('information_schema.TABLES')) {
                    return [[
                        {
                            TABLE_NAME: 'users',
                            TABLE_TYPE: 'BASE TABLE',
                            TABLE_COMMENT: 'User table'
                        }
                    ], []];
                } else if (query.includes('information_schema.COLUMNS')) {
                    return [[
                        {
                            COLUMN_NAME: 'id',
                            DATA_TYPE: 'int',
                            IS_NULLABLE: 'NO',
                            COLUMN_KEY: 'PRI',
                            COLUMN_DEFAULT: null,
                            EXTRA: 'auto_increment'
                        },
                        {
                            COLUMN_NAME: 'name',
                            DATA_TYPE: 'varchar',
                            IS_NULLABLE: 'YES',
                            COLUMN_KEY: '',
                            COLUMN_DEFAULT: null,
                            EXTRA: ''
                        }
                    ], []];
                } else if (query.includes('information_schema')) {
                    return [[], []];
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
            if (query.includes('EXPLAIN')) {
                return {
                    rows: [{
                        'QUERY PLAN': [{
                            Plan: {
                                Node_Type: 'Seq Scan',
                                Total_Cost: 1.0
                            }
                        }]
                    }],
                    fields: [{ name: 'QUERY PLAN', dataTypeID: 25 }],
                    rowCount: 1
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
            } else if (query.includes('information_schema.columns')) {
                return {
                    rows: [
                        {
                            column_name: 'id',
                            data_type: 'integer',
                            is_nullable: 'NO',
                            column_default: 'nextval(\'users_id_seq\'::regclass)'
                        },
                        {
                            column_name: 'name',
                            data_type: 'character varying',
                            is_nullable: 'YES',
                            column_default: null
                        }
                    ],
                    fields: [{ name: 'column_name', dataTypeID: 25 }],
                    rowCount: 2
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

                if (sql.includes('EXPLAIN QUERY PLAN')) {
                    callback(null, [
                        { id: 0, parent: 0, notused: 0, detail: 'SCAN TABLE users' }
                    ]);
                } else if (sql.includes('sqlite_master')) {
                    callback(null, [
                        { name: 'users', type: 'table' }
                    ]);
                } else if (sql.includes('PRAGMA table_info') || sql.includes('table_info')) {
                    callback(null, [
                        { cid: 0, name: 'id', type: 'INTEGER', notnull: 1, dflt_value: null, pk: 1 },
                        { cid: 1, name: 'name', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 }
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
    DatabaseQueryService,
    type QueryServiceConfig,
    type QueryExecutionOptions,
    type QueryPaginationOptions
} from '../database-query-service';
import { DatabaseConnectionService } from '../database-connection-service';
import { DatabaseSchemaService } from '../database-schema-service';
import type {
    MongoConnectionConfig,
    MySQLConnectionConfig,
    PostgreSQLConnectionConfig,
    SQLiteConnectionConfig
} from '@database-gui/types';

describe('DatabaseQueryService', () => {
    let connectionService: DatabaseConnectionService;
    let schemaService: DatabaseSchemaService;
    let queryService: DatabaseQueryService;

    beforeEach(() => {
        connectionService = new DatabaseConnectionService();
        schemaService = new DatabaseSchemaService(connectionService);
        queryService = new DatabaseQueryService(connectionService, schemaService, {
            enableValidation: true,
            defaultLimit: 100,
            maxLimit: 1000,
            queryTimeout: 5000
        });
    });

    afterEach(async () => {
        await connectionService.disconnectAll();
        schemaService.destroy();
        queryService.destroy();
    });

    describe('Query Execution', () => {
        it('should execute MySQL query successfully', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-query', config);

            const result = await queryService.executeQuery(
                'mysql-query',
                'SELECT * FROM users'
            );

            expect(result.error).toBeUndefined();
            expect(result.data).toHaveLength(1);
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should execute PostgreSQL query successfully', async () => {
            const config: PostgreSQLConnectionConfig = {
                type: 'postgresql',
                host: 'localhost',
                port: 5432,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('pg-query', config);

            const result = await queryService.executeQuery(
                'pg-query',
                'SELECT * FROM users'
            );

            expect(result.error).toBeUndefined();
            expect(result.data).toHaveLength(1);
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should execute SQLite query successfully', async () => {
            const config: SQLiteConnectionConfig = {
                type: 'sqlite',
                database: 'test',
                filePath: '/tmp/test.db'
            };

            await connectionService.createConnection('sqlite-query', config);

            const result = await queryService.executeQuery(
                'sqlite-query',
                'SELECT * FROM users'
            );

            expect(result.error).toBeUndefined();
            expect(result.data).toHaveLength(1);
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should execute MongoDB query successfully', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-query', config);

            const result = await queryService.executeQuery(
                'mongo-query',
                'users.find({})'
            );

            expect(result.error).toBeUndefined();
            expect(result.data).toHaveLength(1);
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should handle query with parameters', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-params', config);

            const result = await queryService.executeQuery(
                'mysql-params',
                'SELECT * FROM users WHERE id = ?',
                [1]
            );

            expect(result.error).toBeUndefined();
            expect(result.data).toHaveLength(1);
        });

        it('should apply default limit to queries', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-limit', config);

            // Mock the connection service to capture the actual query
            const originalExecuteQuery = connectionService.executeQuery;
            let capturedQuery = '';

            connectionService.executeQuery = vi.fn().mockImplementation((connectionId, request) => {
                capturedQuery = request.query;
                return originalExecuteQuery.call(connectionService, connectionId, request);
            });

            await queryService.executeQuery('mysql-limit', 'SELECT * FROM users');

            expect(capturedQuery).toContain('LIMIT 100');
        });
    });

    describe('Query Validation', () => {
        it('should validate MySQL queries', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-validate', config);

            const validation = await queryService.validateQuery(
                'mysql-validate',
                'SELECT * FROM nonexistent_table'
            );

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0].message).toContain('does not exist');
        });

        it('should warn about dangerous operations', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-dangerous', config);

            const validation = await queryService.validateQuery(
                'mysql-dangerous',
                'DROP TABLE users'
            );

            expect(validation.warnings).toHaveLength(1);
            expect(validation.warnings[0].message).toContain('dangerous');
        });

        it('should warn about UPDATE/DELETE without WHERE', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-where', config);

            const validation = await queryService.validateQuery(
                'mysql-where',
                'DELETE FROM users'
            );

            expect(validation.warnings.some(w => w.message.includes('WHERE clause'))).toBe(true);
        });

        it('should validate MongoDB queries', async () => {
            const config: MongoConnectionConfig = {
                type: 'mongodb',
                host: 'localhost',
                port: 27017,
                database: 'test'
            };

            await connectionService.createConnection('mongo-validate', config);

            const validation = await queryService.validateQuery(
                'mongo-validate',
                'nonexistent.find({})'
            );

            expect(validation.isValid).toBe(false);
            expect(validation.errors[0].message).toContain('does not exist');
        });

        it('should detect SQL injection patterns', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-injection', config);

            const validation = await queryService.validateQuery(
                'mysql-injection',
                "SELECT * FROM users WHERE id = 1; DROP TABLE users"
            );

            expect(validation.warnings.some(w => w.message.includes('unsafe'))).toBe(true);
        });
    });

    describe('Query Pagination', () => {
        it('should apply pagination to MySQL queries', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-page', config);

            const pagination: QueryPaginationOptions = {
                page: 2,
                pageSize: 10
            };

            // Mock to capture the query
            const originalExecuteQuery = connectionService.executeQuery;
            let capturedQuery = '';

            connectionService.executeQuery = vi.fn().mockImplementation((connectionId, request) => {
                capturedQuery = request.query;
                return originalExecuteQuery.call(connectionService, connectionId, request);
            });

            await queryService.executeQuery(
                'mysql-page',
                'SELECT * FROM users',
                undefined,
                { pagination }
            );

            expect(capturedQuery).toContain('LIMIT 10 OFFSET 10');
        });

        it('should respect maximum limit', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-max-limit', config);

            const pagination: QueryPaginationOptions = {
                page: 1,
                pageSize: 2000, // Exceeds maxLimit of 1000
                limit: 2000
            };

            // Mock to capture the query
            const originalExecuteQuery = connectionService.executeQuery;
            let capturedQuery = '';

            connectionService.executeQuery = vi.fn().mockImplementation((connectionId, request) => {
                capturedQuery = request.query;
                return originalExecuteQuery.call(connectionService, connectionId, request);
            });

            await queryService.executeQuery(
                'mysql-max-limit',
                'SELECT * FROM users',
                undefined,
                { pagination }
            );

            expect(capturedQuery).toContain('LIMIT 1000'); // Should be capped at maxLimit
        });
    });

    describe('Query Explanation', () => {
        it('should explain MySQL queries', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-explain', config);

            const explanation = await queryService.explainQuery(
                'mysql-explain',
                'SELECT * FROM users'
            );

            expect(explanation).toHaveProperty('query_block');
        });

        it('should explain PostgreSQL queries', async () => {
            const config: PostgreSQLConnectionConfig = {
                type: 'postgresql',
                host: 'localhost',
                port: 5432,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('pg-explain', config);

            const explanation = await queryService.explainQuery(
                'pg-explain',
                'SELECT * FROM users'
            );

            expect(explanation).toHaveProperty('QUERY PLAN');
        });

        it('should explain SQLite queries', async () => {
            const config: SQLiteConnectionConfig = {
                type: 'sqlite',
                database: 'test',
                filePath: '/tmp/test.db'
            };

            await connectionService.createConnection('sqlite-explain', config);

            const explanation = await queryService.explainQuery(
                'sqlite-explain',
                'SELECT * FROM users'
            );

            expect(explanation).toHaveProperty('plan');
            expect(explanation).toHaveProperty('formatted');
        });
    });

    describe('Query History', () => {
        it('should track query history', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-history', config);

            await queryService.executeQuery('mysql-history', 'SELECT * FROM users');
            await queryService.executeQuery('mysql-history', 'SELECT COUNT(*) FROM users');

            const history = queryService.getQueryHistory('mysql-history');

            expect(history).toHaveLength(2);
            expect(history[0].query).toContain('SELECT * FROM users');
            expect(history[1].query).toContain('SELECT COUNT(*)');
        });

        it('should add queries to favorites', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-favorites', config);

            await queryService.executeQuery('mysql-favorites', 'SELECT * FROM users');

            const history = queryService.getQueryHistory('mysql-favorites');
            const queryId = history[0].id;

            const added = queryService.addToFavorites('mysql-favorites', queryId);
            expect(added).toBe(true);

            const favorites = queryService.getFavoriteQueries('mysql-favorites');
            expect(favorites).toHaveLength(1);
            expect(favorites[0].favorite).toBe(true);
        });

        it('should search query history', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-search', config);

            await queryService.executeQuery('mysql-search', 'SELECT * FROM users');
            await queryService.executeQuery('mysql-search', 'SELECT * FROM orders');

            const results = queryService.searchQueryHistory('mysql-search', 'users');

            expect(results).toHaveLength(1);
            expect(results[0].query).toContain('users');
        });

        it('should limit history size', async () => {
            const limitedQueryService = new DatabaseQueryService(
                connectionService,
                schemaService,
                { maxHistorySize: 2 }
            );

            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-limit-history', config);

            await limitedQueryService.executeQuery('mysql-limit-history', 'SELECT 1');
            await limitedQueryService.executeQuery('mysql-limit-history', 'SELECT 2');
            await limitedQueryService.executeQuery('mysql-limit-history', 'SELECT 3');

            const history = limitedQueryService.getQueryHistory('mysql-limit-history');

            expect(history).toHaveLength(2);
            expect(history[0].query).toContain('SELECT 2');
            expect(history[1].query).toContain('SELECT 3');

            limitedQueryService.destroy();
        });
    });

    describe('Performance Metrics', () => {
        it('should track performance metrics', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-metrics', config);

            await queryService.executeQuery('mysql-metrics', 'SELECT * FROM users');

            const metrics = queryService.getPerformanceMetrics('mysql-metrics');

            expect(metrics).toHaveLength(1);
            expect(metrics[0]).toHaveProperty('queryId');
            expect(metrics[0]).toHaveProperty('executionTime');
            expect(metrics[0]).toHaveProperty('rowsReturned');
        });

        it('should identify slow queries', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-slow', config);

            // Mock a slow query by modifying the result
            const originalExecuteQuery = connectionService.executeQuery;
            connectionService.executeQuery = vi.fn().mockImplementation(async (connectionId, request) => {
                const result = await originalExecuteQuery.call(connectionService, connectionId, request);
                result.executionTime = 2000; // 2 seconds
                return result;
            });

            await queryService.executeQuery('mysql-slow', 'SELECT * FROM users');

            const slowQueries = queryService.getSlowQueries('mysql-slow', 1000);

            expect(slowQueries).toHaveLength(1);
            expect(slowQueries[0].executionTime).toBe(2000);
        });
    });

    describe('Dry Run', () => {
        it('should perform dry run without executing query', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-dry-run', config);

            const result = await queryService.executeQuery(
                'mysql-dry-run',
                'SELECT * FROM users',
                undefined,
                { dryRun: true }
            );

            expect(result.data).toHaveLength(0);
            expect(result.metadata?.dryRun).toBe(true);
            expect(result.metadata?.validationResult).toBeDefined();
        });

        it('should return validation errors in dry run', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-dry-run-error', config);

            const result = await queryService.executeQuery(
                'mysql-dry-run-error',
                'SELECT * FROM nonexistent_table',
                undefined,
                { dryRun: true }
            );

            expect(result.error).toContain('Query validation failed');
        });
    });

    describe('Error Handling', () => {
        it('should handle connection not found', async () => {
            const result = await queryService.executeQuery(
                'nonexistent-connection',
                'SELECT * FROM users'
            );

            expect(result.error).toContain('Connection nonexistent-connection not found');
        });

        it('should handle validation failures', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-validation-fail', config);

            const result = await queryService.executeQuery(
                'mysql-validation-fail',
                'SELECT * FROM nonexistent_table'
            );

            expect(result.error).toContain('Query validation failed');
        });
    });

    describe('Service Configuration', () => {
        it('should respect configuration options', () => {
            const customService = new DatabaseQueryService(
                connectionService,
                schemaService,
                {
                    enableValidation: false,
                    defaultLimit: 50,
                    maxLimit: 500
                }
            );

            expect(customService).toBeDefined();
            customService.destroy();
        });

        it('should clear history and metrics', async () => {
            const config: MySQLConnectionConfig = {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            };

            await connectionService.createConnection('mysql-clear', config);

            await queryService.executeQuery('mysql-clear', 'SELECT * FROM users');

            let history = queryService.getQueryHistory('mysql-clear');
            expect(history).toHaveLength(1);

            queryService.clearHistory('mysql-clear');

            history = queryService.getQueryHistory('mysql-clear');
            expect(history).toHaveLength(0);
        });
    });
});