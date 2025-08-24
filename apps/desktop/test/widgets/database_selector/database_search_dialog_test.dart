import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../../lib/src/models/database_connection.dart';
import '../../../lib/src/models/database_schema.dart';
import '../../../lib/src/providers/database_provider.dart';
import '../../../lib/src/widgets/database_selector/database_search_dialog.dart';

void main() {
  group('DatabaseSearchDialog', () {
    late DatabaseProvider mockProvider;

    setUp(() {
      mockProvider = DatabaseProvider();
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

      mockProvider.addConnection(connection);
      mockProvider.setActiveConnection(connection.id);

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

    testWidgets('clears search field when clear button is tapped', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Enter some text
      await tester.enterText(find.byType(TextField), 'test search');
      await tester.pump();

      // Should show clear button
      expect(find.byIcon(Icons.clear), findsOneWidget);

      // Tap clear button
      await tester.tap(find.byIcon(Icons.clear));
      await tester.pump();

      // Text field should be empty
      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.controller?.text, isEmpty);
    });

    testWidgets('shows initial state message when no search term', (tester) async {
      await tester.pumpWidget(createTestWidget());
      
      // Wait for loading to complete (mock will fail to load schema)
      await tester.pump(const Duration(seconds: 1));

      expect(find.text('Enter a search term to find databases, tables, or columns'), findsOneWidget);
    });

    testWidgets('shows no results state when search returns empty', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Enter search term that won't match anything
      await tester.enterText(find.byType(TextField), 'nonexistent');
      await tester.pump();

      // Should show no results state
      expect(find.byIcon(Icons.search_off), findsOneWidget);
      expect(find.text('No Results Found'), findsOneWidget);
      expect(find.text('Try a different search term'), findsOneWidget);
    });
  });
}