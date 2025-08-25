import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:database_gui_desktop/src/models/database_connection.dart';
import 'package:database_gui_desktop/src/providers/auth_provider.dart';
import 'package:database_gui_desktop/src/providers/database_provider.dart';
import 'package:database_gui_desktop/src/screens/main/main_screen.dart';
import 'package:database_gui_desktop/src/widgets/title_bar/custom_title_bar.dart';
import 'package:database_gui_desktop/src/widgets/explorer/database_explorer.dart';

// Mock AuthProvider for testing
class MockAuthProvider extends ChangeNotifier implements AuthProvider {
  @override
  User? get user => User(
    id: 'test-id',
    appMetadata: const {},
    userMetadata: const {},
    aud: 'test',
    createdAt: '2023-01-01T00:00:00Z',
    email: 'test@example.com',
  );

  @override
  bool get isAuthenticated => true;

  @override
  bool isLoading = false;

  @override
  String? errorMessage;

  @override
  Future<bool> signIn(String email, String password) async => true;

  @override
  Future<bool> signUp(String email, String password) async => true;

  @override
  Future<void> signOut() async {}

  @override
  void clearError() {
    errorMessage = null;
    notifyListeners();
  }
}

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
  Future<void> setActiveConnection(String? id) async {}

  @override
  DatabaseConnection? getConnectionById(String id) => null;

  @override
  Future<ConnectionTestResult> testConnection(
    DatabaseConnection connection,
  ) async {
    return ConnectionTestResult(success: true, message: 'Test successful');
  }
}

void main() {
  group('MainScreen', () {
    late MockAuthProvider mockAuthProvider;
    late MockDatabaseProvider mockDatabaseProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
      mockDatabaseProvider = MockDatabaseProvider();
    });

    Widget createTestWidget() {
      return MaterialApp(
        home: MultiProvider(
          providers: [
            ChangeNotifierProvider<AuthProvider>.value(value: mockAuthProvider),
            ChangeNotifierProvider<DatabaseProvider>.value(
              value: mockDatabaseProvider,
            ),
          ],
          child: const MainScreen(),
        ),
      );
    }

    testWidgets('displays custom title bar with app title and user menu', (
      tester,
    ) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Database GUI Client'), findsOneWidget);
      expect(find.byType(CustomTitleBar), findsOneWidget);

      // Should show user avatar
      expect(find.byType(CircleAvatar), findsOneWidget);
      expect(
        find.text('T'),
        findsOneWidget,
      ); // First letter of test@example.com
    });

    testWidgets('displays custom title bar with database selector', (
      tester,
    ) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byType(CustomTitleBar), findsOneWidget);
      // Database selector is now part of the custom title bar
      expect(find.text('No connection'), findsOneWidget);
    });

    testWidgets('displays database explorer', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byType(DatabaseExplorer), findsOneWidget);
    });

    testWidgets('displays query editor placeholder', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Query Editor'), findsOneWidget);
      expect(
        find.text('Query execution interface coming in the next tasks...'),
        findsOneWidget,
      );
      expect(find.byIcon(Icons.code), findsOneWidget);
    });

    testWidgets('shows user menu when avatar is tapped', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Tap on user avatar
      await tester.tap(find.byType(CircleAvatar));
      await tester.pumpAndSettle();

      // Should show popup menu
      expect(find.text('test@example.com'), findsOneWidget);
      expect(find.text('Sign Out'), findsOneWidget);
      expect(find.byIcon(Icons.person), findsOneWidget);
      expect(find.byIcon(Icons.logout), findsOneWidget);
    });

    testWidgets('shows sign out confirmation dialog', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Open user menu
      await tester.tap(find.byType(CircleAvatar));
      await tester.pumpAndSettle();

      // Tap sign out
      await tester.tap(find.text('Sign Out'));
      await tester.pumpAndSettle();

      // Should show confirmation dialog
      expect(find.text('Sign Out'), findsNWidgets(2)); // Title and button
      expect(find.text('Are you sure you want to sign out?'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
    });

    testWidgets('layout has correct structure', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Main structure should be Column with CustomTitleBar at top
      final mainColumn = find.byType(Column).first;
      expect(mainColumn, findsOneWidget);

      // Should have CustomTitleBar at the top
      expect(find.byType(CustomTitleBar), findsOneWidget);

      // Should have Row for main content area
      final contentRow = find.byType(Row).last;
      expect(contentRow, findsOneWidget);

      // Database explorer should be in a sized box
      final explorerContainer = find.ancestor(
        of: find.byType(DatabaseExplorer),
        matching: find.byType(SizedBox),
      );
      expect(explorerContainer, findsOneWidget);

      // Should have expanded widget for query area
      final queryArea = find.byType(Expanded).last;
      expect(queryArea, findsOneWidget);
    });

    testWidgets('database explorer has correct width', (tester) async {
      await tester.pumpWidget(createTestWidget());

      final explorerSizedBox = tester.widget<SizedBox>(
        find.ancestor(
          of: find.byType(DatabaseExplorer),
          matching: find.byType(SizedBox),
        ),
      );

      expect(explorerSizedBox.width, 300);
    });
  });
}
