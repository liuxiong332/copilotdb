import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:database_gui_desktop/src/models/database_connection.dart';
import 'package:database_gui_desktop/src/providers/database_provider.dart';
import 'package:database_gui_desktop/src/widgets/explorer/database_explorer.dart';

// Mock DatabaseProvider for testing
class MockDatabaseProvider extends DatabaseProvider {
  DatabaseConnection? _mockActiveConnection;
  
  @override
  DatabaseConnection? get activeConnection => _mockActiveConnection;
  
  void setMockActiveConnection(DatabaseConnection? connection) {
    _mockActiveConnection = connection;
    notifyListeners();
  }
}

void main() {
  group('DatabaseExplorer Widget Tests', () {
    late MockDatabaseProvider mockProvider;

    setUp(() {
      mockProvider = MockDatabaseProvider();
    });

    Widget createTestWidget() {
      return MaterialApp(
        home: ChangeNotifierProvider<DatabaseProvider>.value(
          value: mockProvider,
          child: const Scaffold(
            body: DatabaseExplorer(),
          ),
        ),
      );
    }

    testWidgets('shows no connection state when no active connection', (WidgetTester tester) async {
      mockProvider.setMockActiveConnection(null);

      await tester.pumpWidget(createTestWidget());

      expect(find.text('No Active Connection'), findsOneWidget);
      expect(find.text('Select and connect to a database to explore its structure'), findsOneWidget);
      expect(find.byIcon(Icons.account_tree_outlined), findsOneWidget);
    });

    testWidgets('shows not connected state when connection is not active', (WidgetTester tester) async {
      final connection = DatabaseConnection(
        id: '1',
        name: 'Test Connection',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
        ),
        status: ConnectionStatus.disconnected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockActiveConnection(connection);

      await tester.pumpWidget(createTestWidget());

      expect(find.text('Connection Not Active'), findsOneWidget);
      expect(find.text('The connection "Test Connection" is not active'), findsOneWidget);
      expect(find.text('Test Connection'), findsOneWidget);
      expect(find.byIcon(Icons.cloud_off), findsOneWidget);
    });

    testWidgets('shows header when connection is active', (WidgetTester tester) async {
      final connection = DatabaseConnection(
        id: '1',
        name: 'Test Connection',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
        ),
        status: ConnectionStatus.connected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockActiveConnection(connection);

      await tester.pumpWidget(createTestWidget());

      expect(find.text('Database Explorer'), findsOneWidget);
      expect(find.text('Test Connection'), findsOneWidget);
      expect(find.byIcon(Icons.account_tree), findsOneWidget);
      expect(find.byIcon(Icons.refresh), findsOneWidget);
    });

    testWidgets('shows loading state initially when connection is active', (WidgetTester tester) async {
      final connection = DatabaseConnection(
        id: '1',
        name: 'Test Connection',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
        ),
        status: ConnectionStatus.connected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockActiveConnection(connection);

      await tester.pumpWidget(createTestWidget());

      // Should show loading initially
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('refresh button is present and tappable', (WidgetTester tester) async {
      final connection = DatabaseConnection(
        id: '1',
        name: 'Test Connection',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
        ),
        status: ConnectionStatus.connected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockActiveConnection(connection);

      await tester.pumpWidget(createTestWidget());

      final refreshButton = find.byIcon(Icons.refresh);
      expect(refreshButton, findsOneWidget);

      // Should be tappable
      await tester.tap(refreshButton);
      await tester.pump();
    });

    testWidgets('test connection button works in not connected state', (WidgetTester tester) async {
      final connection = DatabaseConnection(
        id: '1',
        name: 'Test Connection',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
        ),
        status: ConnectionStatus.disconnected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockActiveConnection(connection);

      await tester.pumpWidget(createTestWidget());

      final testButton = find.text('Test Connection');
      expect(testButton, findsOneWidget);

      await tester.tap(testButton);
      await tester.pump();
    });

    testWidgets('shows different icons for different connection statuses', (WidgetTester tester) async {
      // Test error status
      final errorConnection = DatabaseConnection(
        id: '1',
        name: 'Error Connection',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
        ),
        status: ConnectionStatus.error,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockActiveConnection(errorConnection);

      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.cloud_off), findsOneWidget);
    });

    testWidgets('header shows correct connection name', (WidgetTester tester) async {
      final connection = DatabaseConnection(
        id: '1',
        name: 'My Production DB',
        type: DatabaseType.mysql,
        config: const DatabaseConnectionConfig(
          host: 'prod.example.com',
          port: 3306,
          database: 'production',
        ),
        status: ConnectionStatus.connected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockActiveConnection(connection);

      await tester.pumpWidget(createTestWidget());

      expect(find.text('My Production DB'), findsOneWidget);
    });
  });
}