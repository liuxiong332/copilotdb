import type { DatabaseType, QueryResult, ApiResponse } from '@database-gui/types';

// Utility functions
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    }
    const seconds = milliseconds / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(2)}s`;
    }
    const minutes = seconds / 60;
    return `${minutes.toFixed(2)}m`;
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
};

export const truncateString = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
};

export const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await sleep(delay);
            return retry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const parseConnectionString = (connectionString: string, type: DatabaseType) => {
    // Basic connection string parsing - can be enhanced based on database type
    const url = new URL(connectionString);
    return {
        host: url.hostname,
        port: url.port ? parseInt(url.port) : undefined,
        database: url.pathname.substring(1),
        username: url.username,
        password: url.password,
        ssl: url.searchParams.get('ssl') === 'true'
    };
};

export const buildConnectionString = (config: any, type: DatabaseType): string => {
    const { host, port, database, username, password, ssl } = config;

    switch (type) {
        case 'postgresql':
            return `postgresql://${username}:${password}@${host}:${port}/${database}${ssl ? '?ssl=true' : ''}`;
        case 'mysql':
            return `mysql://${username}:${password}@${host}:${port}/${database}${ssl ? '?ssl=true' : ''}`;
        case 'mongodb':
            return `mongodb://${username}:${password}@${host}:${port}/${database}${ssl ? '?ssl=true' : ''}`;
        case 'sqlite':
            return `sqlite://${config.filePath}`;
        default:
            throw new Error(`Unsupported database type: ${type}`);
    }
};

export const sanitizeQuery = (query: string): string => {
    // Basic query sanitization - remove dangerous patterns
    return query
        .replace(/--.*$/gm, '') // Remove SQL comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .trim();
};

export const extractTableNames = (query: string): string[] => {
    // Basic table name extraction from SQL queries
    const tableRegex = /(?:FROM|JOIN|INTO|UPDATE)\s+([`"]?)(\w+)\1/gi;
    const matches = [];
    let match;

    while ((match = tableRegex.exec(query)) !== null) {
        matches.push(match[2]);
    }

    return [...new Set(matches)]; // Remove duplicates
};

export const createApiResponse = <T>(
    success: boolean,
    data?: T,
    error?: string,
    message?: string
): ApiResponse<T> => {
    return {
        success,
        data,
        error: error ? { code: 'UNKNOWN', message: error } : undefined,
        message,
        timestamp: new Date().toISOString()
    };
};

export const handleApiError = (error: any): ApiResponse => {
    console.error('API Error:', error);

    return {
        success: false,
        error: {
            code: error.code || 'INTERNAL_SERVER_ERROR',
            message: error.message || 'An unexpected error occurred',
            details: error.details
        },
        timestamp: new Date().toISOString()
    };
};