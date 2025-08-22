// Database-specific type definitions

import { DatabaseType, ConnectionConfig } from './database';

// MongoDB specific types
export interface MongoConnectionConfig extends ConnectionConfig {
    type: 'mongodb';
    authSource?: string;
    replicaSet?: string;
    readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
    ssl?: boolean;
    sslValidate?: boolean;
    sslCA?: string;
    sslCert?: string;
    sslKey?: string;
}

export interface MongoQueryResult {
    documents: any[];
    totalCount: number;
    executionStats?: {
        totalDocsExamined: number;
        totalKeysExamined: number;
        executionTimeMillis: number;
        indexesUsed: string[];
    };
}

// MySQL specific types
export interface MySQLConnectionConfig extends ConnectionConfig {
    type: 'mysql';
    charset?: string;
    timezone?: string;
    acquireTimeout?: number;
    ssl?: {
        ca?: string;
        cert?: string;
        key?: string;
        rejectUnauthorized?: boolean;
    } | boolean;
    multipleStatements?: boolean;
}

export interface MySQLQueryResult {
    rows: any[];
    fields: MySQLFieldInfo[];
    affectedRows: number;
    insertId?: number;
    warningCount: number;
}

export interface MySQLFieldInfo {
    name: string;
    type: string;
    length: number;
    flags: number;
    decimals: number;
    default?: any;
}

// PostgreSQL specific types
export interface PostgreSQLConnectionConfig extends ConnectionConfig {
    type: 'postgresql';
    schema?: string;
    applicationName?: string;
    ssl?: {
        rejectUnauthorized?: boolean;
        ca?: string;
        cert?: string;
        key?: string;
    } | boolean;
    statement_timeout?: number;
    query_timeout?: number;
}

export interface PostgreSQLQueryResult {
    rows: any[];
    fields: PostgreSQLFieldInfo[];
    rowCount: number;
    command: string;
    oid?: number;
}

export interface PostgreSQLFieldInfo {
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
}

// SQLite specific types
export interface SQLiteConnectionConfig extends ConnectionConfig {
    type: 'sqlite';
    filePath: string;
    mode?: 'ro' | 'rw' | 'rwc' | 'memory';
    cache?: 'shared' | 'private';
    timeout?: number;
    busyTimeout?: number;
}

export interface SQLiteQueryResult {
    rows: any[];
    changes: number;
    lastInsertRowid?: number;
    totalChanges: number;
}

// Union types for type-safe database operations
export type DatabaseSpecificConnectionConfig = 
    | MongoConnectionConfig 
    | MySQLConnectionConfig 
    | PostgreSQLConnectionConfig 
    | SQLiteConnectionConfig;

export type DatabaseSpecificQueryResult = 
    | MongoQueryResult 
    | MySQLQueryResult 
    | PostgreSQLQueryResult 
    | SQLiteQueryResult;

// Database capability definitions
export interface DatabaseCapabilities {
    supportsTransactions: boolean;
    supportsJoins: boolean;
    supportsIndexes: boolean;
    supportsViews: boolean;
    supportsStoredProcedures: boolean;
    supportsTriggers: boolean;
    supportsFullTextSearch: boolean;
    supportsJSON: boolean;
    supportsArrays: boolean;
    maxConnections?: number;
    maxQueryLength?: number;
}

export const DATABASE_CAPABILITIES: Record<DatabaseType, DatabaseCapabilities> = {
    mongodb: {
        supportsTransactions: true,
        supportsJoins: true, // via $lookup
        supportsIndexes: true,
        supportsViews: true,
        supportsStoredProcedures: false,
        supportsTriggers: true, // via change streams
        supportsFullTextSearch: true,
        supportsJSON: true,
        supportsArrays: true,
        maxConnections: 1000,
    },
    mysql: {
        supportsTransactions: true,
        supportsJoins: true,
        supportsIndexes: true,
        supportsViews: true,
        supportsStoredProcedures: true,
        supportsTriggers: true,
        supportsFullTextSearch: true,
        supportsJSON: true,
        supportsArrays: false,
        maxConnections: 151,
        maxQueryLength: 1048576, // 1MB
    },
    postgresql: {
        supportsTransactions: true,
        supportsJoins: true,
        supportsIndexes: true,
        supportsViews: true,
        supportsStoredProcedures: true,
        supportsTriggers: true,
        supportsFullTextSearch: true,
        supportsJSON: true,
        supportsArrays: true,
        maxConnections: 100,
    },
    sqlite: {
        supportsTransactions: true,
        supportsJoins: true,
        supportsIndexes: true,
        supportsViews: true,
        supportsStoredProcedures: false,
        supportsTriggers: true,
        supportsFullTextSearch: true,
        supportsJSON: true,
        supportsArrays: false,
        maxConnections: 1, // SQLite is single-writer
        maxQueryLength: 1000000,
    },
};

// Default port numbers for each database type
export const DEFAULT_PORTS: Record<DatabaseType, number> = {
    mongodb: 27017,
    mysql: 3306,
    postgresql: 5432,
    sqlite: 0, // Not applicable for file-based database
};

// Connection string patterns for validation
export const CONNECTION_STRING_PATTERNS: Record<DatabaseType, RegExp> = {
    mongodb: /^mongodb(\+srv)?:\/\/.*$/,
    mysql: /^mysql:\/\/.*$/,
    postgresql: /^postgres(ql)?:\/\/.*$/,
    sqlite: /^sqlite:\/\/.*$|^file:.*\.db$/,
};