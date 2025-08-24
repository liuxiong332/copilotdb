import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/database_connection.dart';
import '../../providers/database_provider.dart';
import '../../services/database_connection_service.dart';

class ConnectionFormDialog extends StatefulWidget {
  final DatabaseConnection? connection;

  const ConnectionFormDialog({
    super.key,
    this.connection,
  });

  @override
  State<ConnectionFormDialog> createState() => _ConnectionFormDialogState();
}

class _ConnectionFormDialogState extends State<ConnectionFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _hostController = TextEditingController();
  final _portController = TextEditingController();
  final _databaseController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _filePathController = TextEditingController();

  DatabaseType _selectedType = DatabaseType.postgresql;
  bool _sslEnabled = false;
  bool _isLoading = false;
  bool _passwordVisible = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializeForm();
  }

  void _initializeForm() {
    if (widget.connection != null) {
      final conn = widget.connection!;
      _nameController.text = conn.name;
      _selectedType = conn.type;
      _hostController.text = conn.config.host ?? '';
      _portController.text = conn.config.port?.toString() ?? '';
      _databaseController.text = conn.config.database;
      _usernameController.text = conn.config.username ?? '';
      _passwordController.text = conn.config.password ?? '';
      _filePathController.text = conn.config.filePath ?? '';
      _sslEnabled = conn.config.ssl;
    } else {
      // Set default port for selected database type
      _updateDefaultPort();
    }
  }

  void _updateDefaultPort() {
    if (_portController.text.isEmpty) {
      final defaultPort = DatabaseConnectionService().getDefaultPort(_selectedType);
      if (defaultPort > 0) {
        _portController.text = defaultPort.toString();
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _hostController.dispose();
    _portController.dispose();
    _databaseController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _filePathController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.connection == null ? 'Add Connection' : 'Edit Connection'),
      content: SizedBox(
        width: 500,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (_errorMessage != null) _buildErrorBanner(),
                _buildNameField(),
                const SizedBox(height: 16),
                _buildDatabaseTypeField(),
                const SizedBox(height: 16),
                if (_selectedType == DatabaseType.sqlite) ...[
                  _buildFilePathField(),
                ] else ...[
                  _buildHostField(),
                  const SizedBox(height: 16),
                  _buildPortField(),
                  const SizedBox(height: 16),
                  _buildUsernameField(),
                  const SizedBox(height: 16),
                  _buildPasswordField(),
                  const SizedBox(height: 16),
                  _buildSslField(),
                ],
                const SizedBox(height: 16),
                _buildDatabaseField(),
                const SizedBox(height: 16),
                _buildConnectionStringPreview(),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _testConnection,
          child: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Test'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _saveConnection,
          child: Text(widget.connection == null ? 'Add' : 'Save'),
        ),
      ],
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.errorContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(
            Icons.error_outline,
            color: Theme.of(context).colorScheme.onErrorContainer,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMessage!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onErrorContainer,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNameField() {
    return TextFormField(
      controller: _nameController,
      decoration: const InputDecoration(
        labelText: 'Connection Name',
        hintText: 'My Database',
        border: OutlineInputBorder(),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Connection name is required';
        }
        return null;
      },
    );
  }

  Widget _buildDatabaseTypeField() {
    return DropdownButtonFormField<DatabaseType>(
      value: _selectedType,
      decoration: const InputDecoration(
        labelText: 'Database Type',
        border: OutlineInputBorder(),
      ),
      items: DatabaseType.values.map((type) {
        return DropdownMenuItem(
          value: type,
          child: Row(
            children: [
              _getDatabaseIcon(type),
              const SizedBox(width: 8),
              Text(type.displayName),
            ],
          ),
        );
      }).toList(),
      onChanged: (value) {
        if (value != null) {
          setState(() {
            _selectedType = value;
            _updateDefaultPort();
          });
        }
      },
    );
  }

  Widget _buildHostField() {
    return TextFormField(
      controller: _hostController,
      decoration: const InputDecoration(
        labelText: 'Host',
        hintText: 'localhost',
        border: OutlineInputBorder(),
      ),
      validator: (value) {
        if (_selectedType != DatabaseType.sqlite && (value == null || value.trim().isEmpty)) {
          return 'Host is required';
        }
        return null;
      },
    );
  }

  Widget _buildPortField() {
    return TextFormField(
      controller: _portController,
      decoration: const InputDecoration(
        labelText: 'Port',
        border: OutlineInputBorder(),
      ),
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      validator: (value) {
        if (_selectedType != DatabaseType.sqlite) {
          if (value == null || value.trim().isEmpty) {
            return 'Port is required';
          }
          final port = int.tryParse(value);
          if (port == null || port <= 0 || port > 65535) {
            return 'Enter a valid port (1-65535)';
          }
        }
        return null;
      },
    );
  }

  Widget _buildDatabaseField() {
    return TextFormField(
      controller: _databaseController,
      decoration: InputDecoration(
        labelText: _selectedType == DatabaseType.sqlite ? 'Database Name' : 'Database',
        hintText: _selectedType == DatabaseType.sqlite ? 'my_database' : 'database_name',
        border: const OutlineInputBorder(),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Database name is required';
        }
        return null;
      },
    );
  }

  Widget _buildUsernameField() {
    return TextFormField(
      controller: _usernameController,
      decoration: const InputDecoration(
        labelText: 'Username',
        border: OutlineInputBorder(),
      ),
    );
  }

  Widget _buildPasswordField() {
    return TextFormField(
      controller: _passwordController,
      decoration: InputDecoration(
        labelText: 'Password',
        border: const OutlineInputBorder(),
        suffixIcon: IconButton(
          onPressed: () {
            setState(() {
              _passwordVisible = !_passwordVisible;
            });
          },
          icon: Icon(_passwordVisible ? Icons.visibility_off : Icons.visibility),
        ),
      ),
      obscureText: !_passwordVisible,
    );
  }

  Widget _buildFilePathField() {
    return Row(
      children: [
        Expanded(
          child: TextFormField(
            controller: _filePathController,
            decoration: const InputDecoration(
              labelText: 'Database File Path',
              hintText: '/path/to/database.db',
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (_selectedType == DatabaseType.sqlite && (value == null || value.trim().isEmpty)) {
                return 'File path is required for SQLite';
              }
              return null;
            },
          ),
        ),
        const SizedBox(width: 8),
        IconButton(
          onPressed: () {
            // In a real implementation, this would open a file picker
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('File picker not implemented in this demo')),
            );
          },
          icon: const Icon(Icons.folder_open),
          tooltip: 'Browse',
        ),
      ],
    );
  }

  Widget _buildSslField() {
    return Row(
      children: [
        Checkbox(
          value: _sslEnabled,
          onChanged: (value) {
            setState(() {
              _sslEnabled = value ?? false;
            });
          },
        ),
        const Text('Use SSL/TLS'),
        const SizedBox(width: 8),
        Tooltip(
          message: 'Enable SSL/TLS encryption for secure connections',
          child: Icon(
            Icons.info_outline,
            size: 16,
            color: Theme.of(context).colorScheme.outline,
          ),
        ),
      ],
    );
  }

  Widget _buildConnectionStringPreview() {
    final connectionString = DatabaseConnectionService().getConnectionStringTemplate(_selectedType);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Connection String Format:',
            style: Theme.of(context).textTheme.labelMedium,
          ),
          const SizedBox(height: 4),
          Text(
            connectionString,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              fontFamily: 'monospace',
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _getDatabaseIcon(DatabaseType type) {
    switch (type) {
      case DatabaseType.mongodb:
        return const Icon(Icons.account_tree, color: Color(0xFF4DB33D), size: 20);
      case DatabaseType.mysql:
        return const Icon(Icons.storage, color: Color(0xFF00758F), size: 20);
      case DatabaseType.postgresql:
        return const Icon(Icons.storage, color: Color(0xFF336791), size: 20);
      case DatabaseType.sqlite:
        return const Icon(Icons.folder, color: Color(0xFF003B57), size: 20);
    }
  }

  void _testConnection() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final config = _buildConnectionConfig();
      final connectionService = DatabaseConnectionService();
      final result = await connectionService.testConnection(config, _selectedType);

      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Row(
              children: [
                Icon(
                  result.success ? Icons.check_circle : Icons.error,
                  color: result.success ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 8),
                Text(result.success ? 'Connection Successful' : 'Connection Failed'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(result.message),
                if (result.error != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Error: ${result.error}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                      fontSize: 12,
                    ),
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Connection test failed: $e';
        });
      }
    }
  }

  void _saveConnection() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final provider = context.read<DatabaseProvider>();
      final config = _buildConnectionConfig();
      
      final connection = DatabaseConnection(
        id: widget.connection?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        name: _nameController.text.trim(),
        type: _selectedType,
        config: config,
        createdAt: widget.connection?.createdAt ?? DateTime.now(),
        updatedAt: DateTime.now(),
      );

      if (widget.connection == null) {
        await provider.addConnection(connection);
      } else {
        await provider.updateConnection(connection);
      }

      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
  }

  DatabaseConnectionConfig _buildConnectionConfig() {
    return DatabaseConnectionConfig(
      host: _selectedType == DatabaseType.sqlite ? null : _hostController.text.trim(),
      port: _selectedType == DatabaseType.sqlite ? null : int.tryParse(_portController.text.trim()),
      database: _databaseController.text.trim(),
      username: _selectedType == DatabaseType.sqlite ? null : _usernameController.text.trim(),
      password: _selectedType == DatabaseType.sqlite ? null : _passwordController.text,
      ssl: _selectedType == DatabaseType.sqlite ? false : _sslEnabled,
      filePath: _selectedType == DatabaseType.sqlite ? _filePathController.text.trim() : null,
    );
  }
}