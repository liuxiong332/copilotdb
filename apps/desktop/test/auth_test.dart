import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:database_gui_desktop/src/providers/auth_provider.dart';
import 'package:database_gui_desktop/src/screens/auth/login_screen.dart';
import 'package:database_gui_desktop/src/screens/profile/profile_screen.dart';
import 'package:database_gui_desktop/src/widgets/auth/login_form.dart';

// Mock AuthProvider for testing
class MockAuthProvider extends ChangeNotifier implements AuthProvider {
  User? _user;
  bool _isLoading = false;
  String? _errorMessage;
  
  @override
  User? get user => _user;
  
  @override
  bool get isAuthenticated => _user != null;
  
  @override
  bool get isLoading => _isLoading;
  
  @override
  String? get errorMessage => _errorMessage;

  // Mock methods for testing
  void setUser(User? user) {
    _user = user;
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void setError(String? error) {
    _errorMessage = error;
    notifyListeners();
  }

  @override
  Future<bool> signIn(String email, String password) async {
    setLoading(true);
    
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));
    
    if (email == 'test@example.com' && password == 'password123') {
      // Mock successful login
      setUser(User(
        id: 'test-user-id',
        appMetadata: {},
        userMetadata: {},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
        email: email,
      ));
      setLoading(false);
      return true;
    } else {
      // Mock failed login
      setError('Invalid email or password');
      setLoading(false);
      return false;
    }
  }

  @override
  Future<bool> signUp(String email, String password) async {
    setLoading(true);
    
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));
    
    if (email.contains('@') && password.length >= 6) {
      // Mock successful signup
      setUser(User(
        id: 'new-user-id',
        appMetadata: {},
        userMetadata: {},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
        email: email,
      ));
      setLoading(false);
      return true;
    } else {
      // Mock failed signup
      setError('Invalid email or password too short');
      setLoading(false);
      return false;
    }
  }

  @override
  Future<void> signOut() async {
    setUser(null);
    setError(null);
  }

  @override
  void clearError() {
    setError(null);
  }
}

void main() {
  group('Authentication Tests', () {
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
    });

    testWidgets('LoginScreen displays correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const LoginScreen(),
          ),
        ),
      );

      // Verify login screen elements
      expect(find.text('Database GUI Client'), findsOneWidget);
      expect(find.text('Connect to your databases with AI assistance'), findsOneWidget);
      expect(find.byType(TextFormField), findsNWidgets(2)); // Email and password
      expect(find.text('Sign In'), findsOneWidget);
    });

    testWidgets('Login form validation works', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const LoginScreen(),
          ),
        ),
      );

      // Try to submit empty form
      await tester.tap(find.text('Sign In'));
      await tester.pump();

      // Verify validation messages
      expect(find.text('Please enter your email'), findsOneWidget);
      expect(find.text('Please enter your password'), findsOneWidget);
    });

    testWidgets('Successful login flow', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const LoginScreen(),
          ),
        ),
      );

      // Enter valid credentials
      await tester.enterText(find.byType(TextFormField).first, 'test@example.com');
      await tester.enterText(find.byType(TextFormField).last, 'password123');

      // Submit form
      await tester.tap(find.text('Sign In'));
      await tester.pump();

      // Verify loading state
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      // Wait for async operation
      await tester.pumpAndSettle();

      // Verify user is authenticated
      expect(mockAuthProvider.isAuthenticated, isTrue);
      expect(mockAuthProvider.user?.email, equals('test@example.com'));
    });

    testWidgets('Failed login shows error', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const LoginScreen(),
          ),
        ),
      );

      // Enter invalid credentials
      await tester.enterText(find.byType(TextFormField).first, 'wrong@example.com');
      await tester.enterText(find.byType(TextFormField).last, 'wrongpassword');

      // Submit form
      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();

      // Verify error message is shown
      expect(find.text('Invalid email or password'), findsOneWidget);
      expect(mockAuthProvider.isAuthenticated, isFalse);
    });

    testWidgets('Sign up flow works', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const LoginScreen(),
          ),
        ),
      );

      // Switch to sign up mode
      await tester.tap(find.text('Don\'t have an account? Sign Up'));
      await tester.pump();

      // Verify sign up button is shown
      expect(find.text('Sign Up'), findsOneWidget);

      // Enter credentials
      await tester.enterText(find.byType(TextFormField).first, 'newuser@example.com');
      await tester.enterText(find.byType(TextFormField).last, 'newpassword123');

      // Submit form
      await tester.tap(find.text('Sign Up'));
      await tester.pumpAndSettle();

      // Verify user is authenticated
      expect(mockAuthProvider.isAuthenticated, isTrue);
      expect(mockAuthProvider.user?.email, equals('newuser@example.com'));
    });

    testWidgets('Password visibility toggle works', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const LoginScreen(),
          ),
        ),
      );

      // Find password field and visibility toggle
      final passwordField = find.byKey(const Key('password_field'));
      final visibilityToggle = find.byIcon(Icons.visibility);

      expect(passwordField, findsOneWidget);
      expect(visibilityToggle, findsOneWidget);

      // Tap to show password
      await tester.tap(visibilityToggle);
      await tester.pump();

      // Should now show visibility_off icon
      expect(find.byIcon(Icons.visibility_off), findsOneWidget);
    });

    testWidgets('ProfileScreen displays user information', (WidgetTester tester) async {
      // Set up authenticated user
      mockAuthProvider.setUser(User(
        id: 'test-user-id',
        appMetadata: {},
        userMetadata: {},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
        email: 'test@example.com',
      ));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const ProfileScreen(),
          ),
        ),
      );

      // Verify profile information is displayed
      expect(find.text('Profile'), findsOneWidget);
      expect(find.text('test@example.com'), findsNWidgets(2)); // Appears in header and account info
      expect(find.text('Account Information'), findsOneWidget);
      expect(find.text('Actions'), findsOneWidget);
    });

    testWidgets('Sign out confirmation dialog works', (WidgetTester tester) async {
      // Set up authenticated user
      mockAuthProvider.setUser(User(
        id: 'test-user-id',
        appMetadata: {},
        userMetadata: {},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
        email: 'test@example.com',
      ));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const ProfileScreen(),
          ),
        ),
      );

      // Scroll down to make Sign Out button visible
      await tester.drag(find.byType(SingleChildScrollView), const Offset(0, -300));
      await tester.pumpAndSettle();

      // Tap sign out
      await tester.tap(find.text('Sign Out'));
      await tester.pumpAndSettle();

      // Verify confirmation dialog
      expect(find.text('Are you sure you want to sign out?'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);

      // Confirm sign out
      await tester.tap(find.text('Sign Out').last);
      await tester.pump();

      // Verify user is signed out
      expect(mockAuthProvider.isAuthenticated, isFalse);
    });

    testWidgets('Error clearing works', (WidgetTester tester) async {
      // Set an error
      mockAuthProvider.setError('Test error message');

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const LoginScreen(),
          ),
        ),
      );

      // Verify error is shown
      expect(find.text('Test error message'), findsOneWidget);

      // Switch between sign in and sign up (which clears errors)
      await tester.tap(find.text('Don\'t have an account? Sign Up'));
      await tester.pump();

      // Error should be cleared
      expect(mockAuthProvider.errorMessage, isNull);
    });
  });
}