import 'package:flutter/foundation.dart';

enum DatabaseType {
  mongodb('MongoDB', 'mongodb'),
  mysql('MySQL', 'mysql'),
  postgresql('PostgreSQL', 'postgresql'),
  sqlite('SQLite', 'sqlite');

  const DatabaseType(this.displayName, this.value);
  
  final String displayName;
  final String value;
  
  static DatabaseType fromString(String value) {
    return DatabaseType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => DatabaseType.postgresql,
    );
  }
}

enum ConnectionStatus {
  disconnected('Disconnected'),
  connecting('Connecting'),
  connected('Connected'),
  error('Error'),
  testing('Testing');

  const ConnectionStatus(this.displayName);
  
  final String displayName;
}

@immutable
class DatabaseConnectionConfig {
  final String? host;
  final int? port;
  final String database;
  final String? username;
  final String? password;
  final bool ssl;
  final String? filePath; // for SQLite
  final Map<String, dynamic> additionalOptions;

  const DatabaseConnectionConfig({
    this.host,
    this.port,
    required this.database,
    this.username,
    this.password,
    this.ssl = false,
    this.filePath,
    this.additionalOptions = const {},
  });

  DatabaseConnectionConfig copyWith({
    String? host,
    int? port,
    String? database,
    String? username,
    String? password,
    bool? ssl,
    String? filePath,
    Map<String, dynamic>? additionalOptions,
  }) {
    return DatabaseConnectionConfig(
      host: host ?? this.host,
      port: port ?? this.port,
      database: database ?? this.database,
      username: username ?? this.username,
      password: password ?? this.password,
      ssl: ssl ?? this.ssl,
      filePath: filePath ?? this.filePath,
      additionalOptions: additionalOptions ?? this.additionalOptions,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'host': host,
      'port': port,
      'database': database,
      'username': username,
      'password': password,
      'ssl': ssl,
      'filePath': filePath,
      'additionalOptions': additionalOptions,
    };
  }

  factory DatabaseConnectionConfig.fromJson(Map<String, dynamic> json) {
    return DatabaseConnectionConfig(
      host: json['host'] as String?,
      port: json['port'] as int?,
      database: json['database'] as String,
      username: json['username'] as String?,
      password: json['password'] as String?,
      ssl: json['ssl'] as bool? ?? false,
      filePath: json['filePath'] as String?,
      additionalOptions: json['additionalOptions'] as Map<String, dynamic>? ?? {},
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DatabaseConnectionConfig &&
        other.host == host &&
        other.port == port &&
        other.database == database &&
        other.username == username &&
        other.password == password &&
        other.ssl == ssl &&
        other.filePath == filePath &&
        mapEquals(other.additionalOptions, additionalOptions);
  }

  @override
  int get hashCode {
    return Object.hash(
      host,
      port,
      database,
      username,
      password,
      ssl,
      filePath,
      additionalOptions,
    );
  }
}

@immutable
class DatabaseConnection {
  final String id;
  final String name;
  final DatabaseType type;
  final DatabaseConnectionConfig config;
  final ConnectionStatus status;
  final String? errorMessage;
  final DateTime? lastConnected;
  final DateTime createdAt;
  final DateTime updatedAt;

  const DatabaseConnection({
    required this.id,
    required this.name,
    required this.type,
    required this.config,
    this.status = ConnectionStatus.disconnected,
    this.errorMessage,
    this.lastConnected,
    required this.createdAt,
    required this.updatedAt,
  });

  DatabaseConnection copyWith({
    String? id,
    String? name,
    DatabaseType? type,
    DatabaseConnectionConfig? config,
    ConnectionStatus? status,
    String? errorMessage,
    DateTime? lastConnected,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return DatabaseConnection(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      config: config ?? this.config,
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
      lastConnected: lastConnected ?? this.lastConnected,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type.value,
      'config': config.toJson(),
      'status': status.name,
      'errorMessage': errorMessage,
      'lastConnected': lastConnected?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory DatabaseConnection.fromJson(Map<String, dynamic> json) {
    return DatabaseConnection(
      id: json['id'] as String,
      name: json['name'] as String,
      type: DatabaseType.fromString(json['type'] as String),
      config: DatabaseConnectionConfig.fromJson(json['config'] as Map<String, dynamic>),
      status: ConnectionStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => ConnectionStatus.disconnected,
      ),
      errorMessage: json['errorMessage'] as String?,
      lastConnected: json['lastConnected'] != null
          ? DateTime.parse(json['lastConnected'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DatabaseConnection &&
        other.id == id &&
        other.name == name &&
        other.type == type &&
        other.config == config &&
        other.status == status &&
        other.errorMessage == errorMessage &&
        other.lastConnected == lastConnected &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      type,
      config,
      status,
      errorMessage,
      lastConnected,
      createdAt,
      updatedAt,
    );
  }
}

class ConnectionTestResult {
  final bool success;
  final String message;
  final Map<String, dynamic>? details;
  final String? error;

  const ConnectionTestResult({
    required this.success,
    required this.message,
    this.details,
    this.error,
  });

  factory ConnectionTestResult.success({
    required String message,
    Map<String, dynamic>? details,
  }) {
    return ConnectionTestResult(
      success: true,
      message: message,
      details: details,
    );
  }

  factory ConnectionTestResult.failure({
    required String message,
    String? error,
  }) {
    return ConnectionTestResult(
      success: false,
      message: message,
      error: error,
    );
  }
}