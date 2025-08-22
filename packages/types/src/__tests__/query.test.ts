import { describe, it, expect } from 'vitest';
import type {
    QueryRequest,
    QueryResult,
    ColumnInfo,
    QueryExplanation,
    ValidationResult,
    ValidationError,
    ValidationWarning,
    QueryHistory
} from '../query';

describe('Query Types', () => {
    describe('QueryRequest', () => {
        it('should have required properties', () => {
            const request: QueryRequest = {
                connectionId: 'conn-123',
                query: 'SELECT * FROM users'
            };

            expect(request.connectionId).toBe('conn-123');
            expect(request.query).toBe('SELECT * FROM users');
        });

        it('should support optional parameters', () => {
            const request: QueryRequest = {
                connectionId: 'conn-123',
                query: 'SELECT * FROM users WHERE id = ? AND name = ?',
                parameters: [1, 'John'],
                limit: 100,
                offset: 0,
                timeout: 30000,
                explain: true,
                dryRun: false
            };

            expect(request.parameters).toEqual([1, 'John']);
            expect(request.limit).toBe(100);
            expect(request.offset).toBe(0);
            expect(request.timeout).toBe(30000);
            expect(request.explain).toBe(true);
            expect(request.dryRun).toBe(false);
        });
    });

    describe('QueryResult', () => {
        it('should have required properties', () => {
            const result: QueryResult = {
                data: [{ id: 1, name: 'John' }],
                totalRows: 1,
                executionTime: 150,
                columns: [
                    { name: 'id', type: 'integer', nullable: false, primaryKey: true },
                    { name: 'name', type: 'varchar', nullable: true, primaryKey: false }
                ]
            };

            expect(result.data).toHaveLength(1);
            expect(result.totalRows).toBe(1);
            expect(result.executionTime).toBe(150);
            expect(result.columns).toHaveLength(2);
        });

        it('should support optional properties', () => {
            const result: QueryResult = {
                data: [],
                totalRows: 0,
                executionTime: 50,
                columns: [],
                affectedRows: 5,
                error: 'Syntax error',
                warnings: ['Deprecated function used'],
                metadata: {
                    queryId: 'query-456',
                    cached: true,
                    fromCache: false,
                    queryPlan: { cost: 1.5 }
                }
            };

            expect(result.affectedRows).toBe(5);
            expect(result.error).toBe('Syntax error');
            expect(result.warnings).toContain('Deprecated function used');
            expect(result.metadata?.queryId).toBe('query-456');
            expect(result.metadata?.cached).toBe(true);
        });
    });

    describe('ColumnInfo', () => {
        it('should have required properties', () => {
            const column: ColumnInfo = {
                name: 'user_id',
                type: 'bigint',
                nullable: false,
                primaryKey: true
            };

            expect(column.name).toBe('user_id');
            expect(column.type).toBe('bigint');
            expect(column.nullable).toBe(false);
            expect(column.primaryKey).toBe(true);
        });

        it('should support optional properties', () => {
            const column: ColumnInfo = {
                name: 'price',
                type: 'decimal',
                nullable: true,
                primaryKey: false,
                autoIncrement: false,
                defaultValue: 0.00,
                length: 10,
                precision: 2,
                scale: 2,
                unsigned: true,
                zerofill: false,
                comment: 'Product price in USD'
            };

            expect(column.length).toBe(10);
            expect(column.precision).toBe(2);
            expect(column.scale).toBe(2);
            expect(column.unsigned).toBe(true);
            expect(column.zerofill).toBe(false);
            expect(column.comment).toBe('Product price in USD');
            expect(column.defaultValue).toBe(0.00);
        });
    });

    describe('QueryExplanation', () => {
        it('should have required plan property', () => {
            const explanation: QueryExplanation = {
                plan: 'Seq Scan on users (cost=0.00..15.00 rows=500 width=32)'
            };

            expect(explanation.plan).toBeDefined();
        });

        it('should support optional properties', () => {
            const explanation: QueryExplanation = {
                plan: 'Index Scan using users_pkey on users',
                cost: 0.29,
                estimatedRows: 1,
                suggestions: ['Consider adding an index on email column']
            };

            expect(explanation.cost).toBe(0.29);
            expect(explanation.estimatedRows).toBe(1);
            expect(explanation.suggestions).toContain('Consider adding an index on email column');
        });
    });

    describe('ValidationResult', () => {
        it('should indicate valid result', () => {
            const result: ValidationResult = {
                isValid: true,
                errors: [],
                warnings: []
            };

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it('should indicate invalid result with errors', () => {
            const result: ValidationResult = {
                isValid: false,
                errors: [
                    {
                        line: 1,
                        column: 15,
                        message: 'Syntax error near SELECT',
                        severity: 'error'
                    }
                ],
                warnings: [
                    {
                        line: 1,
                        column: 25,
                        message: 'Consider using explicit column names',
                        suggestion: 'Replace * with specific column names'
                    }
                ]
            };

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.warnings).toHaveLength(1);
            expect(result.errors[0].severity).toBe('error');
            expect(result.warnings[0].suggestion).toBeDefined();
        });
    });

    describe('ValidationError', () => {
        it('should have required properties', () => {
            const error: ValidationError = {
                line: 5,
                column: 10,
                message: 'Unknown column name',
                severity: 'error'
            };

            expect(error.line).toBe(5);
            expect(error.column).toBe(10);
            expect(error.message).toBe('Unknown column name');
            expect(error.severity).toBe('error');
        });

        it('should support warning severity', () => {
            const warning: ValidationError = {
                line: 2,
                column: 1,
                message: 'Deprecated syntax',
                severity: 'warning'
            };

            expect(warning.severity).toBe('warning');
        });
    });

    describe('ValidationWarning', () => {
        it('should have required properties', () => {
            const warning: ValidationWarning = {
                line: 3,
                column: 20,
                message: 'Performance warning'
            };

            expect(warning.line).toBe(3);
            expect(warning.column).toBe(20);
            expect(warning.message).toBe('Performance warning');
        });

        it('should support optional suggestion', () => {
            const warning: ValidationWarning = {
                line: 1,
                column: 1,
                message: 'Missing index',
                suggestion: 'Add index on frequently queried columns'
            };

            expect(warning.suggestion).toBe('Add index on frequently queried columns');
        });
    });

    describe('QueryHistory', () => {
        it('should have required properties', () => {
            const history: QueryHistory = {
                id: 'hist-123',
                user_id: 'user-456',
                connection_id: 'conn-789',
                query_text: 'SELECT COUNT(*) FROM orders',
                created_at: '2024-01-15T10:30:00Z'
            };

            expect(history.id).toBe('hist-123');
            expect(history.user_id).toBe('user-456');
            expect(history.connection_id).toBe('conn-789');
            expect(history.query_text).toBe('SELECT COUNT(*) FROM orders');
            expect(history.created_at).toBe('2024-01-15T10:30:00Z');
        });

        it('should support optional properties', () => {
            const history: QueryHistory = {
                id: 'hist-123',
                user_id: 'user-456',
                connection_id: 'conn-789',
                query_text: 'SELECT * FROM products',
                created_at: '2024-01-15T10:30:00Z',
                execution_time: 250,
                row_count: 1500,
                favorite: true
            };

            expect(history.execution_time).toBe(250);
            expect(history.row_count).toBe(1500);
            expect(history.favorite).toBe(true);
        });
    });
});