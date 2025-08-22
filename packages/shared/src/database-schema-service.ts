// Database schema service implementation

import type {
    DatabaseType,
    DatabaseConnection
} from '@database-gui/types';

import { DatabaseConnectionService } from './database-connection-service';

// Schema cache entry
interface SchemaCacheEntry {
    schema: DatabaseSchema;
    timestamp: Date;
    ttl: number; // Time to live in milliseconds
}

// Database schema interfaces
export interface DatabaseSchema {
    databaseName: string;
    databaseType: DatabaseType;
    version?: string;
    charset?: string;
    collation?: string;
    tables: TableSchema[];
    views?: ViewSchema[];
    indexes?: IndexSchema[];
    triggers?: TriggerSchema[];
    procedures?: ProcedureSchema[];
    functions?: FunctionSchema[];
    lastUpdated: Date;
}

export interface TableSchema {
    name: string;
    type: 'table' | 'view' | 'collection';
    columns: ColumnSchema[];
    primaryKey?: string[];
    foreignKeys?: ForeignKeySchema[];
    indexes?: IndexSchema[];
    triggers?: TriggerSchema[];
    rowCount?: number;
    sizeBytes?: number;
    comment?: string;
    created?: Date;
    modified?: Date;
}

export interface ColumnSchema {
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    autoIncrement?: boolean;
    defaultValue?: any;
    length?: number;
    precision?: number;
    scale?: number;
    unsigned?: boolean;
    zerofill?: boolean;
    comment?: string;
    collation?: string;
    charset?: string;
}

export interface ViewSchema {
    name: string;
    definition: string;
    columns: ColumnSchema[];
    comment?: string;
    created?: Date;
    modified?: Date;
}

export interface IndexSchema {
    name: string;
    tableName: string;
    columns: string[];
    unique: boolean;
    type: 'btree' | 'hash' | 'fulltext' | 'spatial' | 'other';
    comment?: string;
}

export interface ForeignKeySchema {
    name: string;
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
    onUpdate: 'cascade' | 'restrict' | 'set null' | 'no action';
    onDelete: 'cascade' | 'restrict' | 'set null' | 'no action';
}

export interface TriggerSchema {
    name: string;
    tableName: string;
    event: 'insert' | 'update' | 'delete';
    timing: 'before' | 'after' | 'instead of';
    definition: string;
    comment?: string;
}

export interface ProcedureSchema {
    name: string;
    parameters: ParameterSchema[];
    returnType?: string;
    definition: string;
    comment?: string;
    created?: Date;
    modified?: Date;
}

export interface FunctionSchema {
    name: string;
    parameters: ParameterSchema[];
    returnType: string;
    definition: string;
    comment?: string;
    created?: Date;
    modified?: Date;
}

export interface ParameterSchema {
    name: string;
    type: string;
    direction: 'in' | 'out' | 'inout';
    defaultValue?: any;
}

// MongoDB specific schema interfaces
export interface MongoCollectionSchema {
    name: string;
    type: 'collection' | 'view';
    sampleDocument?: any;
    indexes: MongoIndexSchema[];
    validator?: any;
    validationLevel?: 'off' | 'strict' | 'moderate';
    validationAction?: 'error' | 'warn';
    documentCount?: number;
    avgDocumentSize?: number;
    totalSize?: number;
}

export interface MongoIndexSchema {
    name: string;
    key: Record<string, number>;
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
    expireAfterSeconds?: number;
    partialFilterExpression?: any;
}

// Schema service configuration
export interface SchemaServiceConfig {
    cacheEnabled: boolean;
    defaultCacheTTL: number; // in milliseconds
    maxCacheSize: number;
    enableAutoRefresh: boolean;
    autoRefreshInterval: number; // in milliseconds
}

export class DatabaseSchemaService {
    private connectionService: DatabaseConnectionService;
    private schemaCache: Map<string, SchemaCacheEntry> = new Map();
    private config: SchemaServiceConfig;
    private refreshTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        connectionService: DatabaseConnectionService,
        config: Partial<SchemaServiceConfig> = {}
    ) {
        this.connectionService = connectionService;
        this.config = {
            cacheEnabled: true,
            defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
            maxCacheSize: 100,
            enableAutoRefresh: false,
            autoRefreshInterval: 30 * 60 * 1000, // 30 minutes
            ...config
        };
    }

    async getSchema(connectionId: string, forceRefresh = false): Promise<DatabaseSchema> {
        const cacheKey = connectionId;

        // Check cache first
        if (!forceRefresh && this.config.cacheEnabled) {
            const cached = this.getCachedSchema(cacheKey);
            if (cached) {
                return cached;
            }
        }

        // Fetch fresh schema
        const schema = await this.fetchSchema(connectionId);

        // Cache the result
        if (this.config.cacheEnabled) {
            this.cacheSchema(cacheKey, schema);
        }

        // Set up auto-refresh if enabled
        if (this.config.enableAutoRefresh) {
            this.setupAutoRefresh(connectionId);
        }

        return schema;
    }

    async refreshSchema(connectionId: string): Promise<DatabaseSchema> {
        return this.getSchema(connectionId, true);
    }

    async getTableSchema(connectionId: string, tableName: string): Promise<TableSchema | null> {
        const schema = await this.getSchema(connectionId);
        return schema.tables.find(table => table.name === tableName) || null;
    }

    async getTableColumns(connectionId: string, tableName: string): Promise<ColumnSchema[]> {
        const table = await this.getTableSchema(connectionId, tableName);
        return table?.columns || [];
    }

    async getTableIndexes(connectionId: string, tableName: string): Promise<IndexSchema[]> {
        const table = await this.getTableSchema(connectionId, tableName);
        return table?.indexes || [];
    }

    async searchTables(connectionId: string, searchTerm: string): Promise<TableSchema[]> {
        const schema = await this.getSchema(connectionId);
        const lowerSearchTerm = searchTerm.toLowerCase();

        return schema.tables.filter(table =>
            table.name.toLowerCase().includes(lowerSearchTerm) ||
            table.comment?.toLowerCase().includes(lowerSearchTerm) ||
            table.columns.some(col =>
                col.name.toLowerCase().includes(lowerSearchTerm) ||
                col.comment?.toLowerCase().includes(lowerSearchTerm)
            )
        );
    }

    async searchColumns(connectionId: string, searchTerm: string): Promise<Array<{ table: string, column: ColumnSchema }>> {
        const schema = await this.getSchema(connectionId);
        const lowerSearchTerm = searchTerm.toLowerCase();
        const results: Array<{ table: string, column: ColumnSchema }> = [];

        for (const table of schema.tables) {
            for (const column of table.columns) {
                if (column.name.toLowerCase().includes(lowerSearchTerm) ||
                    column.comment?.toLowerCase().includes(lowerSearchTerm)) {
                    results.push({ table: table.name, column });
                }
            }
        }

        return results;
    }

    clearCache(connectionId?: string): void {
        if (connectionId) {
            this.schemaCache.delete(connectionId);
            this.clearAutoRefresh(connectionId);
        } else {
            this.schemaCache.clear();
            this.refreshTimers.forEach((timer, id) => {
                clearTimeout(timer);
            });
            this.refreshTimers.clear();
        }
    }

    getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
        return {
            size: this.schemaCache.size,
            maxSize: this.config.maxCacheSize
        };
    }

    private async fetchSchema(connectionId: string): Promise<DatabaseSchema> {
        const connectionInfo = this.connectionService.getConnectionInfo(connectionId);
        if (!connectionInfo) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        const dbType = connectionInfo.type as DatabaseType;

        switch (dbType) {
            case 'mongodb':
                return this.fetchMongoSchema(connectionId);
            case 'mysql':
                return this.fetchMySQLSchema(connectionId);
            case 'postgresql':
                return this.fetchPostgreSQLSchema(connectionId);
            case 'sqlite':
                return this.fetchSQLiteSchema(connectionId);
            default:
                throw new Error(`Unsupported database type: ${dbType}`);
        }
    }

    private async fetchMongoSchema(connectionId: string): Promise<DatabaseSchema> {
        const rawSchema = await this.connectionService.getSchema(connectionId);
        const databases = await this.connectionService.getDatabases(connectionId);

        const tables: TableSchema[] = [];

        if (rawSchema.collections) {
            for (const collection of rawSchema.collections) {
                const table: TableSchema = {
                    name: collection.name,
                    type: 'collection',
                    columns: await this.inferMongoColumns(connectionId, collection.name),
                    indexes: collection.indexes?.map((idx: any) => ({
                        name: idx.name,
                        tableName: collection.name,
                        columns: Object.keys(idx.key || {}),
                        unique: idx.unique || false,
                        type: 'btree' as const
                    })) || []
                };
                tables.push(table);
            }
        }

        return {
            databaseName: rawSchema.database,
            databaseType: 'mongodb',
            tables,
            lastUpdated: new Date()
        };
    }

    private async fetchMySQLSchema(connectionId: string): Promise<DatabaseSchema> {
        const rawSchema = await this.connectionService.getSchema(connectionId);
        const tables: TableSchema[] = [];

        // Get detailed table information
        for (const tableInfo of rawSchema.tables || []) {
            const columns = await this.fetchMySQLColumns(connectionId, tableInfo.TABLE_NAME);
            const indexes = await this.fetchMySQLIndexes(connectionId, tableInfo.TABLE_NAME);
            const foreignKeys = await this.fetchMySQLForeignKeys(connectionId, tableInfo.TABLE_NAME);

            const table: TableSchema = {
                name: tableInfo.TABLE_NAME,
                type: tableInfo.TABLE_TYPE === 'VIEW' ? 'view' : 'table',
                columns,
                indexes,
                foreignKeys,
                comment: tableInfo.TABLE_COMMENT
            };
            tables.push(table);
        }

        return {
            databaseName: rawSchema.database,
            databaseType: 'mysql',
            tables,
            lastUpdated: new Date()
        };
    }

    private async fetchPostgreSQLSchema(connectionId: string): Promise<DatabaseSchema> {
        const rawSchema = await this.connectionService.getSchema(connectionId);
        const tables: TableSchema[] = [];

        // Get detailed table information
        for (const tableInfo of rawSchema.tables || []) {
            const columns = await this.fetchPostgreSQLColumns(connectionId, tableInfo.table_name);
            const indexes = await this.fetchPostgreSQLIndexes(connectionId, tableInfo.table_name);
            const foreignKeys = await this.fetchPostgreSQLForeignKeys(connectionId, tableInfo.table_name);

            const table: TableSchema = {
                name: tableInfo.table_name,
                type: tableInfo.table_type === 'VIEW' ? 'view' : 'table',
                columns,
                indexes,
                foreignKeys
            };
            tables.push(table);
        }

        return {
            databaseName: rawSchema.database,
            databaseType: 'postgresql',
            tables,
            lastUpdated: new Date()
        };
    }

    private async fetchSQLiteSchema(connectionId: string): Promise<DatabaseSchema> {
        const rawSchema = await this.connectionService.getSchema(connectionId);
        const tables: TableSchema[] = [];

        // Get detailed table information
        for (const tableInfo of rawSchema.tables || []) {
            const columns = await this.fetchSQLiteColumns(connectionId, tableInfo.name);
            const indexes = await this.fetchSQLiteIndexes(connectionId, tableInfo.name);

            const table: TableSchema = {
                name: tableInfo.name,
                type: tableInfo.type === 'view' ? 'view' : 'table',
                columns,
                indexes
            };
            tables.push(table);
        }

        return {
            databaseName: rawSchema.database,
            databaseType: 'sqlite',
            tables,
            lastUpdated: new Date()
        };
    }

    private async inferMongoColumns(connectionId: string, collectionName: string): Promise<ColumnSchema[]> {
        try {
            // Get a sample document to infer schema
            const result = await this.connectionService.executeQuery(connectionId, {
                connectionId,
                query: `${collectionName}.findOne({})`
            });

            if (result.data && result.data.length > 0) {
                const sampleDoc = result.data[0];
                return this.extractMongoColumns(sampleDoc);
            }
        } catch (error) {
            console.warn(`Failed to infer columns for collection ${collectionName}:`, error);
        }

        return [];
    }

    private extractMongoColumns(document: any, prefix = ''): ColumnSchema[] {
        const columns: ColumnSchema[] = [];

        for (const [key, value] of Object.entries(document)) {
            const columnName = prefix ? `${prefix}.${key}` : key;
            const column: ColumnSchema = {
                name: columnName,
                type: this.getMongoFieldType(value),
                nullable: true,
                primaryKey: key === '_id' && !prefix
            };
            columns.push(column);

            // Recursively process nested objects (limited depth)
            if (typeof value === 'object' && value !== null && !Array.isArray(value) && prefix.split('.').length < 2) {
                columns.push(...this.extractMongoColumns(value, columnName));
            }
        }

        return columns;
    }

    private getMongoFieldType(value: any): string {
        if (value === null || value === undefined) return 'null';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'object') return 'object';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double';
        if (typeof value === 'boolean') return 'boolean';
        if (value instanceof Date) return 'date';
        return 'unknown';
    }

    private async fetchMySQLColumns(connectionId: string, tableName: string): Promise<ColumnSchema[]> {
        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: `
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    IS_NULLABLE,
                    COLUMN_KEY,
                    COLUMN_DEFAULT,
                    EXTRA,
                    CHARACTER_MAXIMUM_LENGTH,
                    NUMERIC_PRECISION,
                    NUMERIC_SCALE,
                    COLUMN_COMMENT,
                    COLLATION_NAME,
                    CHARACTER_SET_NAME
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            `,
            parameters: [tableName]
        });

        return result.data.map((row: any) => ({
            name: row.COLUMN_NAME,
            type: row.DATA_TYPE,
            nullable: row.IS_NULLABLE === 'YES',
            primaryKey: row.COLUMN_KEY === 'PRI',
            autoIncrement: row.EXTRA.includes('auto_increment'),
            defaultValue: row.COLUMN_DEFAULT,
            length: row.CHARACTER_MAXIMUM_LENGTH,
            precision: row.NUMERIC_PRECISION,
            scale: row.NUMERIC_SCALE,
            comment: row.COLUMN_COMMENT,
            collation: row.COLLATION_NAME,
            charset: row.CHARACTER_SET_NAME
        }));
    }

    private async fetchMySQLIndexes(connectionId: string, tableName: string): Promise<IndexSchema[]> {
        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: `
                SELECT 
                    INDEX_NAME,
                    COLUMN_NAME,
                    NON_UNIQUE,
                    INDEX_TYPE,
                    INDEX_COMMENT
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                ORDER BY INDEX_NAME, SEQ_IN_INDEX
            `,
            parameters: [tableName]
        });

        const indexMap = new Map<string, IndexSchema>();

        for (const row of result.data) {
            const indexName = row.INDEX_NAME;
            if (!indexMap.has(indexName)) {
                indexMap.set(indexName, {
                    name: indexName,
                    tableName,
                    columns: [],
                    unique: row.NON_UNIQUE === 0,
                    type: row.INDEX_TYPE?.toLowerCase() || 'btree',
                    comment: row.INDEX_COMMENT
                });
            }
            indexMap.get(indexName)!.columns.push(row.COLUMN_NAME);
        }

        return Array.from(indexMap.values());
    }

    private async fetchMySQLForeignKeys(connectionId: string, tableName: string): Promise<ForeignKeySchema[]> {
        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: `
                SELECT 
                    CONSTRAINT_NAME,
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME,
                    UPDATE_RULE,
                    DELETE_RULE
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = ? 
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                ORDER BY CONSTRAINT_NAME, ORDINAL_POSITION
            `,
            parameters: [tableName]
        });

        const fkMap = new Map<string, ForeignKeySchema>();

        for (const row of result.data) {
            const fkName = row.CONSTRAINT_NAME;
            if (!fkMap.has(fkName)) {
                fkMap.set(fkName, {
                    name: fkName,
                    columns: [],
                    referencedTable: row.REFERENCED_TABLE_NAME,
                    referencedColumns: [],
                    onUpdate: row.UPDATE_RULE?.toLowerCase() || 'restrict',
                    onDelete: row.DELETE_RULE?.toLowerCase() || 'restrict'
                });
            }
            const fk = fkMap.get(fkName)!;
            fk.columns.push(row.COLUMN_NAME);
            fk.referencedColumns.push(row.REFERENCED_COLUMN_NAME);
        }

        return Array.from(fkMap.values());
    }

    private async fetchPostgreSQLColumns(connectionId: string, tableName: string): Promise<ColumnSchema[]> {
        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: `
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length,
                    numeric_precision,
                    numeric_scale,
                    udt_name
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position
            `,
            parameters: [tableName]
        });

        return result.data.map((row: any) => ({
            name: row.column_name,
            type: row.data_type,
            nullable: row.is_nullable === 'YES',
            primaryKey: false, // Would need additional query to determine
            defaultValue: row.column_default,
            length: row.character_maximum_length,
            precision: row.numeric_precision,
            scale: row.numeric_scale
        }));
    }

    private async fetchPostgreSQLIndexes(connectionId: string, tableName: string): Promise<IndexSchema[]> {
        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: `
                SELECT 
                    i.relname as index_name,
                    a.attname as column_name,
                    ix.indisunique as is_unique,
                    am.amname as index_type
                FROM pg_class t
                JOIN pg_index ix ON t.oid = ix.indrelid
                JOIN pg_class i ON i.oid = ix.indexrelid
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
                JOIN pg_am am ON i.relam = am.oid
                WHERE t.relname = $1 AND t.relkind = 'r'
                ORDER BY i.relname, a.attnum
            `,
            parameters: [tableName]
        });

        const indexMap = new Map<string, IndexSchema>();

        for (const row of result.data) {
            const indexName = row.index_name;
            if (!indexMap.has(indexName)) {
                indexMap.set(indexName, {
                    name: indexName,
                    tableName,
                    columns: [],
                    unique: row.is_unique,
                    type: row.index_type || 'btree'
                });
            }
            indexMap.get(indexName)!.columns.push(row.column_name);
        }

        return Array.from(indexMap.values());
    }

    private async fetchPostgreSQLForeignKeys(connectionId: string, tableName: string): Promise<ForeignKeySchema[]> {
        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: `
                SELECT 
                    tc.constraint_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name,
                    rc.update_rule,
                    rc.delete_rule
                FROM information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                JOIN information_schema.referential_constraints AS rc
                    ON tc.constraint_name = rc.constraint_name
                    AND tc.table_schema = rc.constraint_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                    AND tc.table_name = $1
                ORDER BY tc.constraint_name, kcu.ordinal_position
            `,
            parameters: [tableName]
        });

        const fkMap = new Map<string, ForeignKeySchema>();

        for (const row of result.data) {
            const fkName = row.constraint_name;
            if (!fkMap.has(fkName)) {
                fkMap.set(fkName, {
                    name: fkName,
                    columns: [],
                    referencedTable: row.foreign_table_name,
                    referencedColumns: [],
                    onUpdate: row.update_rule?.toLowerCase() || 'no action',
                    onDelete: row.delete_rule?.toLowerCase() || 'no action'
                });
            }
            const fk = fkMap.get(fkName)!;
            fk.columns.push(row.column_name);
            fk.referencedColumns.push(row.foreign_column_name);
        }

        return Array.from(fkMap.values());
    }

    private async fetchSQLiteColumns(connectionId: string, tableName: string): Promise<ColumnSchema[]> {
        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: `PRAGMA table_info(${tableName})`
        });

        return result.data.map((row: any) => ({
            name: row.name,
            type: row.type,
            nullable: row.notnull === 0,
            primaryKey: row.pk === 1,
            defaultValue: row.dflt_value
        }));
    }

    private async fetchSQLiteIndexes(connectionId: string, tableName: string): Promise<IndexSchema[]> {
        const result = await this.connectionService.executeQuery(connectionId, {
            connectionId,
            query: `PRAGMA index_list(${tableName})`
        });

        const indexes: IndexSchema[] = [];

        for (const row of result.data) {
            const indexInfo = await this.connectionService.executeQuery(connectionId, {
                connectionId,
                query: `PRAGMA index_info(${row.name})`
            });

            indexes.push({
                name: row.name,
                tableName,
                columns: indexInfo.data.map((col: any) => col.name),
                unique: row.unique === 1,
                type: 'btree'
            });
        }

        return indexes;
    }

    private getCachedSchema(cacheKey: string): DatabaseSchema | null {
        const entry = this.schemaCache.get(cacheKey);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp.getTime() > entry.ttl) {
            this.schemaCache.delete(cacheKey);
            return null;
        }

        return entry.schema;
    }

    private cacheSchema(cacheKey: string, schema: DatabaseSchema): void {
        // Implement LRU eviction if cache is full
        if (this.schemaCache.size >= this.config.maxCacheSize) {
            const oldestKey = this.schemaCache.keys().next().value;
            if (oldestKey) {
                this.schemaCache.delete(oldestKey);
            }
        }

        this.schemaCache.set(cacheKey, {
            schema,
            timestamp: new Date(),
            ttl: this.config.defaultCacheTTL
        });
    }

    private setupAutoRefresh(connectionId: string): void {
        // Clear existing timer
        this.clearAutoRefresh(connectionId);

        // Set up new timer
        const timer = setTimeout(async () => {
            try {
                await this.refreshSchema(connectionId);
                // Reschedule
                this.setupAutoRefresh(connectionId);
            } catch (error) {
                console.error(`Auto-refresh failed for connection ${connectionId}:`, error);
            }
        }, this.config.autoRefreshInterval);

        this.refreshTimers.set(connectionId, timer);
    }

    private clearAutoRefresh(connectionId: string): void {
        const timer = this.refreshTimers.get(connectionId);
        if (timer) {
            clearTimeout(timer);
            this.refreshTimers.delete(connectionId);
        }
    }

    // Cleanup method
    destroy(): void {
        this.clearCache();
    }
}