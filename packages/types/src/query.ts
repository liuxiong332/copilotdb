// Query execution types
export interface QueryRequest {
    connectionId: string;
    query: string;
    parameters?: any[];
    limit?: number;
    offset?: number;
    timeout?: number;
}

export interface QueryResult {
    data: any[];
    totalRows: number;
    executionTime: number;
    columns: ColumnInfo[];
    affectedRows?: number;
    error?: string;
    warnings?: string[];
}

export interface ColumnInfo {
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    autoIncrement?: boolean;
    defaultValue?: any;
}

export interface QueryExplanation {
    plan: string;
    cost?: number;
    estimatedRows?: number;
    suggestions?: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationWarning {
    line: number;
    column: number;
    message: string;
    suggestion?: string;
}

export interface QueryHistory {
    id: string;
    user_id: string;
    connection_id: string;
    query_text: string;
    execution_time?: number;
    row_count?: number;
    created_at: string;
    favorite?: boolean;
}