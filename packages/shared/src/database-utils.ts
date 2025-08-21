import type { DatabaseType, ConnectionConfig, QueryResult } from '@database-gui/types';
import { DATABASE_TYPES } from './constants';

// Database-specific utility functions
export const getDatabaseIcon = (type: DatabaseType): string => {
    return DATABASE_TYPES[type]?.icon || '💾';
};

export const getDatabaseName = (type: DatabaseType): string => {
    return DATABASE_TYPES[type]?.name || type;
};

export const getDefaultPort = (type: DatabaseType): number => {
    return DATABASE_TYPES[type]?.defaultPort || 0;
};

export const buildConnectionUrl = (config: ConnectionConfig, type: DatabaseType): string => {
    switch (type) {
        case 'postgresql':
            return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
        case 'mysql':
            return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
        case 'mongodb':
            return `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
        case 'sqlite':
            return `sqlite://${config.filePath}`;
        default:
            throw new Error(`Unsupported database type: ${type}`);
    }
};

export const parseConnectionUrl = (url: string): { type: DatabaseType; config: ConnectionConfig } => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.replace(':', '');

    let type: DatabaseType;
    switch (protocol) {
        case 'postgresql':
        case 'postgres':
            type = 'postgresql';
            break;
        case 'mysql':
            type = 'mysql';
            break;
        case 'mongodb':
        case 'mongo':
            type = 'mongodb';
            break;
        case 'sqlite':
            type = 'sqlite';
            break;
        default:
            throw new Error(`Unsupported protocol: ${protocol}`);
    }

    const config: ConnectionConfig = {
        database: urlObj.pathname.substring(1),
        host: urlObj.hostname,
        port: urlObj.port ? parseInt(urlObj.port) : getDefaultPort(type),
        username: urlObj.username,
        password: urlObj.password,
        ssl: urlObj.searchParams.get('ssl') === 'true'
    };

    if (type === 'sqlite') {
        config.filePath = urlObj.pathname;
    }

    return { type, config };
};

export const getSampleQuery = (type: DatabaseType, tableName?: string): string => {
    const table = tableName || 'your_table';

    switch (type) {
        case 'mongodb':
            return `db.${table}.find().limit(10)`;
        case 'mysql':
        case 'postgresql':
        case 'sqlite':
            return `SELECT * FROM ${table} LIMIT 10;`;
        default:
            return 'SELECT 1;';
    }
};

export const getExplainQuery = (query: string, type: DatabaseType): string => {
    switch (type) {
        case 'postgresql':
            return `EXPLAIN ANALYZE ${query}`;
        case 'mysql':
            return `EXPLAIN ${query}`;
        case 'sqlite':
            return `EXPLAIN QUERY PLAN ${query}`;
        case 'mongodb':
            // MongoDB explain is handled differently in the query itself
            return query.replace(/\.find\(/, '.find(').replace(/\)$/, ').explain()');
        default:
            return query;
    }
};

export const formatQueryResult = (result: any, type: DatabaseType): QueryResult => {
    // This is a basic formatter - actual implementation would be more sophisticated
    const baseResult: QueryResult = {
        data: [],
        totalRows: 0,
        executionTime: 0,
        columns: []
    };

    if (!result) {
        return baseResult;
    }

    switch (type) {
        case 'mongodb':
            return {
                ...baseResult,
                data: Array.isArray(result) ? result : [result],
                totalRows: Array.isArray(result) ? result.length : 1,
                columns: [] // MongoDB doesn't have fixed columns
            };

        case 'mysql':
        case 'postgresql':
        case 'sqlite':
            if (result.rows) {
                return {
                    ...baseResult,
                    data: result.rows,
                    totalRows: result.rowCount || result.rows.length,
                    columns: result.fields ? result.fields.map((field: any) => ({
                        name: field.name,
                        type: field.dataTypeID || field.type || 'unknown',
                        nullable: true,
                        primaryKey: false
                    })) : []
                };
            }
            break;
    }

    return baseResult;
};

export const isSelectQuery = (query: string): boolean => {
    const trimmed = query.trim().toLowerCase();
    return trimmed.startsWith('select') ||
        trimmed.startsWith('show') ||
        trimmed.startsWith('describe') ||
        trimmed.startsWith('explain') ||
        (trimmed.includes('db.') && trimmed.includes('.find'));
};

export const isModifyingQuery = (query: string): boolean => {
    const trimmed = query.trim().toLowerCase();
    return trimmed.startsWith('insert') ||
        trimmed.startsWith('update') ||
        trimmed.startsWith('delete') ||
        trimmed.startsWith('create') ||
        trimmed.startsWith('alter') ||
        trimmed.startsWith('drop') ||
        (trimmed.includes('db.') && (
            trimmed.includes('.insert') ||
            trimmed.includes('.update') ||
            trimmed.includes('.delete') ||
            trimmed.includes('.drop')
        ));
};

export const extractTableFromQuery = (query: string, type: DatabaseType): string | null => {
    const trimmed = query.trim();

    switch (type) {
        case 'mongodb':
            const mongoMatch = trimmed.match(/db\.(\w+)\./);
            return mongoMatch ? mongoMatch[1] : null;

        case 'mysql':
        case 'postgresql':
        case 'sqlite':
            // Simple regex to extract table name from SQL queries
            const sqlMatch = trimmed.match(/(?:FROM|INTO|UPDATE|JOIN)\s+([`"]?)(\w+)\1/i);
            return sqlMatch ? sqlMatch[2] : null;

        default:
            return null;
    }
};

export const validateDatabaseType = (type: string): type is DatabaseType => {
    return ['mongodb', 'mysql', 'postgresql', 'sqlite'].includes(type);
};

export const getDatabaseTypeFromConnectionString = (connectionString: string): DatabaseType | null => {
    const protocol = connectionString.split('://')[0].toLowerCase();

    switch (protocol) {
        case 'postgresql':
        case 'postgres':
            return 'postgresql';
        case 'mysql':
            return 'mysql';
        case 'mongodb':
        case 'mongo':
            return 'mongodb';
        case 'sqlite':
            return 'sqlite';
        default:
            return null;
    }
};