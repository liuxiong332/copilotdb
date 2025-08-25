import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthProvider extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  User? _user;
  bool _isLoading = true;
  String? _errorMessage;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      // Listen to auth state changes
      _supabase.auth.onAuthStateChange.listen((data) {
        _user = data.session?.user;
        _isLoading = false;
        notifyListeners();
      });

      // Check for existing session
      final session = _supabase.auth.currentSession;
      _user = session?.user;
    } catch (e) {
      _errorMessage = 'Failed to initialize authentication: $e';
      debugPrint('Auth initialization error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> signIn(String email, String password) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user != null) {
        _user = response.user;
        await _storeCredentials(email, password);
        return true;
      }
      return false;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected error occurred: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> signUp(String email, String password) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
      );

      if (response.user != null) {
        _user = response.user;
        await _storeCredentials(email, password);
        return true;
      }
      return false;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected error occurred: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    try {
      await _supabase.auth.signOut();
      await _clearStoredCredentials();
      _user = null;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Failed to sign out: $e';
      debugPrint('Sign out error: $e');
    }
  }

  Future<void> _storeCredentials(String email, String password) async {
    try {
      await _secureStorage.write(key: 'user_email', value: email);
      await _secureStorage.write(key: 'user_password', value: password);
    } catch (e) {
      debugPrint('Failed to store credentials: $e');
    }
  }

  Future<void> _clearStoredCredentials() async {
    try {
      await _secureStorage.delete(key: 'user_email');
      await _secureStorage.delete(key: 'user_password');
    } catch (e) {
      debugPrint('Failed to clear stored credentials: $e');
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
