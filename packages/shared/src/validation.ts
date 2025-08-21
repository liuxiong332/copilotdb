import type { ConnectionConfig, DatabaseType } from '@database-gui/types';
import { isValidEmail, isValidUrl } from './utils';

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

    // Type-specific validations
    switch (type) {
        case 'sqlite':
            if (!config.filePath || config.filePath.trim() === '') {
                errors.push('File path is required for SQLite');
            }
            break;

        case 'mongodb':
        case 'mysql':
        case 'postgresql':
            if (!config.host || config.host.trim() === '') {
                errors.push('Host is required');
            }

            if (config.port && (config.port < 1 || config.port > 65535)) {
                errors.push('Port must be between 1 and 65535');
            }

            if (!config.username || config.username.trim() === '') {
                errors.push('Username is required');
            }

            if (!config.password || config.password.trim() === '') {
                errors.push('Password is required');
            }
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