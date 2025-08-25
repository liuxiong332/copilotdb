import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../widgets/auth/login_dialog.dart';

class AiService {
  /// Checks if the user is authenticated for AI features.
  /// If not authenticated, shows a login dialog.
  /// Returns true if the user is authenticated or successfully logs in.
  /// Returns false if the user cancels the login dialog.
  static Future<bool> requireAuthentication(BuildContext context) async {
    final authProvider = context.read<AuthProvider>();
    
    // If already authenticated, allow access
    if (authProvider.isAuthenticated) {
      return true;
    }
    
    // Show login dialog
    final result = await LoginDialog.show(context);
    return result ?? false;
  }

  /// Executes an AI feature function only if the user is authenticated.
  /// Shows login dialog if not authenticated.
  static Future<T?> executeWithAuth<T>(
    BuildContext context,
    Future<T> Function() aiFunction,
  ) async {
    final isAuthenticated = await requireAuthentication(context);
    
    if (isAuthenticated) {
      return await aiFunction();
    }
    
    return null;
  }

  /// Shows a snackbar message when AI features are accessed without authentication
  static void showAuthRequiredMessage(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.auto_awesome, color: Colors.white),
            SizedBox(width: 8),
            Text('AI features require authentication'),
          ],
        ),
        action: SnackBarAction(
          label: 'Login',
          onPressed: () => requireAuthentication(context),
        ),
      ),
    );
  }
}