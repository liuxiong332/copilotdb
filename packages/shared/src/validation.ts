import type { ConnectionConfig, DatabaseType } from '@database-gui/types';
import type { 
    MongoConnectionConfig, 
    MySQLConnectionConfig, 
    PostgreSQLConnectionConfig, 
    SQLiteConnectionConfig,
    DatabaseSpecificConnectionConfig
} from '@database-gui/types';
import { isValidEmail, isValidUrl } from './utils';
import { DEFAULT_PORTS, CONNECTION_STRING_PATTERNS } from '@database-gui/types';

// Validation functions
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validateConnectionConfig = (config: ConnectionConfig, type: DatabaseType): ValidationResult => {
    const errors: string[] = [];

    // Common validations
    if (!config.database || config.database.trim() === '') {
        errors.push('Database name is required');
    }

    // Validate connection string if provided
    if (config.connectionString) {
        const pattern = CONNECTION_STRING_PATTERNS[type];
        if (!pattern.test(config.connectionString)) {
            errors.push(`Invalid connection string format for ${type}`);
        }
        // If connection string is valid, skip other validations
        return { isValid: errors.length === 0, errors };
    }

    // Type-specific validations
    switch (type) {
        case 'sqlite':
            errors.push(...validateSQLiteConfig(config as SQLiteConnectionConfig));
            break;
        case 'mongodb':
            errors.push(...validateMongoConfig(config as MongoConnectionConfig));
            break;
        case 'mysql':
            errors.push(...validateMySQLConfig(config as MySQLConnectionConfig));
            break;
        case 'postgresql':
            errors.push(...validatePostgreSQLConfig(config as PostgreSQLConnectionConfig));
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateSQLiteConfig = (config: SQLiteConnectionConfig): string[] => {
    const errors: string[] = [];

    if (!config.filePath || config.filePath.trim() === '') {
        errors.push('File path is required for SQLite');
    } else {
        // Validate file extension
        if (!config.filePath.endsWith('.db') && !config.filePath.endsWith('.sqlite') && !config.filePath.endsWith('.sqlite3')) {
            errors.push('SQLite file should have .db, .sqlite, or .sqlite3 extension');
        }
    }

    // Validate mode
    if (config.mode && !['ro', 'rw', 'rwc', 'memory'].includes(config.mode)) {
        errors.push('SQLite mode must be one of: ro, rw, rwc, memory');
    }

    // Validate cache
    if (config.cache && !['shared', 'private'].includes(config.cache)) {
        errors.push('SQLite cache must be either shared or private');
    }

    // Validate timeout
    if (config.timeout && config.timeout < 0) {
        errors.push('Timeout must be a positive number');
    }

    return errors;
};

export const validateMongoConfig = (config: MongoConnectionConfig): string[] => {
    const errors: string[] = [];

    if (!config.host || config.host.trim() === '') {
        errors.push('Host is required for MongoDB');
    }

    // Port validation
    const port = config.port || DEFAULT_PORTS.mongodb;
    if (port < 1 || port > 65535) {
        errors.push('Port must be between 1 and 65535');
    }

    // Username/password validation (optional for MongoDB)
    if (config.username && !config.password) {
        errors.push('Password is required when username is provided');
    }

    // Validate read preference
    if (config.readPreference && !['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'].includes(config.readPreference)) {
        errors.push('Invalid read preference for MongoDB');
    }

    return errors;
};

export const validateMySQLConfig = (config: MySQLConnectionConfig): string[] => {
    const errors: string[] = [];

    if (!config.host || config.host.trim() === '') {
        errors.push('Host is required for MySQL');
    }

    // Port validation
    const port = config.port || DEFAULT_PORTS.mysql;
    if (port < 1 || port > 65535) {
        errors.push('Port must be between 1 and 65535');
    }

    if (!config.username || config.username.trim() === '') {
        errors.push('Username is required for MySQL');
    }

    if (!config.password || config.password.trim() === '') {
        errors.push('Password is required for MySQL');
    }

    // Validate charset
    if (config.charset && !/^[a-zA-Z0-9_]+$/.test(config.charset)) {
        errors.push('Invalid charset format');
    }

    // Validate timeout
    if (config.acquireTimeout && config.acquireTimeout < 0) {
        errors.push('Acquire timeout must be a positive number');
    }

    return errors;
};

export const validatePostgreSQLConfig = (config: PostgreSQLConnectionConfig): string[] => {
    const errors: string[] = [];

    if (!config.host || config.host.trim() === '') {
        errors.push('Host is required for PostgreSQL');
    }

    // Port validation
    const port = config.port || DEFAULT_PORTS.postgresql;
    if (port < 1 || port > 65535) {
        errors.push('Port must be between 1 and 65535');
    }

    if (!config.username || config.username.trim() === '') {
        errors.push('Username is required for PostgreSQL');
    }

    if (!config.password || config.password.trim() === '') {
        errors.push('Password is required for PostgreSQL');
    }

    // Validate schema name
    if (config.schema && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(config.schema)) {
        errors.push('Invalid schema name format');
    }

    // Validate timeouts
    if (config.statement_timeout && config.statement_timeout < 0) {
        errors.push('Statement timeout must be a positive number');
    }

    if (config.query_timeout && config.query_timeout < 0) {
        errors.push('Query timeout must be a positive number');
    }

    return errors;
};

// Enhanced connection config validation with detailed error reporting
export const validateConnectionConfigDetailed = (config: DatabaseSpecificConnectionConfig): ValidationResult => {
    const errors: string[] = [];
    const type = config.type;

    // Common validations
    if (!config.database || config.database.trim() === '') {
        errors.push('Database name is required');
    }

    // Pool size validation
    if (config.poolSize !== undefined) {
        if (config.poolSize < 1 || config.poolSize > 100) {
            errors.push('Pool size must be between 1 and 100');
        }
    }

    // Timeout validation
    if (config.timeout !== undefined) {
        if (config.timeout < 1000 || config.timeout > 300000) {
            errors.push('Timeout must be between 1000ms and 300000ms (5 minutes)');
        }
    }

    // Retry attempts validation
    if (config.retryAttempts !== undefined) {
        if (config.retryAttempts < 0 || config.retryAttempts > 10) {
            errors.push('Retry attempts must be between 0 and 10');
        }
    }

    // Type-specific validations
    switch (type) {
        case 'sqlite':
            errors.push(...validateSQLiteConfig(config));
            break;
        case 'mongodb':
            errors.push(...validateMongoConfig(config));
            break;
        case 'mysql':
            errors.push(...validateMySQLConfig(config));
            break;
        case 'postgresql':
            errors.push(...validatePostgreSQLConfig(config));
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateEmail = (email: string): ValidationResult => {
    const errors: string[] = [];

    if (!email || email.trim() === '') {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validatePassword = (password: string): ValidationResult => {
    const errors: string[] = [];

    if (!password || password.trim() === '') {
        errors.push('Password is required');
    } else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateQuery = (query: string, type: DatabaseType): ValidationResult => {
    const errors: string[] = [];

    if (!query || query.trim() === '') {
        errors.push('Query cannot be empty');
    }

    const trimmedQuery = query.trim().toLowerCase();

    // Check for dangerous operations
    const dangerousPatterns = [
        /drop\s+database/i,
        /drop\s+table/i,
        /truncate\s+table/i,
        /delete\s+from.*where\s*$/i, // DELETE without WHERE clause
        /update.*set.*where\s*$/i // UPDATE without WHERE clause
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(query)) {
            errors.push('Query contains potentially dangerous operations');
            break;
        }
    }

    // Type-specific validations
    switch (type) {
        case 'mongodb':
            // Basic MongoDB query validation
            if (!trimmedQuery.includes('db.') && !trimmedQuery.includes('use ')) {
                errors.push('MongoDB queries should start with db. or use statement');
            }
            break;

        case 'mysql':
        case 'postgresql':
        case 'sqlite':
            // Basic SQL validation
            const sqlKeywords = ['select', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'show', 'describe', 'explain'];
            const startsWithKeyword = sqlKeywords.some(keyword =>
                trimmedQuery.startsWith(keyword)
            );

            if (!startsWithKeyword) {
                errors.push('SQL queries should start with a valid SQL keyword');
            }
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateUrl = (url: string): ValidationResult => {
    const errors: string[] = [];

    if (!url || url.trim() === '') {
        errors.push('URL is required');
    } else if (!isValidUrl(url)) {
        errors.push('Please enter a valid URL');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
    const errors: string[] = [];

    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${fieldName} is required`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateLength = (value: string, min: number, max: number, fieldName: string): ValidationResult => {
    const errors: string[] = [];

    if (value.length < min) {
        errors.push(`${fieldName} must be at least ${min} characters long`);
    }

    if (value.length > max) {
        errors.push(`${fieldName} must be no more than ${max} characters long`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateNumber = (value: any, min?: number, max?: number, fieldName?: string): ValidationResult => {
    const errors: string[] = [];
    const name = fieldName || 'Value';

    if (isNaN(value) || typeof value !== 'number') {
        errors.push(`${name} must be a valid number`);
        return { isValid: false, errors };
    }

    if (min !== undefined && value < min) {
        errors.push(`${name} must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
        errors.push(`${name} must be no more than ${max}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};