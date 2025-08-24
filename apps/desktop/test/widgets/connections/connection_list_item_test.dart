import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:database_gui_desktop/src/models/database_connection.dart';
import 'package:database_gui_desktop/src/widgets/connections/connection_list_item.dart';

void main() {
  group('ConnectionListItem Widget Tests', () {
    late DatabaseConnection testConnection;

    setUp(() {
      testConnection = DatabaseConnection(
        id: '1',
        name: 'Test PostgreSQL',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'testuser',
        ),
        status: ConnectionStatus.connected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        lastConnected: DateTime.now().subtract(const Duration(minutes: 5)),
      );
    });

    Widget createTestWidget({
      DatabaseConnection? connection,
      bool isActive = false,
      VoidCallback? onTap,
      VoidCallback? onEdit,
      VoidCallback? onDelete,
      VoidCallback? onTest,
    }) {
      return MaterialApp(
        home: Scaffold(
          body: ConnectionListItem(
            connection: connection ?? testConnection,
            isActive: isActive,
            onTap: onTap,
            onEdit: onEdit,
            onDelete: onDelete,
            onTest: onTest,
          ),
        ),
      );
    }

    testWidgets('displays connection name and description', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Test PostgreSQL'), findsOneWidget);
      expect(find.text('PostgreSQL • localhost:5432/testdb'), findsOneWidget);
    });

    testWidgets('shows correct status indicator for connected state', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Connected'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle), findsOneWidget);
    });

    testWidgets('shows correct status indicator for error state', (WidgetTester tester) async {
      final errorConnection = testConnection.copyWith(
        status: ConnectionStatus.error,
        errorMessage: 'Connection failed',
      );

      await tester.pumpWidget(createTestWidget(connection: errorConnection));

      expect(find.text('Error'), findsOneWidget);
      expect(find.byIcon(Icons.error), findsOneWidget);
      expect(find.text('Connection failed'), findsOneWidget);
    });

    testWidgets('shows correct status indicator for testing state', (WidgetTester tester) async {
      final testingConnection = testConnection.copyWith(
        status: ConnectionStatus.testing,
      );

      await tester.pumpWidget(createTestWidget(connection: testingConnection));

      expect(find.text('Testing'), findsOneWidget);
      expect(find.byIcon(Icons.sync), findsOneWidget);
    });

    testWidgets('shows last connected time', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.textContaining('Last connected:'), findsOneWidget);
      expect(find.textContaining('5m ago'), findsOneWidget);
    });

    testWidgets('displays different styling when active', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(isActive: true));

      final card = tester.widget<Card>(find.byType(Card));
      expect(card.elevation, equals(4));
    });

    testWidgets('displays normal styling when not active', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(isActive: false));

      final card = tester.widget<Card>(find.byType(Card));
      expect(card.elevation, equals(1));
    });

    testWidgets('shows correct icon for PostgreSQL', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.storage), findsOneWidget);
    });

    testWidgets('shows correct icon for MongoDB', (WidgetTester tester) async {
      final mongoConnection = testConnection.copyWith(
        type: DatabaseType.mongodb,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 27017,
          database: 'testdb',
        ),
      );

      await tester.pumpWidget(createTestWidget(connection: mongoConnection));

      expect(find.byIcon(Icons.account_tree), findsOneWidget);
    });

    testWidgets('shows correct icon for SQLite', (WidgetTester tester) async {
      final sqliteConnection = testConnection.copyWith(
        type: DatabaseType.sqlite,
        config: const DatabaseConnectionConfig(
          database: 'testdb',
          filePath: '/path/to/test.db',
        ),
      );

      await tester.pumpWidget(createTestWidget(connection: sqliteConnection));

      expect(find.byIcon(Icons.folder), findsOneWidget);
      expect(find.text('SQLite • /path/to/test.db'), findsOneWidget);
    });

    testWidgets('shows action buttons', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.wifi_protected_setup), findsOneWidget); // Test button
      expect(find.byIcon(Icons.edit), findsOneWidget); // Edit button
      expect(find.byIcon(Icons.delete), findsOneWidget); // Delete button
    });

    testWidgets('calls onTap when tapped', (WidgetTester tester) async {
      bool tapped = false;
      await tester.pumpWidget(createTestWidget(
        onTap: () => tapped = true,
      ));

      await tester.tap(find.byType(InkWell).first);
      expect(tapped, isTrue);
    });

    testWidgets('calls onEdit when edit button tapped', (WidgetTester tester) async {
      bool editTapped = false;
      await tester.pumpWidget(createTestWidget(
        onEdit: () => editTapped = true,
      ));

      await tester.tap(find.byIcon(Icons.edit));
      expect(editTapped, isTrue);
    });

    testWidgets('calls onDelete when delete button tapped', (WidgetTester tester) async {
      bool deleteTapped = false;
      await tester.pumpWidget(createTestWidget(
        onDelete: () => deleteTapped = true,
      ));

      await tester.tap(find.byIcon(Icons.delete));
      expect(deleteTapped, isTrue);
    });

    testWidgets('calls onTest when test button tapped', (WidgetTester tester) async {
      bool testTapped = false;
      await tester.pumpWidget(createTestWidget(
        onTest: () => testTapped = true,
      ));

      await tester.tap(find.byIcon(Icons.wifi_protected_setup));
      expect(testTapped, isTrue);
    });

    testWidgets('formats time correctly for different durations', (WidgetTester tester) async {
      // Test days ago
      final daysAgoConnection = testConnection.copyWith(
        lastConnected: DateTime.now().subtract(const Duration(days: 2)),
      );
      await tester.pumpWidget(createTestWidget(connection: daysAgoConnection));
      expect(find.textContaining('2d ago'), findsOneWidget);

      // Test hours ago
      final hoursAgoConnection = testConnection.copyWith(
        lastConnected: DateTime.now().subtract(const Duration(hours: 3)),
      );
      await tester.pumpWidget(createTestWidget(connection: hoursAgoConnection));
      await tester.pump();
      expect(find.textContaining('3h ago'), findsOneWidget);

      // Test just now
      final justNowConnection = testConnection.copyWith(
        lastConnected: DateTime.now().subtract(const Duration(seconds: 30)),
      );
      await tester.pumpWidget(createTestWidget(connection: justNowConnection));
      await tester.pump();
      expect(find.textContaining('Just now'), findsOneWidget);
    });

    testWidgets('does not show last connected when null', (WidgetTester tester) async {
      final noLastConnectedConnection = DatabaseConnection(
        id: '1',
        name: 'Test PostgreSQL',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'testuser',
        ),
        status: ConnectionStatus.connected,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        lastConnected: null, // Explicitly null
      );

      await tester.pumpWidget(createTestWidget(connection: noLastConnectedConnection));

      expect(find.textContaining('Last connected:'), findsNothing);
    });

    testWidgets('shows error message when present', (WidgetTester tester) async {
      final errorConnection = testConnection.copyWith(
        status: ConnectionStatus.error,
        errorMessage: 'Authentication failed',
      );

      await tester.pumpWidget(createTestWidget(connection: errorConnection));

      expect(find.text('Authentication failed'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });

    testWidgets('does not show error message when null', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.error_outline), findsNothing);
    });
  });
}