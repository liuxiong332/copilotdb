// Database type definitions
export type DatabaseType = 'mongodb' | 'mysql' | 'postgresql' | 'sqlite';

export interface DatabaseConnection {
    id: string;
    type: DatabaseType;
    config: ConnectionConfig;
    status: 'connected' | 'disconnected' | 'error' | 'connecting';
    lastConnected?: Date;
    error?: string;
    metadata?: {
        version?: string;
        serverInfo?: Record<string, any>;
        capabilities?: string[];
    };
}

export interface ConnectionConfig {
    // Common fields
    host?: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    ssl?: boolean | Record<string, any>;
    
    // SQLite specific
    filePath?: string;
    
    // Alternative connection methods
    connectionString?: string;
    
    // Database-specific options
    options?: DatabaseSpecificOptions;
    
    // Connection pool settings
    poolSize?: number;
    timeout?: number;
    retryAttempts?: number;
}

export interface DatabaseSpecificOptions {
    // MongoDB options
    authSource?: string;
    replicaSet?: string;
    readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
    
    // MySQL options
    charset?: string;
    timezone?: string;
    acquireTimeout?: number;
    
    // PostgreSQL options
    schema?: string;
    applicationName?: string;
    
    // SQLite options
    mode?: 'ro' | 'rw' | 'rwc' | 'memory';
    cache?: 'shared' | 'private';
    
    // Generic options
    [key: string]: any;
}

export interface DatabaseInfo {
    name: string;
    type: DatabaseType;
    version?: string;
    size?: number;
    tables?: number;
    collections?: number;
    charset?: string;
    collation?: string;
}