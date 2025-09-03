// API response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
    timestamp: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
    stack?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

export interface EdgeFunctionResponse<T = any> {
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration
export interface RequestConfig {
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    retries?: number;
}

// WebSocket message types
export interface WebSocketMessage {
    type: string;
    payload: any;
    timestamp: string;
    id?: string;
}

export interface RealtimeEvent {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    schema: string;
    table: string;
    new?: Record<string, any>;
    old?: Record<string, any>;
    timestamp: string;
}