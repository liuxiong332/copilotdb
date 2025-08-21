// UI and component types
export interface TableViewConfig {
    sortColumn?: string;
    sortDirection: 'asc' | 'desc';
    pageSize: number;
    currentPage: number;
    filters: Record<string, any>;
}

export interface TreeViewNode {
    id: string;
    label: string;
    type: 'database' | 'table' | 'collection' | 'view' | 'procedure' | 'function';
    children?: TreeViewNode[];
    expanded?: boolean;
    icon?: string;
    metadata?: Record<string, any>;
}

export interface ViewMode {
    type: 'table' | 'tree' | 'json';
    label: string;
    icon: string;
}

export interface ExportOptions {
    format: 'csv' | 'json' | 'excel' | 'sql';
    includeHeaders: boolean;
    limit?: number;
    filename?: string;
}

export interface NotificationMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    actions?: NotificationAction[];
}

export interface NotificationAction {
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
}

export interface LoadingState {
    isLoading: boolean;
    message?: string;
    progress?: number;
}

export interface ErrorState {
    hasError: boolean;
    error?: Error | string;
    retry?: () => void;
}