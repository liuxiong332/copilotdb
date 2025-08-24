import 'package:flutter/foundation.dart';

// Placeholder for database provider - will be implemented in later tasks
class DatabaseProvider extends ChangeNotifier {
  List<DatabaseConnection> _connections = [];
  DatabaseConnection? _activeConnection;
  bool _isLoading = false;
  String? _errorMessage;

  List<DatabaseConnection> get connections => _connections;
  DatabaseConnection? get activeConnection => _activeConnection;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Placeholder methods - will be implemented in later tasks
  Future<void> addConnection(DatabaseConnection connection) async {
    // TODO: Implement in task 8.1
  }

  Future<void> removeConnection(String connectionId) async {
    // TODO: Implement in task 8.1
  }

  Future<void> setActiveConnection(String connectionId) async {
    // TODO: Implement in task 8.1
  }
}

// Placeholder class - will be properly defined in shared types package
class DatabaseConnection {
  final String id;
  final String name;
  final String type;
  final Map<String, dynamic> config;

  DatabaseConnection({
    required this.id,
    required this.name,
    required this.type,
    required this.config,
  });
}