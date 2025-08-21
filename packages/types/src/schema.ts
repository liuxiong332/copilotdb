// Database schema types
export interface DatabaseSchema {
    databases: Database[];
    lastUpdated: Date;
}

export interface Database {
    name: string;
    tables: Table[];
    collections?: Collection[]; // for MongoDB
    views?: View[];
    procedures?: StoredProcedure[];
    functions?: DatabaseFunction[];
}

export interface Table {
    name: string;
    schema?: string;
    columns: Column[];
    indexes: Index[];
    foreignKeys: ForeignKey[];
    primaryKey?: PrimaryKey;
    rowCount?: number;
    sizeBytes?: number;
}

export interface Column {
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    autoIncrement?: boolean;
    defaultValue?: any;
    comment?: string;
    length?: number;
    precision?: number;
    scale?: number;
}

export interface Index {
    name: string;
    columns: string[];
    unique: boolean;
    type?: string;
}

export interface ForeignKey {
    name: string;
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
    onDelete?: string;
    onUpdate?: string;
}

export interface PrimaryKey {
    name?: string;
    columns: string[];
}

export interface View {
    name: string;
    definition: string;
    columns: Column[];
}

export interface StoredProcedure {
    name: string;
    parameters: Parameter[];
    returnType?: string;
}

export interface DatabaseFunction {
    name: string;
    parameters: Parameter[];
    returnType: string;
}

export interface Parameter {
    name: string;
    type: string;
    direction: 'IN' | 'OUT' | 'INOUT';
    defaultValue?: any;
}

// MongoDB specific types
export interface Collection {
    name: string;
    sampleDocument?: any;
    indexes: MongoIndex[];
    documentCount?: number;
    sizeBytes?: number;
}

export interface MongoIndex {
    name: string;
    keys: Record<string, 1 | -1>;
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
}