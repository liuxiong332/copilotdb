import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:database_gui_desktop/src/services/ai_service.dart';
import 'package:database_gui_desktop/src/providers/auth_provider.dart';

// Mock AuthProvider for testing
class MockAuthProvider extends ChangeNotifier implements AuthProvider {
  bool _isAuthenticated = false;
  bool _isLoading = false;

  @override
  bool get isAuthenticated => _isAuthenticated;

  @override
  bool get isLoading => _isLoading;

  @override
  get user => null;

  @override
  String? get errorMessage => null;

  void setAuthenticated(bool value) {
    _isAuthenticated = value;
    notifyListeners();
  }

  @override
  Future<bool> signIn(String email, String password) async {
    _isAuthenticated = true;
    notifyListeners();
    return true;
  }

  @override
  Future<bool> signUp(String email, String password) async {
    _isAuthenticated = true;
    notifyListeners();
    return true;
  }

  @override
  Future<void> signOut() async {
    _isAuthenticated = false;
    notifyListeners();
  }

  @override
  void clearError() {}
}

void main() {
  group('AiService', () {
    testWidgets('requireAuthentication returns true when already authenticated', (WidgetTester tester) async {
      final mockAuthProvider = MockAuthProvider();
      mockAuthProvider.setAuthenticated(true);

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>(
            create: (_) => mockAuthProvider,
            child: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () async {
                    final result = await AiService.requireAuthentication(context);
                    expect(result, true);
                  },
                  child: const Text('Test'),
                );
              },
            ),
          ),
        ),
      );

      await tester.tap(find.text('Test'));
      await tester.pumpAndSettle();
    });

    testWidgets('requireAuthentication shows login dialog when not authenticated', (WidgetTester tester) async {
      final mockAuthProvider = MockAuthProvider();
      mockAuthProvider.setAuthenticated(false);

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>(
            create: (_) => mockAuthProvider,
            child: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () async {
                    AiService.requireAuthentication(context);
                  },
                  child: const Text('Test'),
                );
              },
            ),
          ),
        ),
      );

      await tester.tap(find.text('Test'));
      await tester.pumpAndSettle();

      // Verify login dialog is shown
      expect(find.text('Login Required'), findsOneWidget);
      expect(find.text('AI Features Require Authentication'), findsOneWidget);
    });
  });
}