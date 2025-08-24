import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:database_gui_desktop/src/app.dart';
import 'package:database_gui_desktop/src/providers/auth_provider.dart';
import 'package:database_gui_desktop/src/providers/database_provider.dart';

// Mock AuthProvider for testing
class MockAuthProvider extends ChangeNotifier implements AuthProvider {
  User? _user;
  
  @override
  User? get user => _user;
  
  @override
  bool get isAuthenticated => _user != null;
  
  @override
  bool isLoading = false;
  
  @override
  String? errorMessage;

  @override
  Future<bool> signIn(String email, String password) async {
    return false;
  }

  @override
  Future<bool> signUp(String email, String password) async {
    return false;
  }

  @override
  Future<void> signOut() async {}

  @override
  void clearError() {
    errorMessage = null;
    notifyListeners();
  }
}

void main() {
  group('DatabaseGuiApp Widget Tests', () {
    testWidgets('App shows login screen when not authenticated', (WidgetTester tester) async {
      // Create a mock auth provider that is not authenticated
      final authProvider = MockAuthProvider();
      final databaseProvider = DatabaseProvider();

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
            ChangeNotifierProvider<DatabaseProvider>.value(value: databaseProvider),
          ],
          child: const DatabaseGuiApp(),
        ),
      );

      // Wait for the widget to settle
      await tester.pumpAndSettle();

      // Verify that login screen elements are present
      expect(find.text('Database GUI Client'), findsOneWidget);
      expect(find.text('Connect to your databases with AI assistance'), findsOneWidget);
      expect(find.byType(TextFormField), findsNWidgets(2)); // Email and password fields
      expect(find.text('Sign In'), findsOneWidget);
    });

    testWidgets('Login form validation works correctly', (WidgetTester tester) async {
      final authProvider = MockAuthProvider();
      final databaseProvider = DatabaseProvider();

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
            ChangeNotifierProvider<DatabaseProvider>.value(value: databaseProvider),
          ],
          child: const DatabaseGuiApp(),
        ),
      );

      await tester.pumpAndSettle();

      // Try to submit empty form
      await tester.tap(find.text('Sign In'));
      await tester.pump();

      // Verify validation messages appear
      expect(find.text('Please enter your email'), findsOneWidget);
      expect(find.text('Please enter your password'), findsOneWidget);
    });

    testWidgets('Can toggle between sign in and sign up', (WidgetTester tester) async {
      final authProvider = MockAuthProvider();
      final databaseProvider = DatabaseProvider();

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
            ChangeNotifierProvider<DatabaseProvider>.value(value: databaseProvider),
          ],
          child: const DatabaseGuiApp(),
        ),
      );

      await tester.pumpAndSettle();

      // Initially should show sign in
      expect(find.text('Sign In'), findsOneWidget);
      expect(find.text('Don\'t have an account? Sign Up'), findsOneWidget);

      // Tap to switch to sign up
      await tester.tap(find.text('Don\'t have an account? Sign Up'));
      await tester.pump();

      // Should now show sign up
      expect(find.text('Sign Up'), findsOneWidget);
      expect(find.text('Already have an account? Sign In'), findsOneWidget);
    });

    testWidgets('Password visibility toggle works', (WidgetTester tester) async {
      final authProvider = MockAuthProvider();
      final databaseProvider = DatabaseProvider();

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
            ChangeNotifierProvider<DatabaseProvider>.value(value: databaseProvider),
          ],
          child: const DatabaseGuiApp(),
        ),
      );

      await tester.pumpAndSettle();

      // Find password field
      final passwordField = find.byKey(const Key('password_field')).first;
      
      // Find visibility toggle button
      final visibilityToggle = find.byIcon(Icons.visibility);
      expect(visibilityToggle, findsOneWidget);

      // Tap to show password
      await tester.tap(visibilityToggle);
      await tester.pump();

      // Should now show visibility_off icon
      expect(find.byIcon(Icons.visibility_off), findsOneWidget);
    });
  });
}
