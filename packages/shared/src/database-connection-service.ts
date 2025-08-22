// Database connection service implementation

import type {
    DatabaseConnection,
    ConnectionConfig,
    QueryRequest,
    QueryResult,
    ColumnInfo,
    DatabaseType
} from '@database-gui/types';

import type {
    MongoConnectionConfig,
    MySQLConnectionConfig,
    PostgreSQLConnectionConfig,
    SQLiteConnectionConfig,
    DatabaseSpecificConnectionConfig,
    DatabaseCapabilities
} from '@database-gui/types';
import { DATABASE_CAPABILITIES } from '@database-gui/types';

// Import database drivers
import { MongoClient, Db } from 'mongodb';
import mysql from 'mysql2/promise';
import { Client as PgClient } from 'pg';
import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Connection pool management
interface ConnectionPool {
    connections: Map<string, BaseDatabaseClient>;
    maxConnections: number;
    activeConnections: number;
}

// Abstract base class for all database clients
export abstract class BaseDatabaseClient {
    protected connectionId: string;
    protected config: ConnectionConfig;
    protected type: DatabaseType;
    protected isConnected: boolean = false;
    protected lastError?: string;
    protected connectionTime?: Date;
    protected lastActivity?: Date;

    constructor(connectionId: string, config: ConnectionConfig, type: DatabaseType) {
        this.connectionId = connectionId;
        this.config = config;
        this.type = type;
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract testConnection(): Promise<boolean>;
    abstract executeQuery(request: QueryRequest): Promise<QueryResult>;
    abstract getSchema(): Promise<any>;
    abstract getDatabases(): Promise<string[]>;
    abstract getTables(database?: string): Promise<string[]>;

    getCapabilities(): DatabaseCapabilities {
        return DATABASE_CAPABILITIES[this.type];
    }

    getConnectionStatus(): 'connected' | 'disconnected' | 'error' {
        if (this.lastError) return 'error';
        return this.isConnected ? 'connected' : 'disconnected';
    }

    getLastError(): string | undefined {
        return this.lastError;
    }

    getConnectionInfo(): { connectionTime?: Date; lastActivity?: Date } {
        return {
            connectionTime: this.connectionTime,
            lastActivity: this.lastActivity
        };
    }

    protected setError(error: string): void {
        this.lastError = error;
        this.isConnected = false;
    }

    protected clearError(): void {
        this.lastError = undefined;
    }

    protected updateActivity(): void {
        this.lastActivity = new Date();
    }

    protected validateConfig(): void {
        if (!this.config.database) {
            throw new Error('Database name is required');
        }
    }
}

// MongoDB client implementation
export class MongoDBClient extends BaseDatabaseClient {
    private client: MongoClient | null = null;
    private db: Db | null = null;

    constructor(connectionId: string, config: MongoConnectionConfig) {
        super(connectionId, config, 'mongodb');
    }

    async connect(): Promise<void> {
        try {
            this.validateConfig();

            const connectionString = this.buildConnectionString();
            const options = this.buildConnectionOptions();

            this.client = new MongoClient(connectionString, options);
            await this.client.connect();
            this.db = this.client.db(this.config.database);

            this.isConnected = true;
            this.connectionTime = new Date();
            this.clearError();
        } catch (error) {
            this.setError(`MongoDB connection failed: ${error}`);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.close();
                this.client = null;
                this.db = null;
            }
            this.isConnected = false;
            this.clearError();
        } catch (error) {
            this.setError(`MongoDB disconnect failed: ${error}`);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            if (!this.client || !this.db) {
                return false;
            }
            await this.db.admin().ping();
            this.updateActivity();
            return true;
        } catch (error) {
            this.setError(`MongoDB test connection failed: ${error}`);
            return false;
        }
    }

    async executeQuery(request: QueryRequest): Promise<QueryResult> {
        const startTime = Date.now();

        try {
            if (!this.db) {
                throw new Error('Not connected to MongoDB');
            }

            this.updateActivity();

            // Parse MongoDB query
            const query = this.parseMongoQuery(request.query);
            const collection = this.db.collection(query.collection);

            let data: any[] = [];
            let totalRows = 0;

            // Execute different types of MongoDB operations
            switch (query.operation) {
                case 'find':
                    const cursor = collection.find(query.filter || {});
                    if (request.limit) cursor.limit(request.limit);
                    if (request.offset) cursor.skip(request.offset);
                    data = await cursor.toArray();
                    totalRows = await collection.countDocuments(query.filter || {});
                    break;

                case 'aggregate':
                    data = await collection.aggregate(query.pipeline || []).toArray();
                    totalRows = data.length;
                    break;

                case 'count':
                    totalRows = await collection.countDocuments(query.filter || {});
                    data = [{ count: totalRows }];
                    break;

                default:
                    throw new Error(`Unsupported MongoDB operation: ${query.operation}`);
            }

            const executionTime = Date.now() - startTime;

            return {
                data,
                totalRows,
                executionTime,
                columns: this.extractMongoColumns(data),
                metadata: {
                    queryId: `mongo_${Date.now()}`,
                    cached: false
                }
            };
        } catch (error) {
            return {
                data: [],
                totalRows: 0,
                executionTime: Date.now() - startTime,
                columns: [],
                error: `MongoDB query execution failed: ${error}`
            };
        }
    }

    async getSchema(): Promise<any> {
        try {
            if (!this.db) {
                throw new Error('Not connected to MongoDB');
            }

            this.updateActivity();
            const collections = await this.db.listCollections().toArray();

            const schema = {
                database: this.config.database,
                collections: [] as any[]
            };

            for (const collection of collections) {
                const collectionInfo = {
                    name: collection.name,
                    type: collection.type || 'collection',
                    indexes: await this.db.collection(collection.name).indexes()
                };
                schema.collections.push(collectionInfo);
            }

            return schema;
        } catch (error) {
            this.setError(`Failed to get MongoDB schema: ${error}`);
            throw error;
        }
    }

    async getDatabases(): Promise<string[]> {
        try {
            if (!this.client) {
                throw new Error('Not connected to MongoDB');
            }

            this.updateActivity();
            const adminDb = this.client.db().admin();
            const result = await adminDb.listDatabases();
            return result.databases.map(db => db.name);
        } catch (error) {
            this.setError(`Failed to get MongoDB databases: ${error}`);
            throw error;
        }
    }

    async getTables(database?: string): Promise<string[]> {
        try {
            if (!this.client) {
                throw new Error('Not connected to MongoDB');
            }

            this.updateActivity();
            const db = database ? this.client.db(database) : this.db;
            if (!db) {
                throw new Error('No database selected');
            }

            const collections = await db.listCollections().toArray();
            return collections.map(collection => collection.name);
        } catch (error) {
            this.setError(`Failed to get MongoDB collections: ${error}`);
            throw error;
        }
    }

    private buildConnectionString(): string {
        const config = this.config as MongoConnectionConfig;

        if (config.connectionString) {
            return config.connectionString;
        }

        let connectionString = 'mongodb://';

        if (config.username && config.password) {
            connectionString += `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@`;
        }

        connectionString += `${config.host || 'localhost'}:${config.port || 27017}/${config.database}`;

        const params: string[] = [];
        if (config.authSource) params.push(`authSource=${config.authSource}`);
        if (config.replicaSet) params.push(`replicaSet=${config.replicaSet}`);
        if (config.ssl) params.push('ssl=true');

        if (params.length > 0) {
            connectionString += '?' + params.join('&');
        }

        return connectionString;
    }

    private buildConnectionOptions(): any {
        const config = this.config as MongoConnectionConfig;

        return {
            maxPoolSize: config.poolSize || 10,
            serverSelectionTimeoutMS: config.timeout || 5000,
            socketTimeoutMS: config.timeout || 0,
            connectTimeoutMS: config.timeout || 10000,
            retryWrites: true,
            readPreference: config.readPreference || 'primary'
        };
    }

    private parseMongoQuery(query: string): any {
        // Simple MongoDB query parsing
        // In a real implementation, this would be more sophisticated
        try {
            // Try to parse as JSON for aggregate operations
            if (query.trim().startsWith('[')) {
                return {
                    operation: 'aggregate',
                    collection: 'default', // Would need to be specified
                    pipeline: JSON.parse(query)
                };
            }

            // Try to parse as find operation
            if (query.includes('find(')) {
                const match = query.match(/(\w+)\.find\((.*?)\)/);
                if (match) {
                    return {
                        operation: 'find',
                        collection: match[1],
                        filter: match[2] ? JSON.parse(match[2]) : {}
                    };
                }
            }

            // Default to find operation
            return {
                operation: 'find',
                collection: 'default',
                filter: {}
            };
        } catch (error) {
            throw new Error(`Invalid MongoDB query: ${error}`);
        }
    }

    private extractMongoColumns(data: any[]): ColumnInfo[] {
        if (data.length === 0) return [];

        const firstDoc = data[0];
        const columns: ColumnInfo[] = [];

        for (const [key, value] of Object.entries(firstDoc)) {
            columns.push({
                name: key,
                type: this.getMongoFieldType(value),
                nullable: true,
                primaryKey: key === '_id'
            });
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
}

// MySQL client implementation
export class MySQLClient extends BaseDatabaseClient {
    private connection: mysql.Connection | null = null;

    constructor(connectionId: string, config: MySQLConnectionConfig) {
        super(connectionId, config, 'mysql');
    }

    async connect(): Promise<void> {
        try {
            this.validateConfig();

            const options = this.buildConnectionOptions();
            this.connection = await mysql.createConnection(options);

            this.isConnected = true;
            this.connectionTime = new Date();
            this.clearError();
        } catch (error) {
            this.setError(`MySQL connection failed: ${error}`);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.connection) {
                await this.connection.end();
                this.connection = null;
            }
            this.isConnected = false;
            this.clearError();
        } catch (error) {
            this.setError(`MySQL disconnect failed: ${error}`);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            if (!this.connection) {
                return false;
            }
            await this.connection.ping();
            this.updateActivity();
            return true;
        } catch (error) {
            this.setError(`MySQL test connection failed: ${error}`);
            return false;
        }
    }

    async executeQuery(request: QueryRequest): Promise<QueryResult> {
        const startTime = Date.now();

        try {
            if (!this.connection) {
                throw new Error('Not connected to MySQL');
            }

            this.updateActivity();

            const [rows, fields] = await this.connection.execute(
                request.query,
                request.parameters || []
            );

            const executionTime = Date.now() - startTime;

            return {
                data: Array.isArray(rows) ? rows : [],
                totalRows: Array.isArray(rows) ? rows.length : 0,
                executionTime,
                columns: this.extractMySQLColumns(fields as any[]),
                affectedRows: (rows as any).affectedRows || 0
            };
        } catch (error) {
            return {
                data: [],
                totalRows: 0,
                executionTime: Date.now() - startTime,
                columns: [],
                error: `MySQL query execution failed: ${error}`
            };
        }
    }

    async getSchema(): Promise<any> {
        try {
            if (!this.connection) {
                throw new Error('Not connected to MySQL');
            }

            this.updateActivity();
            const [tables] = await this.connection.execute(
                'SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
                [this.config.database]
            );

            return {
                database: this.config.database,
                tables: tables
            };
        } catch (error) {
            this.setError(`Failed to get MySQL schema: ${error}`);
            throw error;
        }
    }

    async getDatabases(): Promise<string[]> {
        try {
            if (!this.connection) {
                throw new Error('Not connected to MySQL');
            }

            this.updateActivity();
            const [rows] = await this.connection.execute('SHOW DATABASES');
            return (rows as any[]).map(row => row.Database);
        } catch (error) {
            this.setError(`Failed to get MySQL databases: ${error}`);
            throw error;
        }
    }

    async getTables(database?: string): Promise<string[]> {
        try {
            if (!this.connection) {
                throw new Error('Not connected to MySQL');
            }

            this.updateActivity();
            const dbName = database || this.config.database;
            const [rows] = await this.connection.execute(
                'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
                [dbName]
            );
            return (rows as any[]).map(row => row.TABLE_NAME);
        } catch (error) {
            this.setError(`Failed to get MySQL tables: ${error}`);
            throw error;
        }
    }

    private buildConnectionOptions(): mysql.ConnectionOptions {
        const config = this.config as MySQLConnectionConfig;

        return {
            host: config.host || 'localhost',
            port: config.port || 3306,
            user: config.username,
            password: config.password,
            database: config.database,
            ssl: config.ssl as any,
            charset: config.charset || 'utf8mb4',
            timezone: config.timezone || 'local',
            multipleStatements: config.multipleStatements || false,
            connectTimeout: config.timeout || 10000
        };
    }

    private extractMySQLColumns(fields: any[]): ColumnInfo[] {
        return fields.map(field => ({
            name: field.name,
            type: field.type,
            nullable: (field.flags & 1) === 0, // NOT_NULL flag
            primaryKey: (field.flags & 2) !== 0, // PRI_KEY flag
            autoIncrement: (field.flags & 512) !== 0, // AUTO_INCREMENT flag
            defaultValue: field.default,
            length: field.length,
            unsigned: (field.flags & 32) !== 0, // UNSIGNED flag
            zerofill: (field.flags & 64) !== 0 // ZEROFILL flag
        }));
    }
}

// PostgreSQL client implementation
export class PostgreSQLClient extends BaseDatabaseClient {
    private client: PgClient | null = null;

    constructor(connectionId: string, config: PostgreSQLConnectionConfig) {
        super(connectionId, config, 'postgresql');
    }

    async connect(): Promise<void> {
        try {
            this.validateConfig();

            const options = this.buildConnectionOptions();
            this.client = new PgClient(options);
            await this.client.connect();

            this.isConnected = true;
            this.connectionTime = new Date();
            this.clearError();
        } catch (error) {
            this.setError(`PostgreSQL connection failed: ${error}`);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.end();
                this.client = null;
            }
            this.isConnected = false;
            this.clearError();
        } catch (error) {
            this.setError(`PostgreSQL disconnect failed: ${error}`);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            if (!this.client) {
                return false;
            }
            await this.client.query('SELECT 1');
            this.updateActivity();
            return true;
        } catch (error) {
            this.setError(`PostgreSQL test connection failed: ${error}`);
            return false;
        }
    }

    async executeQuery(request: QueryRequest): Promise<QueryResult> {
        const startTime = Date.now();

        try {
            if (!this.client) {
                throw new Error('Not connected to PostgreSQL');
            }

            this.updateActivity();

            const result = await this.client.query(
                request.query,
                request.parameters || []
            );

            const executionTime = Date.now() - startTime;

            return {
                data: result.rows,
                totalRows: result.rowCount || 0,
                executionTime,
                columns: this.extractPostgreSQLColumns(result.fields),
                affectedRows: result.rowCount || 0
            };
        } catch (error) {
            return {
                data: [],
                totalRows: 0,
                executionTime: Date.now() - startTime,
                columns: [],
                error: `PostgreSQL query execution failed: ${error}`
            };
        }
    }

    async getSchema(): Promise<any> {
        try {
            if (!this.client) {
                throw new Error('Not connected to PostgreSQL');
            }

            this.updateActivity();
            const config = this.config as PostgreSQLConnectionConfig;
            const result = await this.client.query(`
                SELECT table_name, table_type 
                FROM information_schema.tables 
                WHERE table_schema = $1
            `, [config.schema || 'public']);

            return {
                database: this.config.database,
                schema: config.schema || 'public',
                tables: result.rows
            };
        } catch (error) {
            this.setError(`Failed to get PostgreSQL schema: ${error}`);
            throw error;
        }
    }

    async getDatabases(): Promise<string[]> {
        try {
            if (!this.client) {
                throw new Error('Not connected to PostgreSQL');
            }

            this.updateActivity();
            const result = await this.client.query(
                'SELECT datname FROM pg_database WHERE datistemplate = false'
            );
            return result.rows.map(row => row.datname);
        } catch (error) {
            this.setError(`Failed to get PostgreSQL databases: ${error}`);
            throw error;
        }
    }

    async getTables(database?: string): Promise<string[]> {
        try {
            if (!this.client) {
                throw new Error('Not connected to PostgreSQL');
            }

            this.updateActivity();
            const schema = (this.config as PostgreSQLConnectionConfig).schema || 'public';
            const result = await this.client.query(
                'SELECT tablename FROM pg_tables WHERE schemaname = $1',
                [schema]
            );
            return result.rows.map(row => row.tablename);
        } catch (error) {
            this.setError(`Failed to get PostgreSQL tables: ${error}`);
            throw error;
        }
    }

    private buildConnectionOptions(): any {
        const config = this.config as PostgreSQLConnectionConfig;

        return {
            host: config.host || 'localhost',
            port: config.port || 5432,
            user: config.username,
            password: config.password,
            database: config.database,
            ssl: config.ssl,
            application_name: config.applicationName || 'database-gui-client',
            statement_timeout: config.statement_timeout || 0,
            query_timeout: config.query_timeout || 0,
            connectionTimeoutMillis: config.timeout || 10000
        };
    }

    private extractPostgreSQLColumns(fields: any[]): ColumnInfo[] {
        return fields.map(field => ({
            name: field.name,
            type: this.mapPostgreSQLType(field.dataTypeID),
            nullable: true, // Would need to query information_schema for accurate info
            primaryKey: false, // Would need to query information_schema for accurate info
            defaultValue: undefined
        }));
    }

    private mapPostgreSQLType(dataTypeID: number): string {
        const typeMap: Record<number, string> = {
            16: 'boolean',
            20: 'bigint',
            21: 'smallint',
            23: 'integer',
            25: 'text',
            1043: 'varchar',
            1082: 'date',
            1114: 'timestamp',
            1184: 'timestamptz',
            700: 'real',
            701: 'double precision',
            1700: 'numeric'
        };

        return typeMap[dataTypeID] || 'unknown';
    }
}

// SQLite client implementation
export class SQLiteClient extends BaseDatabaseClient {
    private db: sqlite3.Database | null = null;

    constructor(connectionId: string, config: SQLiteConnectionConfig) {
        super(connectionId, config, 'sqlite');
    }

    async connect(): Promise<void> {
        try {
            this.validateConfig();

            const config = this.config as SQLiteConnectionConfig;
            if (!config.filePath) {
                throw new Error('SQLite file path is required');
            }

            const mode = this.getSQLiteMode(config.mode);

            this.db = await new Promise<sqlite3.Database>((resolve, reject) => {
                const database = new sqlite3.Database(config.filePath!, mode, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(database);
                    }
                });
            });

            // Set timeout if specified
            if (config.busyTimeout) {
                await this.runQuery(`PRAGMA busy_timeout = ${config.busyTimeout}`);
            }

            this.isConnected = true;
            this.connectionTime = new Date();
            this.clearError();
        } catch (error) {
            this.setError(`SQLite connection failed: ${error}`);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.db) {
                await new Promise<void>((resolve, reject) => {
                    this.db!.close((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
                this.db = null;
            }
            this.isConnected = false;
            this.clearError();
        } catch (error) {
            this.setError(`SQLite disconnect failed: ${error}`);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            if (!this.db) {
                return false;
            }
            await this.runQuery('SELECT 1');
            this.updateActivity();
            return true;
        } catch (error) {
            this.setError(`SQLite test connection failed: ${error}`);
            return false;
        }
    }

    async executeQuery(request: QueryRequest): Promise<QueryResult> {
        const startTime = Date.now();

        try {
            if (!this.db) {
                throw new Error('Not connected to SQLite');
            }

            this.updateActivity();

            const query = request.query.trim().toLowerCase();
            const isSelect = query.startsWith('select') || query.startsWith('pragma');

            let rows: any[] = [];
            let affectedRows = 0;

            if (isSelect) {
                rows = await this.allQuery(request.query, request.parameters || []);
            } else {
                const result = await this.runQuery(request.query, request.parameters || []);
                affectedRows = result.changes || 0;
            }

            const executionTime = Date.now() - startTime;

            return {
                data: rows,
                totalRows: rows.length,
                executionTime,
                columns: this.extractSQLiteColumns(rows),
                affectedRows
            };
        } catch (error) {
            return {
                data: [],
                totalRows: 0,
                executionTime: Date.now() - startTime,
                columns: [],
                error: `SQLite query execution failed: ${error}`
            };
        }
    }

    async getSchema(): Promise<any> {
        try {
            if (!this.db) {
                throw new Error('Not connected to SQLite');
            }

            this.updateActivity();
            const tables = await this.allQuery(
                "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name"
            );

            return {
                database: this.config.database,
                tables: tables
            };
        } catch (error) {
            this.setError(`Failed to get SQLite schema: ${error}`);
            throw error;
        }
    }

    async getDatabases(): Promise<string[]> {
        // SQLite doesn't have multiple databases in the same file
        return [this.config.database];
    }

    async getTables(database?: string): Promise<string[]> {
        try {
            if (!this.db) {
                throw new Error('Not connected to SQLite');
            }

            this.updateActivity();
            const rows = await this.allQuery(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            );
            return rows.map(row => row.name);
        } catch (error) {
            this.setError(`Failed to get SQLite tables: ${error}`);
            throw error;
        }
    }

    private getSQLiteMode(mode?: string): number {
        switch (mode) {
            case 'ro': return sqlite3.OPEN_READONLY;
            case 'rw': return sqlite3.OPEN_READWRITE;
            case 'rwc': return sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
            default: return sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
        }
    }

    private async runQuery(sql: string, params: any[] = []): Promise<{ changes: number; lastID: number }> {
        return new Promise((resolve, reject) => {
            this.db!.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        });
    }

    private async allQuery(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db!.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    private extractSQLiteColumns(rows: any[]): ColumnInfo[] {
        if (rows.length === 0) return [];

        const firstRow = rows[0];
        const columns: ColumnInfo[] = [];

        for (const [key, value] of Object.entries(firstRow)) {
            columns.push({
                name: key,
                type: this.getSQLiteType(value),
                nullable: true,
                primaryKey: false // Would need PRAGMA table_info for accurate info
            });
        }

        return columns;
    }

    private getSQLiteType(value: any): string {
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'INTEGER' : 'REAL';
        }
        if (typeof value === 'string') return 'TEXT';
        if (typeof value === 'boolean') return 'INTEGER'; // SQLite stores booleans as integers
        if (value instanceof Buffer) return 'BLOB';
        return 'TEXT';
    }
}

// Factory function to create appropriate database client
export function createDatabaseClient(
    connectionId: string,
    config: DatabaseSpecificConnectionConfig
): BaseDatabaseClient {
    switch (config.type) {
        case 'mongodb':
            return new MongoDBClient(connectionId, config);
        case 'mysql':
            return new MySQLClient(connectionId, config);
        case 'postgresql':
            return new PostgreSQLClient(connectionId, config);
        case 'sqlite':
            return new SQLiteClient(connectionId, config);
        default:
            throw new Error(`Unsupported database type: ${(config as any).type}`);
    }
}

// Connection manager class with pooling and validation
export class DatabaseConnectionService {
    private clients: Map<string, BaseDatabaseClient> = new Map();
    private connectionPools: Map<DatabaseType, ConnectionPool> = new Map();
    private maxConnectionsPerType = 10;

    constructor() {
        // Initialize connection pools for each database type
        const dbTypes: DatabaseType[] = ['mongodb', 'mysql', 'postgresql', 'sqlite'];
        dbTypes.forEach(type => {
            this.connectionPools.set(type, {
                connections: new Map(),
                maxConnections: this.maxConnectionsPerType,
                activeConnections: 0
            });
        });
    }

    async createConnection(
        connectionId: string,
        config: DatabaseSpecificConnectionConfig
    ): Promise<DatabaseConnection> {
        try {
            // Check connection pool limits
            const pool = this.connectionPools.get(config.type);
            if (pool && pool.activeConnections >= pool.maxConnections) {
                throw new Error(`Maximum connections reached for ${config.type}`);
            }

            const client = createDatabaseClient(connectionId, config);

            await client.connect();
            this.clients.set(connectionId, client);

            // Update pool count
            if (pool) {
                pool.activeConnections++;
                pool.connections.set(connectionId, client);
            }

            return {
                id: connectionId,
                type: config.type,
                config,
                status: 'connected',
                lastConnected: new Date(),
                metadata: {
                    capabilities: client.getCapabilities().supportsTransactions ? ['transactions'] : []
                }
            };
        } catch (error) {
            return {
                id: connectionId,
                type: config.type,
                config,
                status: 'error',
                error: `Connection failed: ${error}`
            };
        }
    }

    async testConnection(config: DatabaseSpecificConnectionConfig): Promise<boolean> {
        const tempClient = createDatabaseClient('temp', config);

        try {
            await tempClient.connect();
            const result = await tempClient.testConnection();
            await tempClient.disconnect();
            return result;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    async executeQuery(connectionId: string, request: QueryRequest): Promise<QueryResult> {
        const client = this.clients.get(connectionId);

        if (!client) {
            return {
                data: [],
                totalRows: 0,
                executionTime: 0,
                columns: [],
                error: `Connection ${connectionId} not found`
            };
        }

        // Validate connection is still active
        if (client.getConnectionStatus() !== 'connected') {
            return {
                data: [],
                totalRows: 0,
                executionTime: 0,
                columns: [],
                error: `Connection ${connectionId} is not active`
            };
        }

        return await client.executeQuery(request);
    }

    async getSchema(connectionId: string): Promise<any> {
        const client = this.clients.get(connectionId);

        if (!client) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        return await client.getSchema();
    }

    async getDatabases(connectionId: string): Promise<string[]> {
        const client = this.clients.get(connectionId);

        if (!client) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        return await client.getDatabases();
    }

    async getTables(connectionId: string, database?: string): Promise<string[]> {
        const client = this.clients.get(connectionId);

        if (!client) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        return await client.getTables(database);
    }

    async disconnect(connectionId: string): Promise<void> {
        const client = this.clients.get(connectionId);

        if (client) {
            const dbType = client['type'] as DatabaseType;
            const pool = this.connectionPools.get(dbType);

            await client.disconnect();
            this.clients.delete(connectionId);

            // Update pool count
            if (pool) {
                pool.activeConnections = Math.max(0, pool.activeConnections - 1);
                pool.connections.delete(connectionId);
            }
        }
    }

    async disconnectAll(): Promise<void> {
        const disconnectPromises = Array.from(this.clients.values()).map(client =>
            client.disconnect().catch(error => console.error('Error disconnecting client:', error))
        );

        await Promise.all(disconnectPromises);
        this.clients.clear();

        // Reset all pools
        this.connectionPools.forEach(pool => {
            pool.activeConnections = 0;
            pool.connections.clear();
        });
    }

    getConnectionStatus(connectionId: string): 'connected' | 'disconnected' | 'error' | undefined {
        const client = this.clients.get(connectionId);
        return client?.getConnectionStatus();
    }

    getActiveConnections(): string[] {
        return Array.from(this.clients.keys());
    }

    getConnectionInfo(connectionId: string): any {
        const client = this.clients.get(connectionId);
        if (!client) return null;

        return {
            id: connectionId,
            type: client['type'],
            status: client.getConnectionStatus(),
            error: client.getLastError(),
            ...client.getConnectionInfo()
        };
    }

    getPoolStats(): Record<DatabaseType, { active: number; max: number }> {
        const stats: Record<string, { active: number; max: number }> = {};

        this.connectionPools.forEach((pool, type) => {
            stats[type] = {
                active: pool.activeConnections,
                max: pool.maxConnections
            };
        });

        return stats as Record<DatabaseType, { active: number; max: number }>;
    }

    // Health check for all connections
    async healthCheck(): Promise<Record<string, boolean>> {
        const results: Record<string, boolean> = {};

        const healthPromises = Array.from(this.clients.entries()).map(async ([id, client]) => {
            try {
                const isHealthy = await client.testConnection();
                results[id] = isHealthy;
            } catch (error) {
                results[id] = false;
            }
        });

        await Promise.all(healthPromises);
        return results;
    }
}