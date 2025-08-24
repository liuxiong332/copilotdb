import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';
import '../models/database_connection.dart';
import '../services/connection_storage_service.dart';
import '../services/database_connection_service.dart';

class DatabaseProvider extends ChangeNotifier {
  final ConnectionStorageService _storageService;
  final DatabaseConnectionService _connectionService;
  final Logger _logger;

  List<DatabaseConnection> _connections = [];
  DatabaseConnection? _activeConnection;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isInitialized = false;

  DatabaseProvider({
    ConnectionStorageService? storageService,
    DatabaseConnectionService? connectionService,
    Logger? logger,
  }) : _storageService = storageService ?? ConnectionStorageService(),
       _connectionService = connectionService ?? DatabaseConnectionService(),
       _logger = logger ?? Logger();

  List<DatabaseConnection> get connections => List.unmodifiable(_connections);
  DatabaseConnection? get activeConnection => _activeConnection;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isInitialized => _isInitialized;

  /// Initialize the provider
  Future<void> initialize() async {
    if (_isInitialized) return;

    _setLoading(true);
    try {
      await _storageService.initialize();
      await _loadConnections();
      _isInitialized = true;
      _logger.i('DatabaseProvider initialized successfully');
    } catch (e) {
      _setError('Failed to initialize database provider: $e');
      _logger.e('Failed to initialize DatabaseProvider', error: e);
    } finally {
      _setLoading(false);
    }
  }

  /// Load connections from storage
  Future<void> _loadConnections() async {
    try {
      _connections = await _storageService.loadConnections();
      _logger.i('Loaded ${_connections.length} connections');
      notifyListeners();
    } catch (e) {
      _setError('Failed to load connections: $e');
      _logger.e('Failed to load connections', error: e);
    }
  }

  /// Add a new connection
  Future<void> addConnection(DatabaseConnection connection) async {
    _setLoading(true);
    _clearError();

    try {
      // Check if connection with same name already exists
      if (_connections.any((conn) => conn.name == connection.name)) {
        throw Exception('A connection with the name "${connection.name}" already exists');
      }

      // Add to local list
      _connections.add(connection);
      
      // Save to storage
      await _storageService.saveConnections(_connections);
      
      _logger.i('Added new connection: ${connection.name}');
      notifyListeners();
    } catch (e) {
      // Remove from local list if save failed
      _connections.removeWhere((conn) => conn.id == connection.id);
      _setError('Failed to add connection: $e');
      _logger.e('Failed to add connection: ${connection.name}', error: e);
    } finally {
      _setLoading(false);
    }
  }

  /// Update an existing connection
  Future<void> updateConnection(DatabaseConnection updatedConnection) async {
    _setLoading(true);
    _clearError();

    try {
      final index = _connections.indexWhere((conn) => conn.id == updatedConnection.id);
      if (index == -1) {
        throw Exception('Connection not found');
      }

      // Check if name conflicts with another connection
      final nameConflict = _connections.any((conn) => 
          conn.id != updatedConnection.id && conn.name == updatedConnection.name);
      if (nameConflict) {
        throw Exception('A connection with the name "${updatedConnection.name}" already exists');
      }

      final oldConnection = _connections[index];
      _connections[index] = updatedConnection.copyWith(updatedAt: DateTime.now());
      
      // Save to storage
      await _storageService.saveConnections(_connections);
      
      // Update active connection if it was the one being updated
      if (_activeConnection?.id == updatedConnection.id) {
        _activeConnection = _connections[index];
      }
      
      _logger.i('Updated connection: ${updatedConnection.name}');
      notifyListeners();
    } catch (e) {
      // Restore old connection if save failed
      final index = _connections.indexWhere((conn) => conn.id == updatedConnection.id);
      if (index != -1) {
        // We need the old connection to restore, but we don't have it here
        // In a real implementation, we'd handle this better
        await _loadConnections(); // Reload from storage
      }
      _setError('Failed to update connection: $e');
      _logger.e('Failed to update connection: ${updatedConnection.name}', error: e);
    } finally {
      _setLoading(false);
    }
  }

  /// Remove a connection
  Future<void> removeConnection(String connectionId) async {
    _setLoading(true);
    _clearError();

    try {
      final connectionToRemove = _connections.firstWhere(
        (conn) => conn.id == connectionId,
        orElse: () => throw Exception('Connection not found'),
      );

      // Remove from local list
      _connections.removeWhere((conn) => conn.id == connectionId);
      
      // Save to storage
      await _storageService.saveConnections(_connections);
      
      // Clear active connection if it was the one being removed
      if (_activeConnection?.id == connectionId) {
        _activeConnection = null;
      }
      
      // Stop health check for this connection
      _connectionService.stopConnectionHealthCheck(connectionId);
      
      _logger.i('Removed connection: ${connectionToRemove.name}');
      notifyListeners();
    } catch (e) {
      // Reload connections if removal failed
      await _loadConnections();
      _setError('Failed to remove connection: $e');
      _logger.e('Failed to remove connection: $connectionId', error: e);
    } finally {
      _setLoading(false);
    }
  }

  /// Set active connection
  Future<void> setActiveConnection(String? connectionId) async {
    _clearError();

    try {
      if (connectionId == null) {
        _activeConnection = null;
      } else {
        _activeConnection = _connections.firstWhere(
          (conn) => conn.id == connectionId,
          orElse: () => throw Exception('Connection not found'),
        );
      }
      
      _logger.i('Set active connection: ${_activeConnection?.name ?? 'none'}');
      notifyListeners();
    } catch (e) {
      _setError('Failed to set active connection: $e');
      _logger.e('Failed to set active connection: $connectionId', error: e);
    }
  }

  /// Test a connection
  Future<ConnectionTestResult> testConnection(DatabaseConnection connection) async {
    _logger.i('Testing connection: ${connection.name}');
    
    // Update connection status to testing
    await _updateConnectionStatus(connection.id, ConnectionStatus.testing);
    
    try {
      final result = await _connectionService.testConnection(connection.config, connection.type);
      
      // Update connection status based on test result
      final newStatus = result.success ? ConnectionStatus.connected : ConnectionStatus.error;
      final errorMessage = result.success ? null : result.error;
      
      await _updateConnectionStatus(connection.id, newStatus, errorMessage);
      
      return result;
    } catch (e) {
      await _updateConnectionStatus(connection.id, ConnectionStatus.error, e.toString());
      return ConnectionTestResult.failure(
        message: 'Connection test failed',
        error: e.toString(),
      );
    }
  }

  /// Update connection status
  Future<void> _updateConnectionStatus(String connectionId, ConnectionStatus status, [String? errorMessage]) async {
    final index = _connections.indexWhere((conn) => conn.id == connectionId);
    if (index != -1) {
      _connections[index] = _connections[index].copyWith(
        status: status,
        errorMessage: errorMessage,
        lastConnected: status == ConnectionStatus.connected ? DateTime.now() : null,
        updatedAt: DateTime.now(),
      );
      
      // Update active connection if it's the one being updated
      if (_activeConnection?.id == connectionId) {
        _activeConnection = _connections[index];
      }
      
      notifyListeners();
      
      // Save to storage (don't await to avoid blocking UI)
      _storageService.saveConnections(_connections).catchError((e) {
        _logger.w('Failed to save connection status update', error: e);
      });
    }
  }

  /// Get connection by ID
  DatabaseConnection? getConnectionById(String connectionId) {
    try {
      return _connections.firstWhere((conn) => conn.id == connectionId);
    } catch (e) {
      return null;
    }
  }

  /// Clear all connections
  Future<void> clearAllConnections() async {
    _setLoading(true);
    _clearError();

    try {
      await _storageService.clearAllConnections();
      _connections.clear();
      _activeConnection = null;
      _connectionService.stopAllHealthChecks();
      
      _logger.i('Cleared all connections');
      notifyListeners();
    } catch (e) {
      _setError('Failed to clear connections: $e');
      _logger.e('Failed to clear all connections', error: e);
    } finally {
      _setLoading(false);
    }
  }

  /// Refresh connections from storage
  Future<void> refreshConnections() async {
    _setLoading(true);
    _clearError();
    
    try {
      await _loadConnections();
      _logger.i('Refreshed connections from storage');
    } catch (e) {
      _setError('Failed to refresh connections: $e');
      _logger.e('Failed to refresh connections', error: e);
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _connectionService.dispose();
    super.dispose();
  }
}