import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../../lib/src/models/database_connection.dart';
import '../../../lib/src/providers/database_provider.dart';
import '../../../lib/src/widgets/database_selector/database_instance_selector.dart';

// Mock DatabaseProvider for testing
class MockDatabaseProvider extends ChangeNotifier implements DatabaseProvider {
  final List<DatabaseConnection> _connections = [];
  DatabaseConnection? _activeConnection;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isInitialized = true;

  @override
  List<DatabaseConnection> get connections => List.unmodifiable(_connections);
  
  @override
  DatabaseConnection? get activeConnection => _activeConnection;
  
  @override
  bool get isLoading => _isLoading;
  
  @override
  String? get errorMessage => _errorMessage;
  
  @override
  bool get isInitialized => _isInitialized;

  void addTestConnection(DatabaseConnection connection) {
    _connections.add(connection);
    notifyListeners();
  }

  void setTestActiveConnection(DatabaseConnection? connection) {
    _activeConnection = connection;
    notifyListeners();
  }

  // Implement required methods with no-op or simple implementations
  @override
  Future<void> initialize() async {}
  
  @override
  Future<void> addConnection(DatabaseConnection connection) async {}
  
  @override
  Future<void> updateConnection(DatabaseConnection connection) async {}
  
  @override
  Future<void> removeConnection(String id) async {}
  
  @override
  Future<void> clearAllConnections() async {}
  
  @override
  Future<void> refreshConnections() async {}
  
  @override
  Future<void> setActiveConnection(String? id) async {
    _activeConnection = _connections.where((c) => c.id == id).firstOrNull;
    notifyListeners();
  }
  
  @override
  DatabaseConnection? getConnectionById(String id) {
    return _connections.where((c) => c.id == id).firstOrNull;
  }
  
  @override
  Future<ConnectionTestResult> testConnection(DatabaseConnection connection) async {
    return ConnectionTestResult(
      success: true,
      message: 'Test successful',
    );
  }
}

DatabaseConnection _createTestConnection({
  String id = 'test-id',
  String name = 'Test Database',
  DatabaseType type = DatabaseType.mysql,
  ConnectionStatus status = ConnectionStatus.connected,
}) {
  return DatabaseConnection(
    id: id,
    name: name,
    type: type,
    config: const DatabaseConnectionConfig(
      host: 'localhost',
      port: 3306,
      database: 'testdb',
      username: 'user',
      password: 'pass',
    ),
    status: status,
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
  );
}

void main() {
  group('DatabaseInstanceSelector', () {
    late MockDatabaseProvider mockProvider;

    setUp(() {
      mockProvider = MockDatabaseProvider();
    });

    Widget createTestWidget({DatabaseConnection? activeConnection}) {
      if (activeConnection != null) {
        mockProvider.addTestConnection(activeConnection);
        mockProvider.setTestActiveConnection(activeConnection);
      }

      return MaterialApp(
        home: ChangeNotifierProvider<DatabaseProvider>.value(
          value: mockProvider,
          child: const Scaffold(
            body: DatabaseInstanceSelector(),
          ),
        ),
      );
    }

    testWidgets('displays no connection selected when no active connection', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('No connection selected'), findsOneWidget);
      expect(find.byIcon(Icons.storage_outlined), findsOneWidget);
    });

    testWidgets('displays active connection information', (tester) async {
      final connection = _createTestConnection();

      await tester.pumpWidget(createTestWidget(activeConnection: connection));

      expect(find.text('Test Database'), findsOneWidget);
      expect(find.text('Connected'), findsOneWidget);
      expect(find.byIcon(Icons.storage), findsOneWidget);
    });

    testWidgets('shows search button enabled when connected', (tester) async {
      final connection = _createTestConnection();

      await tester.pumpWidget(createTestWidget(activeConnection: connection));

      final searchButton = find.byType(IconButton);
      expect(searchButton, findsOneWidget);
      
      final iconButton = tester.widget<IconButton>(searchButton.first);
      expect(iconButton.onPressed, isNotNull);
    });

    testWidgets('shows search button disabled when not connected', (tester) async {
      final connection = _createTestConnection(status: ConnectionStatus.disconnected);

      await tester.pumpWidget(createTestWidget(activeConnection: connection));

      final searchButton = find.byType(IconButton);
      expect(searchButton, findsOneWidget);
      
      final iconButton = tester.widget<IconButton>(searchButton.first);
      expect(iconButton.onPressed, isNull);
    });

    testWidgets('opens instance selector dialog when tapped', (tester) async {
      final connection = _createTestConnection();

      await tester.pumpWidget(createTestWidget(activeConnection: connection));

      // Tap on the instance selector
      await tester.tap(find.text('Test Database'));
      await tester.pumpAndSettle();

      // Should open the dialog
      expect(find.text('Select Database Instance'), findsOneWidget);
      expect(find.text('Add Connection'), findsOneWidget);
    });

    testWidgets('displays correct connection status colors', (tester) async {
      final connection = _createTestConnection(
        type: DatabaseType.postgresql,
        status: ConnectionStatus.connecting,
      );

      await tester.pumpWidget(createTestWidget(activeConnection: connection));

      // Find the icon and check its color (connecting should be orange)
      final icon = tester.widget<Icon>(find.byIcon(Icons.account_tree));
      expect(icon.color, Colors.orange);
    });
  });
}