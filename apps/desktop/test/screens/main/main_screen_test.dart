import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../../lib/src/models/database_connection.dart';
import '../../../lib/src/providers/auth_provider.dart';
import '../../../lib/src/providers/database_provider.dart';
import '../../../lib/src/screens/main/main_screen.dart';
import '../../../lib/src/widgets/database_selector/database_instance_selector.dart';
import '../../../lib/src/widgets/explorer/database_explorer.dart';

// Mock AuthProvider for testing
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

void main() {
  group('MainScreen', () {
    late MockAuthProvider mockAuthProvider;
    late DatabaseProvider mockDatabaseProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
      mockDatabaseProvider = DatabaseProvider();
    });

    Widget createTestWidget() {
      return MaterialApp(
        home: MultiProvider(
          providers: [
            ChangeNotifierProvider<AuthProvider>.value(value: mockAuthProvider),
            ChangeNotifierProvider<DatabaseProvider>.value(value: mockDatabaseProvider),
          ],
          child: const MainScreen(),
        ),
      );
    }

    testWidgets('displays app bar with title and user menu', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Database GUI Client'), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
      
      // Should show user avatar
      expect(find.byType(CircleAvatar), findsOneWidget);
      expect(find.text('T'), findsOneWidget); // First letter of test@example.com
    });

    testWidgets('displays database instance selector', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byType(DatabaseInstanceSelector), findsOneWidget);
    });

    testWidgets('displays database explorer', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byType(DatabaseExplorer), findsOneWidget);
    });

    testWidgets('displays query editor placeholder', (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Query Editor'), findsOneWidget);
      expect(find.text('Query execution interface coming in the next tasks...'), findsOneWidget);
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

      // Main structure should be Column with DatabaseInstanceSelector at top
      final mainColumn = find.byType(Column).first;
      expect(mainColumn, findsOneWidget);

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