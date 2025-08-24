import 'dart:convert';
import 'dart:math';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';
import '../models/database_connection.dart';

class ConnectionStorageService {
  static const String _connectionsKey = 'database_connections';
  static const String _encryptionKeyKey = 'connection_encryption_key';
  
  final FlutterSecureStorage _secureStorage;
  final Logger _logger;
  String? _encryptionKey;

  ConnectionStorageService({
    FlutterSecureStorage? secureStorage,
    Logger? logger,
  }) : _secureStorage = secureStorage ?? const FlutterSecureStorage(),
       _logger = logger ?? Logger();

  /// Initialize the service and ensure encryption key exists
  Future<void> initialize() async {
    try {
      _encryptionKey = await _secureStorage.read(key: _encryptionKeyKey);
      if (_encryptionKey == null) {
        _encryptionKey = _generateEncryptionKey();
        await _secureStorage.write(key: _encryptionKeyKey, value: _encryptionKey);
        _logger.i('Generated new encryption key for connection storage');
      }
    } catch (e) {
      _logger.e('Failed to initialize connection storage service', error: e);
      rethrow;
    }
  }

  /// Generate a random encryption key
  String _generateEncryptionKey() {
    final random = Random.secure();
    final bytes = List<int>.generate(32, (i) => random.nextInt(256));
    return base64Encode(bytes);
  }

  /// Simple XOR encryption for demonstration (in production, use proper encryption)
  String _encrypt(String data) {
    if (_encryptionKey == null) {
      throw StateError('Encryption key not initialized');
    }
    
    final keyBytes = base64Decode(_encryptionKey!);
    final dataBytes = utf8.encode(data);
    final encryptedBytes = <int>[];
    
    for (int i = 0; i < dataBytes.length; i++) {
      encryptedBytes.add(dataBytes[i] ^ keyBytes[i % keyBytes.length]);
    }
    
    return base64Encode(encryptedBytes);
  }

  /// Simple XOR decryption for demonstration (in production, use proper encryption)
  String _decrypt(String encryptedData) {
    if (_encryptionKey == null) {
      throw StateError('Encryption key not initialized');
    }
    
    final keyBytes = base64Decode(_encryptionKey!);
    final encryptedBytes = base64Decode(encryptedData);
    final decryptedBytes = <int>[];
    
    for (int i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes.add(encryptedBytes[i] ^ keyBytes[i % keyBytes.length]);
    }
    
    return utf8.decode(decryptedBytes);
  }

  /// Save all connections to secure storage
  Future<void> saveConnections(List<DatabaseConnection> connections) async {
    try {
      final connectionsJson = connections.map((conn) {
        // Create a copy with encrypted sensitive data
        final sensitiveConfig = {
          'password': conn.config.password,
          'username': conn.config.username,
        };
        
        final encryptedSensitiveData = _encrypt(jsonEncode(sensitiveConfig));
        
        final connectionData = conn.toJson();
        connectionData['encryptedCredentials'] = encryptedSensitiveData;
        
        // Remove sensitive data from the main config
        final config = Map<String, dynamic>.from(connectionData['config']);
        config.remove('password');
        config.remove('username');
        connectionData['config'] = config;
        
        return connectionData;
      }).toList();

      final connectionsString = jsonEncode(connectionsJson);
      await _secureStorage.write(key: _connectionsKey, value: connectionsString);
      
      _logger.i('Saved ${connections.length} connections to secure storage');
    } catch (e) {
      _logger.e('Failed to save connections to secure storage', error: e);
      rethrow;
    }
  }

  /// Load all connections from secure storage
  Future<List<DatabaseConnection>> loadConnections() async {
    try {
      final connectionsString = await _secureStorage.read(key: _connectionsKey);
      if (connectionsString == null) {
        _logger.i('No saved connections found');
        return [];
      }

      final connectionsJson = jsonDecode(connectionsString) as List<dynamic>;
      final connections = <DatabaseConnection>[];

      for (final connectionData in connectionsJson) {
        try {
          final data = Map<String, dynamic>.from(connectionData);
          
          // Decrypt sensitive data
          final encryptedCredentials = data['encryptedCredentials'] as String?;
          if (encryptedCredentials != null) {
            final decryptedCredentials = _decrypt(encryptedCredentials);
            final sensitiveData = jsonDecode(decryptedCredentials) as Map<String, dynamic>;
            
            // Add sensitive data back to config
            final config = Map<String, dynamic>.from(data['config']);
            config['username'] = sensitiveData['username'];
            config['password'] = sensitiveData['password'];
            data['config'] = config;
          }
          
          // Remove the encrypted credentials field
          data.remove('encryptedCredentials');
          
          final connection = DatabaseConnection.fromJson(data);
          connections.add(connection);
        } catch (e) {
          _logger.w('Failed to parse connection data, skipping', error: e);
        }
      }

      _logger.i('Loaded ${connections.length} connections from secure storage');
      return connections;
    } catch (e) {
      _logger.e('Failed to load connections from secure storage', error: e);
      return [];
    }
  }

  /// Delete a specific connection
  Future<void> deleteConnection(String connectionId) async {
    try {
      final connections = await loadConnections();
      final updatedConnections = connections.where((conn) => conn.id != connectionId).toList();
      await saveConnections(updatedConnections);
      _logger.i('Deleted connection: $connectionId');
    } catch (e) {
      _logger.e('Failed to delete connection: $connectionId', error: e);
      rethrow;
    }
  }

  /// Clear all connections
  Future<void> clearAllConnections() async {
    try {
      await _secureStorage.delete(key: _connectionsKey);
      _logger.i('Cleared all connections from secure storage');
    } catch (e) {
      _logger.e('Failed to clear connections from secure storage', error: e);
      rethrow;
    }
  }

  /// Check if storage is available
  Future<bool> isStorageAvailable() async {
    try {
      await _secureStorage.write(key: 'test_key', value: 'test_value');
      await _secureStorage.delete(key: 'test_key');
      return true;
    } catch (e) {
      _logger.w('Secure storage is not available', error: e);
      return false;
    }
  }
}