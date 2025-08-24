import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/database_connection.dart';
import '../../models/database_schema.dart' as schema;
import '../../providers/database_provider.dart';
import '../../services/database_schema_service.dart';
import 'database_tree_node.dart';

class DatabaseExplorer extends StatefulWidget {
  const DatabaseExplorer({super.key});

  @override
  State<DatabaseExplorer> createState() => _DatabaseExplorerState();
}

class _DatabaseExplorerState extends State<DatabaseExplorer> {
  final DatabaseSchemaService _schemaService = DatabaseSchemaService();
  schema.DatabaseSchema? _currentSchema;
  bool _isLoading = false;
  String? _errorMessage;
  String? _selectedTable;
  String? _selectedDatabase;

  @override
  Widget build(BuildContext context) {
    return Consumer<DatabaseProvider>(
      builder: (context, provider, child) {
        final activeConnection = provider.activeConnection;
        
        if (activeConnection == null) {
          return _buildNoConnectionState();
        }

        if (activeConnection.status != ConnectionStatus.connected) {
          return _buildNotConnectedState(activeConnection);
        }

        return Column(
          children: [
            _buildHeader(activeConnection),
            Expanded(
              child: _buildExplorerContent(activeConnection),
            ),
          ],
        );
      },
    );
  }

  Widget _buildNoConnectionState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.account_tree_outlined,
            size: 64,
            color: Colors.grey,
          ),
          SizedBox(height: 16),
          Text(
            'No Active Connection',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Select and connect to a database to explore its structure',
            style: TextStyle(
              color: Colors.grey,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildNotConnectedState(DatabaseConnection connection) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.cloud_off,
            size: 64,
            color: Colors.orange.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            'Connection Not Active',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.orange.shade700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'The connection "${connection.name}" is not active',
            style: const TextStyle(
              color: Colors.grey,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _testConnection(connection),
            icon: const Icon(Icons.refresh),
            label: const Text('Test Connection'),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(DatabaseConnection connection) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.account_tree,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Database Explorer',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  connection.name,
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: _isLoading ? null : () => _refreshSchema(connection),
            icon: _isLoading 
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
            tooltip: 'Refresh Schema',
          ),
        ],
      ),
    );
  }

  Widget _buildExplorerContent(DatabaseConnection connection) {
    if (_isLoading && _currentSchema == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading database schema...'),
          ],
        ),
      );
    }

    if (_errorMessage != null) {
      return _buildErrorState();
    }

    if (_currentSchema == null) {
      // Load schema when connection becomes active
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadSchema(connection);
      });
      return const Center(child: CircularProgressIndicator());
    }

    return _buildSchemaTree();
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Failed to Load Schema',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.error,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              _errorMessage!,
              style: const TextStyle(color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              final provider = context.read<DatabaseProvider>();
              if (provider.activeConnection != null) {
                _loadSchema(provider.activeConnection!);
              }
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildSchemaTree() {
    if (_currentSchema!.databases.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.folder_open,
              size: 64,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'No Databases Found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'The connected database appears to be empty',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: _currentSchema!.databases.length,
      itemBuilder: (context, index) {
        final database = _currentSchema!.databases[index];
        return DatabaseTreeNode(
          database: database,
          selectedTable: _selectedTable,
          selectedDatabase: _selectedDatabase,
          onTableSelected: _onTableSelected,
          onDatabaseSelected: _onDatabaseSelected,
        );
      },
    );
  }

  void _loadSchema(DatabaseConnection connection) async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final schema = await _schemaService.getSchema(connection);
      if (mounted) {
        setState(() {
          _currentSchema = schema;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _refreshSchema(DatabaseConnection connection) async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final schema = await _schemaService.refreshSchema(connection);
      if (mounted) {
        setState(() {
          _currentSchema = schema;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _testConnection(DatabaseConnection connection) async {
    final provider = context.read<DatabaseProvider>();
    await provider.testConnection(connection);
  }

  void _onTableSelected(String databaseName, String tableName) {
    setState(() {
      _selectedDatabase = databaseName;
      _selectedTable = tableName;
    });
    
    // TODO: In future tasks, this will trigger query editor updates
    // or show table details in another panel
  }

  void _onDatabaseSelected(String databaseName) {
    setState(() {
      _selectedDatabase = databaseName;
      _selectedTable = null;
    });
  }

  @override
  void dispose() {
    _schemaService.clearCache();
    super.dispose();
  }
}