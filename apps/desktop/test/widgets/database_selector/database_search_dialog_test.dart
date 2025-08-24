import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../../lib/src/models/database_connection.dart';
import '../../../lib/src/providers/database_provider.dart';
import '../../../lib/src/widgets/database_selector/database_search_dialog.dart';

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

void main() {
  group('DatabaseSearchDialog', () {
    late MockDatabaseProvider mockProvider;

    setUp(() {
      mockProvider = MockDatabaseProvider();
    });

    Widget createTestWidget() {
      final connection = DatabaseConnection(
        id: 'test-id',
        name: 'Test Database',
        type: DatabaseType.mysql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 3306,
          database: 'testdb',
          username: 'user',
          password: 'pass',
        ),
        status: ConnectionStatus.connected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.addTestConnection(connection);
      mockProvider.setTestActiveConnection(connection);

      return MaterialApp(
        home: ChangeNotifierProvider<DatabaseProvider>.value(
          value: mockProvider,
          child: const Scaffold(
            body: DatabaseSearchDialog(),
          ),
        ),
      );
    }

    testWidgets('displays search dialog header', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Search Databases and Tables'), findsOneWidget);
      expect(find.byIcon(Icons.search), findsAtLeastNWidgets(1));
      expect(find.byIcon(Icons.close), findsOneWidget);
    });

    testWidgets('displays search field with hint text', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Search for databases, tables, or columns...'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('shows loading state initially', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading database schema...'), findsOneWidget);
    });

    testWidgets('closes dialog when close button is tapped', (tester) async {
      await tester.pumpWidget(createTestWidget());

      await tester.tap(find.byIcon(Icons.close));
      await tester.pumpAndSettle();

      // Dialog should be closed (no longer find the header)
      expect(find.text('Search Databases and Tables'), findsNothing);
    });

    testWidgets('shows search field', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Enter some text
      await tester.enterText(find.byType(TextField), 'test search');
      await tester.pump();

      // Should show the entered text
      expect(find.text('test search'), findsOneWidget);
    });

    testWidgets('shows initial loading state', (tester) async {
      await tester.pumpWidget(createTestWidget());
      
      // Wait for loading to complete (mock will fail to load schema)
      await tester.pump(const Duration(seconds: 1));

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });
}