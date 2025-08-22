// Database query execution service implementation

import type {
    DatabaseType,
    QueryRequest,
    QueryResult,
    ValidationResult,
    ValidationError,
    ValidationWarning
} from '@database-gui/types';

import { DatabaseConnectionService } from './database-connection-service';
import { DatabaseSchemaService } from './database-schema-service';

// Query execution configuration
export interface QueryServiceConfig {
    enableValidation: boolean;
    enableQueryPlan: boolean;
    defaultLimit: number;
    maxLimit: number;
    queryTimeout: number; // in milliseconds
    enableQueryHistory: boolean;
    maxHistorySize: number;
    enablePerformanceTracking: boolean;
}

// Query execution context
export interface QueryExecutionContext {
    connectionId: string;
    databaseType: DatabaseType;
    userId?: string;
    sessionId?: string;
    startTime: Date;
    timeout?: number;
}

// Query performance metrics
export interface QueryPerformanceMetrics {
    queryId: string;
    connectionId: string;
    query: string;
    executionTime: number;
    rowsReturned: number;
    rowsExamined?: number;
    indexesUsed?: string[];
    queryPlan?: any;
    memoryUsage?: number;
    cpuTime?: number;
    timestamp: Date;
}

// Query history entry
export interface QueryHistoryEntry {
    id: string;
    connectionId: string;
    query: string;
    parameters?: any[];
    result: QueryResult;
    metrics: QueryPerformanceMetrics;
    timestamp: Date;
    favorite?: boolean;
    tags?: string[];
}

// Query validation context
export interface QueryValidationContext {
    databaseType: DatabaseType;
    availableTables: string[];
    availableColumns: Record<string, string[]>;
    reservedWords: string[];
}

// Query pagination options
export interface QueryPaginationOptions {
    page: number;
    pageSize: number;
    offset?: number;
    limit?: number;
}

// Query execution options
export interface QueryExecutionOptions {
    pagination?: QueryPaginationOptions;
    timeout?: number;
    explain?: boolean;
    dryRun?: boolean;
    enableMetrics?: boolean;
    tags?: string[];
}

export class DatabaseQueryService {
    private connectionService: DatabaseConnectionService;
    private schemaService: DatabaseSchemaService;
    private config: QueryServiceConfig;
    private queryHistory: Map<string, QueryHistoryEntry[]> = new Map();
    private performanceMetrics: Map<string, QueryPerformanceMetrics[]> = new Map();
    private activeQueries: Map<string, AbortController> = new Map();

    constructor(
        connectionService: DatabaseConnectionService,
        schemaService: DatabaseSchemaService,
        config: Partial<QueryServiceConfig> = {}
    ) {
        this.connectionService = connectionService;
        this.schemaService = schemaService;
        this.config = {
            enableValidation: true,
            enableQueryPlan: false,
            defaultLimit: 1000,
            maxLimit: 10000,
            queryTimeout: 30000, // 30 seconds
            enableQueryHistory: true,
            maxHistorySize: 100,
            enablePerformanceTracking: true,
            ...config
        };
    }

    async executeQuery(
        connectionId: string,
        query: string,
        parameters?: any[],
        options: QueryExecutionOptions = {}
    ): Promise<QueryResult> {
        const queryId = this.generateQueryId();

        let databaseType: DatabaseType;
        try {
            databaseType = this.getConnectionType(connectionId);
        } catch (error) {
            return {
                data: [],
                totalRows: 0,
                executionTime: 0,
                columns: [],
                error: `${error}`
            };
        }

        const context: QueryExecutionContext = {
            connectionId,
            databaseType,
            startTime: new Date(),
            timeout: options.timeout || this.config.queryTimeout
        };

        try {
            // Validate query if enabled
            if (this.config.enableValidation) {
                const validation = await this.validateQuery(connectionId, query);
                if (!validation.isValid) {
                    return {
                        data: [],
                        totalRows: 0,
                        executionTime: 0,
                        columns: [],
                        error: `Query validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
                        warnings: validation.warnings.map(w => w.message)
                    };
                }
            }

            // Handle dry run
            if (options.dryRun) {
                return this.performDryRun(connectionId, query, parameters);
            }

            // Apply pagination
            const paginatedQuery = this.applyPagination(query, context.databaseType, options.pagination);

            // Create query request
            const request: QueryRequest = {
                connectionId,
                query: paginatedQuery,
                parameters,
                timeout: context.timeout,
                explain: options.explain
            };

            // Set up query cancellation
            const abortController = new AbortController();
            this.activeQueries.set(queryId, abortController);

            // Execute query with timeout
            const result = await Promise.race([
                this.connectionService.executeQuery(connectionId, request),
                this.createTimeoutPromise(context.timeout!)
            ]);

            // Clean up
            this.activeQueries.delete(queryId);

            // Add performance metrics
            if (this.config.enablePerformanceTracking && options.enableMetrics !== false) {
                const metrics = this.createPerformanceMetrics(queryId, context, query, result);
                this.addPerformanceMetrics(connectionId, metrics);
            }

            // Add to query history
            if (this.config.enableQueryHistory) {
                const historyEntry = this.createHistoryEntry(queryId, connectionId, query, parameters, result, options.tags);
                this.addToHistory(connectionId, historyEntry);
            }

            return result;

        } catch (error) {
            this.activeQueries.delete(queryId);

            return {
                data: [],
                totalRows: 0,
                executionTime: Date.now() - context.startTime.getTime(),
                columns: [],
                error: `Query execution failed: ${error}`
            };
        }
    }

    async validateQuery(connectionId: string, query: string): Promise<ValidationResult> {
        const databaseType = this.getConnectionType(connectionId);
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        try {
            // Get schema context for validation
            const schema = await this.schemaService.getSchema(connectionId);
            const context: QueryValidationContext = {
                databaseType,
                availableTables: schema.tables.map(t => t.name),
                availableColumns: schema.tables.reduce((acc, table) => {
                    acc[table.name] = table.columns.map(c => c.name);
                    return acc;
                }, {} as Record<string, string[]>),
                reservedWords: this.getReservedWords(databaseType)
            };

            // Perform database-specific validation
            switch (databaseType) {
                case 'mysql':
                    this.validateMySQLQuery(query, context, errors, warnings);
                    break;
                case 'postgresql':
                    this.validatePostgreSQLQuery(query, context, errors, warnings);
                    break;
                case 'sqlite':
                    this.validateSQLiteQuery(query, context, errors, warnings);
                    break;
                case 'mongodb':
                    this.validateMongoDBQuery(query, context, errors, warnings);
                    break;
            }

            // Common validations
            this.validateCommonIssues(query, context, errors, warnings);

        } catch (error) {
            errors.push({
                line: 1,
                column: 1,
                message: `Validation error: ${error}`,
                severity: 'error'
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    async explainQuery(connectionId: string, query: string, parameters?: any[]): Promise<any> {
        const databaseType = this.getConnectionType(connectionId);
        let explainQuery: string;

        switch (databaseType) {
            case 'mysql':
                explainQuery = `EXPLAIN FORMAT=JSON ${query}`;
                break;
            case 'postgresql':
                explainQuery = `EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS) ${query}`;
                break;
            case 'sqlite':
                explainQuery = `EXPLAIN QUERY PLAN ${query}`;
                break;
            case 'mongodb':
                // MongoDB explain is handled differently
                return this.explainMongoDBQuery(connectionId, query);
            default:
                throw new Error(`Query explanation not supported for ${databaseType}`);
        }

        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: explainQuery,
            parameters
        });

        return this.parseExplainResult(databaseType, result);
    }

    async cancelQuery(queryId: string): Promise<boolean> {
        const abortController = this.activeQueries.get(queryId);
        if (abortController) {
            abortController.abort();
            this.activeQueries.delete(queryId);
            return true;
        }
        return false;
    }

    getQueryHistory(connectionId: string, limit?: number): QueryHistoryEntry[] {
        const history = this.queryHistory.get(connectionId) || [];
        return limit ? history.slice(-limit) : history;
    }

    addToFavorites(connectionId: string, queryId: string): boolean {
        const history = this.queryHistory.get(connectionId) || [];
        const entry = history.find(h => h.id === queryId);
        if (entry) {
            entry.favorite = true;
            return true;
        }
        return false;
    }

    removeFromFavorites(connectionId: string, queryId: string): boolean {
        const history = this.queryHistory.get(connectionId) || [];
        const entry = history.find(h => h.id === queryId);
        if (entry) {
            entry.favorite = false;
            return true;
        }
        return false;
    }

    getFavoriteQueries(connectionId: string): QueryHistoryEntry[] {
        const history = this.queryHistory.get(connectionId) || [];
        return history.filter(h => h.favorite);
    }

    searchQueryHistory(connectionId: string, searchTerm: string): QueryHistoryEntry[] {
        const history = this.queryHistory.get(connectionId) || [];
        const lowerSearchTerm = searchTerm.toLowerCase();

        return history.filter(entry =>
            entry.query.toLowerCase().includes(lowerSearchTerm) ||
            entry.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
        );
    }

    getPerformanceMetrics(connectionId: string, limit?: number): QueryPerformanceMetrics[] {
        const metrics = this.performanceMetrics.get(connectionId) || [];
        return limit ? metrics.slice(-limit) : metrics;
    }

    getSlowQueries(connectionId: string, thresholdMs: number = 1000): QueryPerformanceMetrics[] {
        const metrics = this.performanceMetrics.get(connectionId) || [];
        return metrics.filter(m => m.executionTime > thresholdMs);
    }

    clearHistory(connectionId?: string): void {
        if (connectionId) {
            this.queryHistory.delete(connectionId);
            this.performanceMetrics.delete(connectionId);
        } else {
            this.queryHistory.clear();
            this.performanceMetrics.clear();
        }
    }

    private getConnectionType(connectionId: string): DatabaseType {
        const connectionInfo = this.connectionService.getConnectionInfo(connectionId);
        if (!connectionInfo) {
            throw new Error(`Connection ${connectionId} not found`);
        }
        return connectionInfo.type as DatabaseType;
    }

    private generateQueryId(): string {
        return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private applyPagination(
        query: string,
        databaseType: DatabaseType,
        pagination?: QueryPaginationOptions
    ): string {
        if (!pagination) {
            // Apply default limit
            return this.addDefaultLimit(query, databaseType);
        }

        const { page, pageSize, offset, limit } = pagination;
        const effectiveLimit = Math.min(limit || pageSize, this.config.maxLimit);
        const effectiveOffset = offset || ((page - 1) * pageSize);

        switch (databaseType) {
            case 'mysql':
            case 'sqlite':
                return `${query} LIMIT ${effectiveLimit} OFFSET ${effectiveOffset}`;
            case 'postgresql':
                return `${query} LIMIT ${effectiveLimit} OFFSET ${effectiveOffset}`;
            case 'mongodb':
                // MongoDB pagination is handled differently in the query parsing
                return query;
            default:
                return query;
        }
    }

    private addDefaultLimit(query: string, databaseType: DatabaseType): string {
        const trimmedQuery = query.trim().toLowerCase();

        // Don't add limit to queries that already have one or are not SELECT queries
        if (trimmedQuery.includes('limit') ||
            !trimmedQuery.startsWith('select') ||
            trimmedQuery.includes('count(') ||
            trimmedQuery.includes('sum(') ||
            trimmedQuery.includes('avg(') ||
            trimmedQuery.includes('max(') ||
            trimmedQuery.includes('min(')) {
            return query;
        }

        switch (databaseType) {
            case 'mysql':
            case 'postgresql':
            case 'sqlite':
                return `${query} LIMIT ${this.config.defaultLimit}`;
            case 'mongodb':
                return query; // MongoDB limits are handled in query parsing
            default:
                return query;
        }
    }

    private async performDryRun(
        connectionId: string,
        query: string,
        parameters?: any[]
    ): Promise<QueryResult> {
        // For dry run, we validate the query and return metadata without executing
        const validation = await this.validateQuery(connectionId, query);

        return {
            data: [],
            totalRows: 0,
            executionTime: 0,
            columns: [],
            warnings: validation.warnings.map(w => w.message),
            error: validation.errors.length > 0 ?
                `Validation errors: ${validation.errors.map(e => e.message).join(', ')}` :
                undefined,
            metadata: {
                dryRun: true,
                validationResult: validation
            }
        };
    }

    private createTimeoutPromise(timeoutMs: number): Promise<QueryResult> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Query timeout after ${timeoutMs}ms`));
            }, timeoutMs);
        });
    }

    private createPerformanceMetrics(
        queryId: string,
        context: QueryExecutionContext,
        query: string,
        result: QueryResult
    ): QueryPerformanceMetrics {
        return {
            queryId,
            connectionId: context.connectionId,
            query,
            executionTime: result.executionTime,
            rowsReturned: result.totalRows,
            rowsExamined: result.metadata?.rowsExamined,
            indexesUsed: result.metadata?.indexesUsed,
            queryPlan: result.metadata?.queryPlan,
            timestamp: context.startTime
        };
    }

    private createHistoryEntry(
        queryId: string,
        connectionId: string,
        query: string,
        parameters: any[] | undefined,
        result: QueryResult,
        tags?: string[]
    ): QueryHistoryEntry {
        return {
            id: queryId,
            connectionId,
            query,
            parameters,
            result,
            metrics: this.createPerformanceMetrics(queryId, {
                connectionId,
                databaseType: this.getConnectionType(connectionId),
                startTime: new Date(Date.now() - result.executionTime)
            }, query, result),
            timestamp: new Date(),
            tags
        };
    }

    private addPerformanceMetrics(connectionId: string, metrics: QueryPerformanceMetrics): void {
        if (!this.performanceMetrics.has(connectionId)) {
            this.performanceMetrics.set(connectionId, []);
        }

        const connectionMetrics = this.performanceMetrics.get(connectionId)!;
        connectionMetrics.push(metrics);

        // Keep only the most recent metrics
        if (connectionMetrics.length > this.config.maxHistorySize) {
            connectionMetrics.shift();
        }
    }

    private addToHistory(connectionId: string, entry: QueryHistoryEntry): void {
        if (!this.queryHistory.has(connectionId)) {
            this.queryHistory.set(connectionId, []);
        }

        const history = this.queryHistory.get(connectionId)!;
        history.push(entry);

        // Keep only the most recent entries
        if (history.length > this.config.maxHistorySize) {
            history.shift();
        }
    }

    private validateMySQLQuery(
        query: string,
        context: QueryValidationContext,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        // MySQL-specific validation
        const lowerQuery = query.toLowerCase();

        // Check for dangerous operations
        if (lowerQuery.includes('drop table') || lowerQuery.includes('drop database')) {
            warnings.push({
                line: 1,
                column: 1,
                message: 'Potentially dangerous DROP operation detected',
                suggestion: 'Consider using a backup before executing DROP statements'
            });
        }

        // Check for missing WHERE clause in UPDATE/DELETE
        if ((lowerQuery.includes('update ') || lowerQuery.includes('delete ')) &&
            !lowerQuery.includes('where')) {
            warnings.push({
                line: 1,
                column: 1,
                message: 'UPDATE/DELETE without WHERE clause affects all rows',
                suggestion: 'Add a WHERE clause to limit affected rows'
            });
        }

        // Validate table references
        this.validateTableReferences(query, context, errors);
    }

    private validatePostgreSQLQuery(
        query: string,
        context: QueryValidationContext,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        // PostgreSQL-specific validation
        const lowerQuery = query.toLowerCase();

        // Check for PostgreSQL-specific syntax
        if (lowerQuery.includes('ilike') && context.databaseType !== 'postgresql') {
            errors.push({
                line: 1,
                column: 1,
                message: 'ILIKE operator is PostgreSQL-specific',
                severity: 'error'
            });
        }

        // Validate table references
        this.validateTableReferences(query, context, errors);
    }

    private validateSQLiteQuery(
        query: string,
        context: QueryValidationContext,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        // SQLite-specific validation
        const lowerQuery = query.toLowerCase();

        // SQLite doesn't support some SQL features
        if (lowerQuery.includes('right join') || lowerQuery.includes('full outer join')) {
            errors.push({
                line: 1,
                column: 1,
                message: 'RIGHT JOIN and FULL OUTER JOIN are not supported in SQLite',
                severity: 'error'
            });
        }

        // Validate table references
        this.validateTableReferences(query, context, errors);
    }

    private validateMongoDBQuery(
        query: string,
        context: QueryValidationContext,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        // MongoDB-specific validation
        try {
            // Try to parse as MongoDB query
            if (query.includes('.find(') || query.includes('.aggregate(')) {
                // Basic MongoDB query structure validation
                const collectionMatch = query.match(/(\w+)\.(find|aggregate|count)/);
                if (collectionMatch) {
                    const collectionName = collectionMatch[1];
                    if (!context.availableTables.includes(collectionName)) {
                        errors.push({
                            line: 1,
                            column: 1,
                            message: `Collection '${collectionName}' does not exist`,
                            severity: 'error'
                        });
                    }
                }
            } else {
                // Try to parse as JSON
                JSON.parse(query);
            }
        } catch (error) {
            errors.push({
                line: 1,
                column: 1,
                message: `Invalid MongoDB query syntax: ${error}`,
                severity: 'error'
            });
        }
    }

    private validateCommonIssues(
        query: string,
        context: QueryValidationContext,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        // Check for SQL injection patterns
        const suspiciousPatterns = [
            /union\s+select/i,
            /;\s*drop/i,
            /;\s*delete/i,
            /;\s*insert/i,
            /;\s*update/i
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(query)) {
                warnings.push({
                    line: 1,
                    column: 1,
                    message: 'Potentially unsafe query pattern detected',
                    suggestion: 'Use parameterized queries to prevent SQL injection'
                });
                break;
            }
        }

        // Check for very large result sets
        if (!query.toLowerCase().includes('limit') &&
            query.toLowerCase().includes('select') &&
            !query.toLowerCase().includes('count(')) {
            warnings.push({
                line: 1,
                column: 1,
                message: 'Query may return a large result set',
                suggestion: 'Consider adding a LIMIT clause'
            });
        }
    }

    private validateTableReferences(
        query: string,
        context: QueryValidationContext,
        errors: ValidationError[]
    ): void {
        // Extract table names from query (simplified)
        const tablePattern = /(?:from|join|update|into)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
        let match;

        while ((match = tablePattern.exec(query)) !== null) {
            const tableName = match[1];
            if (!context.availableTables.includes(tableName)) {
                errors.push({
                    line: 1,
                    column: match.index,
                    message: `Table '${tableName}' does not exist`,
                    severity: 'error'
                });
            }
        }
    }

    private getReservedWords(databaseType: DatabaseType): string[] {
        const commonWords = ['select', 'from', 'where', 'insert', 'update', 'delete', 'create', 'drop', 'alter'];

        switch (databaseType) {
            case 'mysql':
                return [...commonWords, 'limit', 'offset', 'group', 'order', 'having'];
            case 'postgresql':
                return [...commonWords, 'limit', 'offset', 'window', 'with'];
            case 'sqlite':
                return [...commonWords, 'limit', 'offset', 'pragma'];
            case 'mongodb':
                return ['find', 'aggregate', 'count', 'distinct', 'update', 'delete'];
            default:
                return commonWords;
        }
    }

    private async explainMongoDBQuery(connectionId: string, query: string): Promise<any> {
        // MongoDB explain is handled by adding .explain() to the query
        const explainQuery = query.replace(/\.find\(/, '.find(').replace(/\)$/, ').explain()');

        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: explainQuery
        });

        return result.data[0] || {};
    }

    private parseExplainResult(databaseType: DatabaseType, result: QueryResult): any {
        if (result.error) {
            return { error: result.error };
        }

        switch (databaseType) {
            case 'mysql':
            case 'postgresql':
                // JSON format explain results
                return result.data[0] || {};
            case 'sqlite':
                // SQLite returns tabular explain results
                return {
                    plan: result.data,
                    formatted: result.data.map(row =>
                        `${row.id}: ${row.detail} (${row.selectid})`
                    ).join('\n')
                };
            default:
                return result.data;
        }
    }

    // Cleanup method
    destroy(): void {
        // Cancel all active queries
        for (const [queryId, controller] of this.activeQueries) {
            controller.abort();
        }
        this.activeQueries.clear();

        // Clear history and metrics
        this.clearHistory();
    }
}