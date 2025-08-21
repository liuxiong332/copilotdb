// AI service types
export interface AIQueryRequest {
    naturalLanguage: string;
    databaseSchema: DatabaseSchema;
    databaseType: string;
    context?: string[];
    tableContext?: string[]; // specific tables to focus on
}

export interface AIQueryResponse {
    generatedQuery: string;
    explanation: string;
    confidence: number;
    suggestions?: string[];
    warnings?: string[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    queryGenerated?: string;
    queryExecuted?: boolean;
    queryResult?: any;
}

export interface ChatContext {
    sessionId: string;
    connectionId: string;
    databaseSchema: DatabaseSchema;
    previousMessages: ChatMessage[];
    currentTable?: string;
}

export interface ChatResponse {
    message: string;
    generatedQuery?: string;
    shouldExecuteQuery?: boolean;
    followUpQuestions?: string[];
    context?: any;
}

export interface ChatSession {
    id: string;
    user_id: string;
    connection_id?: string;
    session_data: {
        messages: ChatMessage[];
        context: Record<string, any>;
    };
    created_at: string;
    updated_at?: string;
}

// Import DatabaseSchema from schema.ts
import type { DatabaseSchema } from './schema';