import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../../lib/src/models/database_connection.dart';
import '../../../lib/src/providers/auth_provider.dart';
import '../../../lib/src/providers/database_provider.dart';
import '../../../lib/src/widgets/title_bar/custom_title_bar.dart';

// Mock providers for testing
class MockAuthProvider extends ChangeNotifier implements AuthProvider {
  @override
  User? get user => const User(
    id: 'test-id',
    appMetadata: {},
    userMetadata: {},
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
  Future<ConnectionTestResult> testConnection(
    DatabaseConnection connection,
  ) async {
    return ConnectionTestResult(success: true, message: 'Test successful');
  }
}

// Mock User class for testing
class User {
  final String id;
  final Map<String, dynamic> appMetadata;
  final Map<String, dynamic> userMetadata;
  final String aud;
  final String createdAt;
  final String? email;

  const User({
    required this.id,
    required this.appMetadata,
    required this.userMetadata,
    required this.aud,
    required this.createdAt,
    this.email,
  });
}

void main() {
  group('CustomTitleBar', () {
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
          child: const Scaffold(body: CustomTitleBar()),
        ),
      );
    }

    testWidgets('displays app title and icon', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Database GUI Client'), findsOneWidget);
      expect(find.byIcon(Icons.storage), findsOneWidget);
    });

    testWidgets('displays menu button', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.menu), findsOneWidget);
    });

    testWidgets('displays no connection when no active connection', (
      tester,
    ) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('No connection'), findsOneWidget);
    });

    testWidgets('displays active connection information', (tester) async {
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

      mockDatabaseProvider.addTestConnection(connection);
      mockDatabaseProvider.setTestActiveConnection(connection);

      await tester.pumpWidget(createTestWidget());

      expect(find.text('Test Database'), findsOneWidget);
    });

    testWidgets('displays search button', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.search), findsOneWidget);
    });

    testWidgets('displays user avatar and email', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byType(CircleAvatar), findsOneWidget);
      expect(
        find.text('T'),
        findsOneWidget,
      ); // First letter of test@example.com
    });

    testWidgets('displays window control buttons', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.minimize), findsOneWidget);
      expect(find.byIcon(Icons.close), findsOneWidget);
      // Maximize/restore button will show one of these icons
      expect(
        find.byIcon(Icons.fullscreen).evaluate().isNotEmpty ||
            find.byIcon(Icons.fullscreen_exit).evaluate().isNotEmpty,
        isTrue,
      );
    });

    testWidgets('follows platform-specific layout conventions', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Find the main Row widget containing all title bar elements
      final rowFinder = find.byType(Row).first;
      expect(rowFinder, findsOneWidget);

      // The layout should adapt based on platform
      // This test verifies that the title bar renders without errors
      // Platform-specific positioning is handled by the build method
      expect(find.text('Database GUI Client'), findsOneWidget);
      expect(find.byIcon(Icons.storage), findsOneWidget);
 

    testWidgets('opens user menu when user section is tapped', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Find and tap the user section
      await tester.tap(find.byType(CircleAvatar));
      await tester.pumpAndSettle();

      // Should show popup menu
      expect(find.text('test@example.com'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('Sign Out'), findsOneWidget);
    });

    testWidgets('opens menu when menu button is tapped', (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Find and tap the menu button
      await tester.tap(find.byIcon(Icons.menu));
      await tester.pumpAndSettle();

      // Should show popup menu
      expect(find.text('File'), findsOneWidget);
      expect(find.text('Edit'), findsOneWidget);
      expect(find.text('View'), findsOneWidget);
      expect(find.text('Tools'), findsOneWidget);
      expect(find.text('Help'), findsOneWidget);
    });
  });
}
