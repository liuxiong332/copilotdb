// Database type definitions
export type DatabaseType = 'mongodb' | 'mysql' | 'postgresql' | 'sqlite';

export interface DatabaseConnection {
    id: string;
    type: DatabaseType;
    config: ConnectionConfig;
    status: 'connected' | 'disconnected' | 'error' | 'connecting';
    lastConnected?: Date;
    error?: string;
}

export interface ConnectionConfig {
    host?: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    filePath?: string; // for SQLite
    connectionString?: string; // alternative connection method
    options?: Record<string, any>; // database-specific options
}

export interface DatabaseInfo {
    name: string;
    type: DatabaseType;
    version?: string;
    size?: number;
    tables?: number;
    collections?: number;
}