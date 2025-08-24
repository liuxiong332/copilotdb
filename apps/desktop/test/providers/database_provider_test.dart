import 'package:flutter_test/flutter_test.dart';
import 'package:database_gui_desktop/src/models/database_connection.dart';
import 'package:database_gui_desktop/src/providers/database_provider.dart';
import 'package:database_gui_desktop/src/services/connection_storage_service.dart';
import 'package:database_gui_desktop/src/services/database_connection_service.dart';

// Mock services for testing
class MockConnectionStorageService extends ConnectionStorageService {
  List<DatabaseConnection> _mockConnections = [];
  bool _shouldThrowError = false;

  void setMockConnections(List<DatabaseConnection> connections) {
    _mockConnections = connections;
  }

  void setShouldThrowError(bool shouldThrow) {
    _shouldThrowError = shouldThrow;
  }

  @override
  Future<void> initialize() async {
    if (_shouldThrowError) {
      throw Exception('Mock initialization error');
    }
  }

  @override
  Future<List<DatabaseConnection>> loadConnections() async {
    if (_shouldThrowError) {
      throw Exception('Mock load error');
    }
    return List.from(_mockConnections);
  }

  @override
  Future<void> saveConnections(List<DatabaseConnection> connections) async {
    if (_shouldThrowError) {
      throw Exception('Mock save error');
    }
    _mockConnections = List.from(connections);
  }

  @override
  Future<void> clearAllConnections() async {
    if (_shouldThrowError) {
      throw Exception('Mock clear error');
    }
    _mockConnections.clear();
  }
}

class MockDatabaseConnectionService extends DatabaseConnectionService {
  bool _shouldThrowError = false;
  bool _shouldReturnSuccess = true;

  void setShouldThrowError(bool shouldThrow) {
    _shouldThrowError = shouldThrow;
  }

  void setShouldReturnSuccess(bool shouldReturn) {
    _shouldReturnSuccess = shouldReturn;
  }

  @override
  Future<ConnectionTestResult> testConnection(DatabaseConnectionConfig config, DatabaseType type) async {
    if (_shouldThrowError) {
      throw Exception('Mock connection test error');
    }

    if (_shouldReturnSuccess) {
      return ConnectionTestResult.success(message: 'Mock success');
    } else {
      return ConnectionTestResult.failure(message: 'Mock failure', error: 'Mock error');
    }
  }
}

void main() {
  group('DatabaseProvider Tests', () {
    late DatabaseProvider provider;
    late MockConnectionStorageService mockStorageService;
    late MockDatabaseConnectionService mockConnectionService;

    setUp(() {
      mockStorageService = MockConnectionStorageService();
      mockConnectionService = MockDatabaseConnectionService();
      provider = DatabaseProvider(
        storageService: mockStorageService,
        connectionService: mockConnectionService,
      );
    });

    tearDown(() {
      provider.dispose();
    });

    DatabaseConnection createTestConnection({
      String id = '1',
      String name = 'Test Connection',
      DatabaseType type = DatabaseType.postgresql,
    }) {
      return DatabaseConnection(
        id: id,
        name: name,
        type: type,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
        ),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    }

    test('initial state is correct', () {
      expect(provider.connections, isEmpty);
      expect(provider.activeConnection, isNull);
      expect(provider.isLoading, isFalse);
      expect(provider.errorMessage, isNull);
      expect(provider.isInitialized, isFalse);
    });

    test('initialize sets isInitialized to true on success', () async {
      await provider.initialize();

      expect(provider.isInitialized, isTrue);
      expect(provider.errorMessage, isNull);
    });

    test('initialize handles storage service errors', () async {
      mockStorageService.setShouldThrowError(true);

      await provider.initialize();

      expect(provider.isInitialized, isFalse);
      expect(provider.errorMessage, contains('Failed to initialize'));
    });

    test('initialize loads existing connections', () async {
      final testConnection = createTestConnection();
      mockStorageService.setMockConnections([testConnection]);

      await provider.initialize();

      expect(provider.connections, hasLength(1));
      expect(provider.connections.first.name, equals('Test Connection'));
    });

    test('addConnection adds new connection successfully', () async {
      await provider.initialize();
      final testConnection = createTestConnection();

      await provider.addConnection(testConnection);

      expect(provider.connections, hasLength(1));
      expect(provider.connections.first.name, equals('Test Connection'));
      expect(provider.errorMessage, isNull);
    });

    test('addConnection prevents duplicate names', () async {
      await provider.initialize();
      final connection1 = createTestConnection(id: '1', name: 'Duplicate Name');
      final connection2 = createTestConnection(id: '2', name: 'Duplicate Name');

      await provider.addConnection(connection1);
      await provider.addConnection(connection2);

      expect(provider.connections, hasLength(1));
      expect(provider.errorMessage, contains('already exists'));
    });

    test('addConnection handles storage errors', () async {
      await provider.initialize();
      mockStorageService.setShouldThrowError(true);
      final testConnection = createTestConnection();

      await provider.addConnection(testConnection);

      expect(provider.connections, isEmpty);
      expect(provider.errorMessage, contains('Failed to add connection'));
    });

    test('updateConnection updates existing connection', () async {
      await provider.initialize();
      final originalConnection = createTestConnection();
      await provider.addConnection(originalConnection);

      final updatedConnection = originalConnection.copyWith(name: 'Updated Name');
      await provider.updateConnection(updatedConnection);

      expect(provider.connections, hasLength(1));
      expect(provider.connections.first.name, equals('Updated Name'));
    });

    test('updateConnection prevents duplicate names', () async {
      await provider.initialize();
      final connection1 = createTestConnection(id: '1', name: 'Connection 1');
      final connection2 = createTestConnection(id: '2', name: 'Connection 2');
      await provider.addConnection(connection1);
      await provider.addConnection(connection2);

      final updatedConnection = connection2.copyWith(name: 'Connection 1');
      await provider.updateConnection(updatedConnection);

      expect(provider.errorMessage, contains('already exists'));
    });

    test('removeConnection removes connection successfully', () async {
      await provider.initialize();
      final testConnection = createTestConnection();
      await provider.addConnection(testConnection);

      await provider.removeConnection(testConnection.id);

      expect(provider.connections, isEmpty);
      expect(provider.errorMessage, isNull);
    });

    test('removeConnection clears active connection if removed', () async {
      await provider.initialize();
      final testConnection = createTestConnection();
      await provider.addConnection(testConnection);
      await provider.setActiveConnection(testConnection.id);

      expect(provider.activeConnection, isNotNull);

      await provider.removeConnection(testConnection.id);

      expect(provider.activeConnection, isNull);
    });

    test('setActiveConnection sets active connection', () async {
      await provider.initialize();
      final testConnection = createTestConnection();
      await provider.addConnection(testConnection);

      await provider.setActiveConnection(testConnection.id);

      expect(provider.activeConnection?.id, equals(testConnection.id));
    });

    test('setActiveConnection clears active connection when null', () async {
      await provider.initialize();
      final testConnection = createTestConnection();
      await provider.addConnection(testConnection);
      await provider.setActiveConnection(testConnection.id);

      await provider.setActiveConnection(null);

      expect(provider.activeConnection, isNull);
    });

    test('setActiveConnection handles non-existent connection', () async {
      await provider.initialize();

      await provider.setActiveConnection('non-existent');

      expect(provider.activeConnection, isNull);
      expect(provider.errorMessage, contains('Connection not found'));
    });

    test('testConnection returns success result', () async {
      await provider.initialize();
      final testConnection = createTestConnection();
      mockConnectionService.setShouldReturnSuccess(true);

      final result = await provider.testConnection(testConnection);

      expect(result.success, isTrue);
      expect(result.message, equals('Mock success'));
    });

    test('testConnection returns failure result', () async {
      await provider.initialize();
      final testConnection = createTestConnection();
      mockConnectionService.setShouldReturnSuccess(false);

      final result = await provider.testConnection(testConnection);

      expect(result.success, isFalse);
      expect(result.message, equals('Mock failure'));
    });

    test('testConnection handles service errors', () async {
      await provider.initialize();
      final testConnection = createTestConnection();
      mockConnectionService.setShouldThrowError(true);

      final result = await provider.testConnection(testConnection);

      expect(result.success, isFalse);
      expect(result.message, equals('Connection test failed'));
    });

    test('clearAllConnections clears all connections', () async {
      await provider.initialize();
      final connection1 = createTestConnection(id: '1', name: 'Connection 1');
      final connection2 = createTestConnection(id: '2', name: 'Connection 2');
      await provider.addConnection(connection1);
      await provider.addConnection(connection2);
      await provider.setActiveConnection(connection1.id);

      await provider.clearAllConnections();

      expect(provider.connections, isEmpty);
      expect(provider.activeConnection, isNull);
    });

    test('getConnectionById returns correct connection', () async {
      await provider.initialize();
      final testConnection = createTestConnection();
      await provider.addConnection(testConnection);

      final found = provider.getConnectionById(testConnection.id);

      expect(found?.id, equals(testConnection.id));
    });

    test('getConnectionById returns null for non-existent connection', () async {
      await provider.initialize();

      final found = provider.getConnectionById('non-existent');

      expect(found, isNull);
    });

    test('refreshConnections reloads connections from storage', () async {
      await provider.initialize();
      
      // Add a connection directly to mock storage
      final testConnection = createTestConnection();
      mockStorageService.setMockConnections([testConnection]);

      await provider.refreshConnections();

      expect(provider.connections, hasLength(1));
      expect(provider.connections.first.name, equals('Test Connection'));
    });

    test('loading state is managed correctly during operations', () async {
      expect(provider.isLoading, isFalse);

      final initializeFuture = provider.initialize();
      expect(provider.isLoading, isTrue);

      await initializeFuture;
      expect(provider.isLoading, isFalse);
    });
  });
}