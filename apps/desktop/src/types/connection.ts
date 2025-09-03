// Connection management types
export interface SavedConnection {
    id: string;
    user_id: string;
    name: string;
    database_type: string;
    encrypted_config: string;
    created_at: string;
    updated_at?: string;
}

export interface ConnectionTestResult {
    success: boolean;
    message: string;
    details?: {
        version?: string;
        serverInfo?: Record<string, any>;
    };
    error?: string;
}

export interface ConnectionStatus {
    connectionId: string;
    status: 'connected' | 'disconnected' | 'error' | 'testing';
    lastChecked: Date;
    latency?: number;
    error?: string;
}