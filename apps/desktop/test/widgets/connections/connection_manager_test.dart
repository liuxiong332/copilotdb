import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:database_gui_desktop/src/models/database_connection.dart';
import 'package:database_gui_desktop/src/providers/database_provider.dart';
import 'package:database_gui_desktop/src/widgets/connections/connection_manager.dart';

// Mock DatabaseProvider for testing
class MockDatabaseProvider extends DatabaseProvider {
  bool _mockIsInitialized = false;
  bool _mockIsLoading = false;
  String? _mockErrorMessage;
  List<DatabaseConnection> _mockConnections = [];
  DatabaseConnection? _mockActiveConnection;

  @override
  bool get isInitialized => _mockIsInitialized;

  @override
  bool get isLoading => _mockIsLoading;

  @override
  String? get errorMessage => _mockErrorMessage;

  @override
  List<DatabaseConnection> get connections => _mockConnections;

  @override
  DatabaseConnection? get activeConnection => _mockActiveConnection;

  void setMockState({
    bool? isInitialized,
    bool? isLoading,
    String? errorMessage,
    List<DatabaseConnection>? connections,
    DatabaseConnection? activeConnection,
  }) {
    _mockIsInitialized = isInitialized ?? _mockIsInitialized;
    _mockIsLoading = isLoading ?? _mockIsLoading;
    _mockErrorMessage = errorMessage;
    _mockConnections = connections ?? _mockConnections;
    _mockActiveConnection = activeConnection;
    notifyListeners();
  }

  @override
  Future<void> initialize() async {
    _mockIsInitialized = true;
    notifyListeners();
  }

  @override
  Future<void> refreshConnections() async {
    _mockErrorMessage = null;
    notifyListeners();
  }

  @override
  Future<void> clearAllConnections() async {
    _mockConnections.clear();
    _mockActiveConnection = null;
    notifyListeners();
  }
}

void main() {
  group('ConnectionManager Widget Tests', () {
    late MockDatabaseProvider mockProvider;

    setUp(() {
      mockProvider = MockDatabaseProvider();
    });

    Widget createTestWidget() {
      return MaterialApp(
        home: ChangeNotifierProvider<DatabaseProvider>.value(
          value: mockProvider,
          child: const Scaffold(
            body: ConnectionManager(),
          ),
        ),
      );
    }

    testWidgets('shows loading indicator when not initialized', (WidgetTester tester) async {
      mockProvider.setMockState(isInitialized: false, isLoading: true);

      await tester.pumpWidget(createTestWidget());

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading connections...'), findsOneWidget);
    });

    testWidgets('shows empty state when no connections', (WidgetTester tester) async {
      mockProvider.setMockState(isInitialized: true, connections: []);

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.text('No Database Connections'), findsOneWidget);
      expect(find.text('Add your first database connection to get started'), findsOneWidget);
      expect(find.text('Add Connection'), findsOneWidget);
    });

    testWidgets('shows error banner when error exists', (WidgetTester tester) async {
      mockProvider.setMockState(
        isInitialized: true,
        errorMessage: 'Test error message',
      );

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.text('Test error message'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });

    testWidgets('shows connection list when connections exist', (WidgetTester tester) async {
      final testConnection = DatabaseConnection(
        id: '1',
        name: 'Test Connection',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
        ),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockState(
        isInitialized: true,
        connections: [testConnection],
      );

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.text('Test Connection'), findsOneWidget);
      expect(find.text('Database Connections'), findsOneWidget);
    });

    testWidgets('shows header with correct buttons', (WidgetTester tester) async {
      mockProvider.setMockState(isInitialized: true);

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.text('Database Connections'), findsOneWidget);
      expect(find.byIcon(Icons.storage), findsOneWidget);
      
      // Check for buttons by tooltip to be more specific
      expect(find.byTooltip('Add Connection'), findsOneWidget);
      expect(find.byTooltip('Refresh'), findsOneWidget);
    });

    testWidgets('refresh button is tappable', (WidgetTester tester) async {
      mockProvider.setMockState(isInitialized: true);

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      final refreshButton = find.byTooltip('Refresh');
      expect(refreshButton, findsOneWidget);

      // Should be tappable without error
      await tester.tap(refreshButton);
      await tester.pump();
    });

    testWidgets('shows more options menu when connections exist', (WidgetTester tester) async {
      final testConnection = DatabaseConnection(
        id: '1',
        name: 'Test Connection',
        type: DatabaseType.postgresql,
        config: const DatabaseConnectionConfig(
          host: 'localhost',
          port: 5432,
          database: 'testdb',
        ),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      mockProvider.setMockState(
        isInitialized: true,
        connections: [testConnection],
      );

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.byIcon(Icons.more_vert), findsOneWidget);
    });

    testWidgets('does not show more options menu when no connections', (WidgetTester tester) async {
      mockProvider.setMockState(isInitialized: true, connections: []);

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.byIcon(Icons.more_vert), findsNothing);
    });

    testWidgets('error banner close button clears error', (WidgetTester tester) async {
      mockProvider.setMockState(
        isInitialized: true,
        errorMessage: 'Test error',
      );

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.text('Test error'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.close));
      await tester.pump();

      // Error should be cleared after refresh
      expect(mockProvider.errorMessage, isNull);
    });

    testWidgets('buttons are disabled when loading', (WidgetTester tester) async {
      mockProvider.setMockState(
        isInitialized: true,
        isLoading: true,
      );

      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Find IconButton widgets specifically, not just icons
      final addButtons = find.byType(IconButton);
      expect(addButtons, findsAtLeastNWidgets(2)); // Should have at least add and refresh buttons

      // Check that buttons exist but are disabled when loading
      final iconButtons = tester.widgetList<IconButton>(addButtons);
      for (final button in iconButtons) {
        expect(button.onPressed, isNull, reason: 'Button should be disabled when loading');
      }
    });
  });
}