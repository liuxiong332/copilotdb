import 'package:flutter/foundation.dart';

@immutable
class DatabaseSchema {
  final List<Database> databases;
  final DateTime lastUpdated;

  const DatabaseSchema({
    required this.databases,
    required this.lastUpdated,
  });

  DatabaseSchema copyWith({
    List<Database>? databases,
    DateTime? lastUpdated,
  }) {
    return DatabaseSchema(
      databases: databases ?? this.databases,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'databases': databases.map((db) => db.toJson()).toList(),
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }

  factory DatabaseSchema.fromJson(Map<String, dynamic> json) {
    return DatabaseSchema(
      databases: (json['databases'] as List<dynamic>)
          .map((db) => Database.fromJson(db as Map<String, dynamic>))
          .toList(),
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DatabaseSchema &&
        listEquals(other.databases, databases) &&
        other.lastUpdated == lastUpdated;
  }

  @override
  int get hashCode => Object.hash(databases, lastUpdated);
}

@immutable
class Database {
  final String name;
  final List<Table> tables;
  final List<Collection>? collections; // for MongoDB
  final List<View>? views;
  final List<StoredProcedure>? procedures;
  final List<DatabaseFunction>? functions;

  const Database({
    required this.name,
    required this.tables,
    this.collections,
    this.views,
    this.procedures,
    this.functions,
  });

  Database copyWith({
    String? name,
    List<Table>? tables,
    List<Collection>? collections,
    List<View>? views,
    List<StoredProcedure>? procedures,
    List<DatabaseFunction>? functions,
  }) {
    return Database(
      name: name ?? this.name,
      tables: tables ?? this.tables,
      collections: collections ?? this.collections,
      views: views ?? this.views,
      procedures: procedures ?? this.procedures,
      functions: functions ?? this.functions,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'tables': tables.map((table) => table.toJson()).toList(),
      'collections': collections?.map((collection) => collection.toJson()).toList(),
      'views': views?.map((view) => view.toJson()).toList(),
      'procedures': procedures?.map((procedure) => procedure.toJson()).toList(),
      'functions': functions?.map((function) => function.toJson()).toList(),
    };
  }

  factory Database.fromJson(Map<String, dynamic> json) {
    return Database(
      name: json['name'] as String,
      tables: (json['tables'] as List<dynamic>)
          .map((table) => Table.fromJson(table as Map<String, dynamic>))
          .toList(),
      collections: json['collections'] != null
          ? (json['collections'] as List<dynamic>)
              .map((collection) => Collection.fromJson(collection as Map<String, dynamic>))
              .toList()
          : null,
      views: json['views'] != null
          ? (json['views'] as List<dynamic>)
              .map((view) => View.fromJson(view as Map<String, dynamic>))
              .toList()
          : null,
      procedures: json['procedures'] != null
          ? (json['procedures'] as List<dynamic>)
              .map((procedure) => StoredProcedure.fromJson(procedure as Map<String, dynamic>))
              .toList()
          : null,
      functions: json['functions'] != null
          ? (json['functions'] as List<dynamic>)
              .map((function) => DatabaseFunction.fromJson(function as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Database &&
        other.name == name &&
        listEquals(other.tables, tables) &&
        listEquals(other.collections, collections) &&
        listEquals(other.views, views) &&
        listEquals(other.procedures, procedures) &&
        listEquals(other.functions, functions);
  }

  @override
  int get hashCode => Object.hash(name, tables, collections, views, procedures, functions);
}

@immutable
class Table {
  final String name;
  final String? schema;
  final List<Column> columns;
  final List<Index> indexes;
  final List<ForeignKey> foreignKeys;
  final PrimaryKey? primaryKey;
  final int? rowCount;
  final int? sizeBytes;

  const Table({
    required this.name,
    this.schema,
    required this.columns,
    required this.indexes,
    required this.foreignKeys,
    this.primaryKey,
    this.rowCount,
    this.sizeBytes,
  });

  Table copyWith({
    String? name,
    String? schema,
    List<Column>? columns,
    List<Index>? indexes,
    List<ForeignKey>? foreignKeys,
    PrimaryKey? primaryKey,
    int? rowCount,
    int? sizeBytes,
  }) {
    return Table(
      name: name ?? this.name,
      schema: schema ?? this.schema,
      columns: columns ?? this.columns,
      indexes: indexes ?? this.indexes,
      foreignKeys: foreignKeys ?? this.foreignKeys,
      primaryKey: primaryKey ?? this.primaryKey,
      rowCount: rowCount ?? this.rowCount,
      sizeBytes: sizeBytes ?? this.sizeBytes,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'schema': schema,
      'columns': columns.map((column) => column.toJson()).toList(),
      'indexes': indexes.map((index) => index.toJson()).toList(),
      'foreignKeys': foreignKeys.map((fk) => fk.toJson()).toList(),
      'primaryKey': primaryKey?.toJson(),
      'rowCount': rowCount,
      'sizeBytes': sizeBytes,
    };
  }

  factory Table.fromJson(Map<String, dynamic> json) {
    return Table(
      name: json['name'] as String,
      schema: json['schema'] as String?,
      columns: (json['columns'] as List<dynamic>)
          .map((column) => Column.fromJson(column as Map<String, dynamic>))
          .toList(),
      indexes: (json['indexes'] as List<dynamic>)
          .map((index) => Index.fromJson(index as Map<String, dynamic>))
          .toList(),
      foreignKeys: (json['foreignKeys'] as List<dynamic>)
          .map((fk) => ForeignKey.fromJson(fk as Map<String, dynamic>))
          .toList(),
      primaryKey: json['primaryKey'] != null
          ? PrimaryKey.fromJson(json['primaryKey'] as Map<String, dynamic>)
          : null,
      rowCount: json['rowCount'] as int?,
      sizeBytes: json['sizeBytes'] as int?,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Table &&
        other.name == name &&
        other.schema == schema &&
        listEquals(other.columns, columns) &&
        listEquals(other.indexes, indexes) &&
        listEquals(other.foreignKeys, foreignKeys) &&
        other.primaryKey == primaryKey &&
        other.rowCount == rowCount &&
        other.sizeBytes == sizeBytes;
  }

  @override
  int get hashCode => Object.hash(name, schema, columns, indexes, foreignKeys, primaryKey, rowCount, sizeBytes);
}

@immutable
class Column {
  final String name;
  final String type;
  final bool nullable;
  final bool primaryKey;
  final bool? autoIncrement;
  final dynamic defaultValue;
  final String? comment;
  final int? length;
  final int? precision;
  final int? scale;

  const Column({
    required this.name,
    required this.type,
    required this.nullable,
    required this.primaryKey,
    this.autoIncrement,
    this.defaultValue,
    this.comment,
    this.length,
    this.precision,
    this.scale,
  });

  Column copyWith({
    String? name,
    String? type,
    bool? nullable,
    bool? primaryKey,
    bool? autoIncrement,
    dynamic defaultValue,
    String? comment,
    int? length,
    int? precision,
    int? scale,
  }) {
    return Column(
      name: name ?? this.name,
      type: type ?? this.type,
      nullable: nullable ?? this.nullable,
      primaryKey: primaryKey ?? this.primaryKey,
      autoIncrement: autoIncrement ?? this.autoIncrement,
      defaultValue: defaultValue ?? this.defaultValue,
      comment: comment ?? this.comment,
      length: length ?? this.length,
      precision: precision ?? this.precision,
      scale: scale ?? this.scale,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'nullable': nullable,
      'primaryKey': primaryKey,
      'autoIncrement': autoIncrement,
      'defaultValue': defaultValue,
      'comment': comment,
      'length': length,
      'precision': precision,
      'scale': scale,
    };
  }

  factory Column.fromJson(Map<String, dynamic> json) {
    return Column(
      name: json['name'] as String,
      type: json['type'] as String,
      nullable: json['nullable'] as bool,
      primaryKey: json['primaryKey'] as bool,
      autoIncrement: json['autoIncrement'] as bool?,
      defaultValue: json['defaultValue'],
      comment: json['comment'] as String?,
      length: json['length'] as int?,
      precision: json['precision'] as int?,
      scale: json['scale'] as int?,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Column &&
        other.name == name &&
        other.type == type &&
        other.nullable == nullable &&
        other.primaryKey == primaryKey &&
        other.autoIncrement == autoIncrement &&
        other.defaultValue == defaultValue &&
        other.comment == comment &&
        other.length == length &&
        other.precision == precision &&
        other.scale == scale;
  }

  @override
  int get hashCode => Object.hash(name, type, nullable, primaryKey, autoIncrement, defaultValue, comment, length, precision, scale);
}

// Additional classes for completeness
@immutable
class Index {
  final String name;
  final List<String> columns;
  final bool unique;
  final String? type;

  const Index({
    required this.name,
    required this.columns,
    required this.unique,
    this.type,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'columns': columns,
      'unique': unique,
      'type': type,
    };
  }

  factory Index.fromJson(Map<String, dynamic> json) {
    return Index(
      name: json['name'] as String,
      columns: List<String>.from(json['columns'] as List<dynamic>),
      unique: json['unique'] as bool,
      type: json['type'] as String?,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Index &&
        other.name == name &&
        listEquals(other.columns, columns) &&
        other.unique == unique &&
        other.type == type;
  }

  @override
  int get hashCode => Object.hash(name, columns, unique, type);
}

@immutable
class ForeignKey {
  final String name;
  final List<String> columns;
  final String referencedTable;
  final List<String> referencedColumns;
  final String? onDelete;
  final String? onUpdate;

  const ForeignKey({
    required this.name,
    required this.columns,
    required this.referencedTable,
    required this.referencedColumns,
    this.onDelete,
    this.onUpdate,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'columns': columns,
      'referencedTable': referencedTable,
      'referencedColumns': referencedColumns,
      'onDelete': onDelete,
      'onUpdate': onUpdate,
    };
  }

  factory ForeignKey.fromJson(Map<String, dynamic> json) {
    return ForeignKey(
      name: json['name'] as String,
      columns: List<String>.from(json['columns'] as List<dynamic>),
      referencedTable: json['referencedTable'] as String,
      referencedColumns: List<String>.from(json['referencedColumns'] as List<dynamic>),
      onDelete: json['onDelete'] as String?,
      onUpdate: json['onUpdate'] as String?,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ForeignKey &&
        other.name == name &&
        listEquals(other.columns, columns) &&
        other.referencedTable == referencedTable &&
        listEquals(other.referencedColumns, referencedColumns) &&
        other.onDelete == onDelete &&
        other.onUpdate == onUpdate;
  }

  @override
  int get hashCode => Object.hash(name, columns, referencedTable, referencedColumns, onDelete, onUpdate);
}

@immutable
class PrimaryKey {
  final String? name;
  final List<String> columns;

  const PrimaryKey({
    this.name,
    required this.columns,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'columns': columns,
    };
  }

  factory PrimaryKey.fromJson(Map<String, dynamic> json) {
    return PrimaryKey(
      name: json['name'] as String?,
      columns: List<String>.from(json['columns'] as List<dynamic>),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PrimaryKey &&
        other.name == name &&
        listEquals(other.columns, columns);
  }

  @override
  int get hashCode => Object.hash(name, columns);
}

@immutable
class View {
  final String name;
  final String definition;
  final List<Column> columns;

  const View({
    required this.name,
    required this.definition,
    required this.columns,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'definition': definition,
      'columns': columns.map((column) => column.toJson()).toList(),
    };
  }

  factory View.fromJson(Map<String, dynamic> json) {
    return View(
      name: json['name'] as String,
      definition: json['definition'] as String,
      columns: (json['columns'] as List<dynamic>)
          .map((column) => Column.fromJson(column as Map<String, dynamic>))
          .toList(),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is View &&
        other.name == name &&
        other.definition == definition &&
        listEquals(other.columns, columns);
  }

  @override
  int get hashCode => Object.hash(name, definition, columns);
}

@immutable
class StoredProcedure {
  final String name;
  final List<Parameter> parameters;
  final String? returnType;

  const StoredProcedure({
    required this.name,
    required this.parameters,
    this.returnType,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'parameters': parameters.map((param) => param.toJson()).toList(),
      'returnType': returnType,
    };
  }

  factory StoredProcedure.fromJson(Map<String, dynamic> json) {
    return StoredProcedure(
      name: json['name'] as String,
      parameters: (json['parameters'] as List<dynamic>)
          .map((param) => Parameter.fromJson(param as Map<String, dynamic>))
          .toList(),
      returnType: json['returnType'] as String?,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is StoredProcedure &&
        other.name == name &&
        listEquals(other.parameters, parameters) &&
        other.returnType == returnType;
  }

  @override
  int get hashCode => Object.hash(name, parameters, returnType);
}

@immutable
class DatabaseFunction {
  final String name;
  final List<Parameter> parameters;
  final String returnType;

  const DatabaseFunction({
    required this.name,
    required this.parameters,
    required this.returnType,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'parameters': parameters.map((param) => param.toJson()).toList(),
      'returnType': returnType,
    };
  }

  factory DatabaseFunction.fromJson(Map<String, dynamic> json) {
    return DatabaseFunction(
      name: json['name'] as String,
      parameters: (json['parameters'] as List<dynamic>)
          .map((param) => Parameter.fromJson(param as Map<String, dynamic>))
          .toList(),
      returnType: json['returnType'] as String,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DatabaseFunction &&
        other.name == name &&
        listEquals(other.parameters, parameters) &&
        other.returnType == returnType;
  }

  @override
  int get hashCode => Object.hash(name, parameters, returnType);
}

@immutable
class Parameter {
  final String name;
  final String type;
  final ParameterDirection direction;
  final dynamic defaultValue;

  const Parameter({
    required this.name,
    required this.type,
    required this.direction,
    this.defaultValue,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'direction': direction.name,
      'defaultValue': defaultValue,
    };
  }

  factory Parameter.fromJson(Map<String, dynamic> json) {
    return Parameter(
      name: json['name'] as String,
      type: json['type'] as String,
      direction: ParameterDirection.values.firstWhere(
        (d) => d.name == json['direction'],
        orElse: () => ParameterDirection.input,
      ),
      defaultValue: json['defaultValue'],
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Parameter &&
        other.name == name &&
        other.type == type &&
        other.direction == direction &&
        other.defaultValue == defaultValue;
  }

  @override
  int get hashCode => Object.hash(name, type, direction, defaultValue);
}

enum ParameterDirection {
  input('IN'),
  output('OUT'),
  inputOutput('INOUT');

  const ParameterDirection(this.value);
  final String value;
}

// MongoDB specific types
@immutable
class Collection {
  final String name;
  final Map<String, dynamic>? sampleDocument;
  final List<MongoIndex> indexes;
  final int? documentCount;
  final int? sizeBytes;

  const Collection({
    required this.name,
    this.sampleDocument,
    required this.indexes,
    this.documentCount,
    this.sizeBytes,
  });

  Collection copyWith({
    String? name,
    Map<String, dynamic>? sampleDocument,
    List<MongoIndex>? indexes,
    int? documentCount,
    int? sizeBytes,
  }) {
    return Collection(
      name: name ?? this.name,
      sampleDocument: sampleDocument ?? this.sampleDocument,
      indexes: indexes ?? this.indexes,
      documentCount: documentCount ?? this.documentCount,
      sizeBytes: sizeBytes ?? this.sizeBytes,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'sampleDocument': sampleDocument,
      'indexes': indexes.map((index) => index.toJson()).toList(),
      'documentCount': documentCount,
      'sizeBytes': sizeBytes,
    };
  }

  factory Collection.fromJson(Map<String, dynamic> json) {
    return Collection(
      name: json['name'] as String,
      sampleDocument: json['sampleDocument'] as Map<String, dynamic>?,
      indexes: (json['indexes'] as List<dynamic>)
          .map((index) => MongoIndex.fromJson(index as Map<String, dynamic>))
          .toList(),
      documentCount: json['documentCount'] as int?,
      sizeBytes: json['sizeBytes'] as int?,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Collection &&
        other.name == name &&
        mapEquals(other.sampleDocument, sampleDocument) &&
        listEquals(other.indexes, indexes) &&
        other.documentCount == documentCount &&
        other.sizeBytes == sizeBytes;
  }

  @override
  int get hashCode => Object.hash(name, sampleDocument, indexes, documentCount, sizeBytes);
}

@immutable
class MongoIndex {
  final String name;
  final Map<String, int> keys; // 1 for ascending, -1 for descending
  final bool? unique;
  final bool? sparse;
  final bool? background;

  const MongoIndex({
    required this.name,
    required this.keys,
    this.unique,
    this.sparse,
    this.background,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'keys': keys,
      'unique': unique,
      'sparse': sparse,
      'background': background,
    };
  }

  factory MongoIndex.fromJson(Map<String, dynamic> json) {
    return MongoIndex(
      name: json['name'] as String,
      keys: Map<String, int>.from(json['keys'] as Map<String, dynamic>),
      unique: json['unique'] as bool?,
      sparse: json['sparse'] as bool?,
      background: json['background'] as bool?,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is MongoIndex &&
        other.name == name &&
        mapEquals(other.keys, keys) &&
        other.unique == unique &&
        other.sparse == sparse &&
        other.background == background;
  }

  @override
  int get hashCode => Object.hash(name, keys, unique, sparse, background);
}