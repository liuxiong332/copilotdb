import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:database_gui_desktop/src/models/database_schema.dart' as schema;
import 'package:database_gui_desktop/src/widgets/explorer/database_tree_node.dart';

void main() {
  group('DatabaseTreeNode Widget Tests', () {
    late schema.Database testDatabase;
    late schema.Database mongoDatabase;

    setUp(() {
      testDatabase = schema.Database(
        name: 'test_db',
        tables: [
          schema.Table(
            name: 'users',
            columns: [
              const schema.Column(name: 'id', type: 'int', nullable: false, primaryKey: true),
              const schema.Column(name: 'name', type: 'varchar', nullable: false, primaryKey: false),
            ],
            indexes: [],
            foreignKeys: [],
            rowCount: 100,
          ),
          schema.Table(
            name: 'posts',
            columns: [
              const schema.Column(name: 'id', type: 'int', nullable: false, primaryKey: true),
              const schema.Column(name: 'title', type: 'varchar', nullable: false, primaryKey: false),
            ],
            indexes: [],
            foreignKeys: [],
            rowCount: 250,
          ),
        ],
        views: [
          const schema.View(
            name: 'user_summary',
            definition: 'SELECT * FROM users',
            columns: [
              schema.Column(name: 'id', type: 'int', nullable: false, primaryKey: false),
            ],
          ),
        ],
      );

      mongoDatabase = schema.Database(
        name: 'mongo_db',
        tables: [],
        collections: [
          schema.Collection(
            name: 'products',
            indexes: [],
            documentCount: 500,
          ),
          schema.Collection(
            name: 'orders',
            indexes: [],
            documentCount: 1200,
          ),
        ],
      );
    });

    Widget createTestWidget({
      schema.Database? database,
      String? selectedTable,
      String? selectedDatabase,
      Function(String, String)? onTableSelected,
      Function(String)? onDatabaseSelected,
    }) {
      return MaterialApp(
        home: Scaffold(
          body: DatabaseTreeNode(
            database: database ?? testDatabase,
            selectedTable: selectedTable,
            selectedDatabase: selectedDatabase,
            onTableSelected: onTableSelected ?? (db, table) {},
            onDatabaseSelected: onDatabaseSelected ?? (db) {},
          ),
        ),
      );
    }

    testWidgets('displays database name and stats', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('test_db'), findsOneWidget);
      expect(find.text('3'), findsOneWidget); // 2 tables + 1 view
      expect(find.byIcon(Icons.storage), findsOneWidget);
    });

    testWidgets('expands and collapses when tapped', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      // Initially collapsed
      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
      expect(find.text('Tables'), findsNothing);

      // Tap to expand
      await tester.tap(find.text('test_db'));
      await tester.pump();

      // Should be expanded
      expect(find.byIcon(Icons.expand_more), findsOneWidget);
      expect(find.text('Tables'), findsOneWidget);
    });

    testWidgets('shows selected state correctly', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(
        selectedDatabase: 'test_db',
      ));

      // Should be auto-expanded and highlighted
      expect(find.byIcon(Icons.expand_more), findsOneWidget);
      expect(find.text('Tables'), findsOneWidget);
    });

    testWidgets('displays tables section when expanded', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      // Expand database
      await tester.tap(find.text('test_db'));
      await tester.pump();

      expect(find.text('Tables'), findsOneWidget);
      expect(find.text('(2)'), findsOneWidget); // 2 tables
      expect(find.byIcon(Icons.table_chart), findsOneWidget);
    });

    testWidgets('displays views section when expanded', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      // Expand database
      await tester.tap(find.text('test_db'));
      await tester.pump();

      expect(find.text('Views'), findsOneWidget);
      expect(find.text('(1)'), findsOneWidget); // 1 view
      expect(find.byIcon(Icons.visibility), findsOneWidget);
    });

    testWidgets('displays collections for MongoDB', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(database: mongoDatabase));

      // Expand database
      await tester.tap(find.text('mongo_db'));
      await tester.pump();

      expect(find.text('Collections'), findsOneWidget);
      expect(find.text('(2)'), findsOneWidget); // 2 collections
      expect(find.byIcon(Icons.account_tree), findsOneWidget);
    });

    testWidgets('expands tables section and shows table items', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      // Expand database
      await tester.tap(find.text('test_db'));
      await tester.pump();

      // Expand tables section
      await tester.tap(find.text('Tables'));
      await tester.pump();

      expect(find.text('users'), findsOneWidget);
      expect(find.text('posts'), findsOneWidget);
      expect(find.text('100'), findsOneWidget); // users row count
      expect(find.text('250'), findsOneWidget); // posts row count
    });

    testWidgets('calls onTableSelected when table is tapped', (WidgetTester tester) async {
      String? selectedDb;
      String? selectedTable;

      await tester.pumpWidget(createTestWidget(
        onTableSelected: (db, table) {
          selectedDb = db;
          selectedTable = table;
        },
      ));

      // Expand database and tables
      await tester.tap(find.text('test_db'));
      await tester.pump();
      await tester.tap(find.text('Tables'));
      await tester.pump();

      // Tap on users table
      await tester.tap(find.text('users'));
      await tester.pump();

      expect(selectedDb, equals('test_db'));
      expect(selectedTable, equals('users'));
    });

    testWidgets('calls onDatabaseSelected when database is tapped', (WidgetTester tester) async {
      String? selectedDb;

      await tester.pumpWidget(createTestWidget(
        onDatabaseSelected: (db) {
          selectedDb = db;
        },
      ));

      await tester.tap(find.text('test_db'));
      await tester.pump();

      expect(selectedDb, equals('test_db'));
    });

    testWidgets('shows table context menu', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      // Expand database and tables
      await tester.tap(find.text('test_db'));
      await tester.pump();
      await tester.tap(find.text('Tables'));
      await tester.pump();

      // Find and tap the more options button for users table
      final moreButtons = find.byIcon(Icons.more_horiz);
      expect(moreButtons, findsWidgets);

      await tester.tap(moreButtons.first);
      await tester.pumpAndSettle();

      expect(find.text('Table Structure'), findsOneWidget);
      expect(find.text('Sample Data'), findsOneWidget);
      expect(find.text('Insert Data'), findsOneWidget);
    });

    testWidgets('formats large numbers correctly', (WidgetTester tester) async {
      final largeDatabase = schema.Database(
        name: 'large_db',
        tables: [
          schema.Table(
            name: 'big_table',
            columns: [],
            indexes: [],
            foreignKeys: [],
            rowCount: 1500000, // 1.5M
          ),
        ],
      );

      await tester.pumpWidget(createTestWidget(database: largeDatabase));

      // Expand database and tables
      await tester.tap(find.text('large_db'));
      await tester.pump();
      await tester.tap(find.text('Tables'));
      await tester.pump();

      expect(find.text('1.5M'), findsOneWidget);
    });

    testWidgets('shows selected table state', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(
        selectedDatabase: 'test_db',
        selectedTable: 'users',
      ));

      // Should be auto-expanded
      await tester.pump();
      await tester.tap(find.text('Tables'));
      await tester.pump();

      // Users table should be highlighted (we can't easily test background color,
      // but we can verify the table is shown)
      expect(find.text('users'), findsOneWidget);
    });

    testWidgets('shows different icons for tables and views', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      // Expand database, tables, and views
      await tester.tap(find.text('test_db'));
      await tester.pump();
      await tester.tap(find.text('Tables'));
      await tester.pump();
      await tester.tap(find.text('Views'));
      await tester.pump();

      expect(find.byIcon(Icons.table_rows), findsNWidgets(2)); // 2 tables
      expect(find.byIcon(Icons.visibility), findsNWidgets(2)); // 1 view icon + 1 section icon
    });

    testWidgets('handles empty database', (WidgetTester tester) async {
      final emptyDatabase = schema.Database(
        name: 'empty_db',
        tables: [],
      );

      await tester.pumpWidget(createTestWidget(database: emptyDatabase));

      expect(find.text('empty_db'), findsOneWidget);
      // Should not show count badge for empty database
      expect(find.text('0'), findsNothing);
    });
  });
}