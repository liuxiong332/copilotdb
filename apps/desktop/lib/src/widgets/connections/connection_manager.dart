import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/database_connection.dart';
import '../../providers/database_provider.dart';
import 'connection_form_dialog.dart';
import 'connection_list_item.dart';

class ConnectionManager extends StatefulWidget {
  const ConnectionManager({super.key});

  @override
  State<ConnectionManager> createState() => _ConnectionManagerState();
}

class _ConnectionManagerState extends State<ConnectionManager> {
  @override
  void initState() {
    super.initState();
    // Initialize the database provider if not already done
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<DatabaseProvider>();
      if (!provider.isInitialized) {
        provider.initialize();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<DatabaseProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && !provider.isInitialized) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Loading connections...'),
              ],
            ),
          );
        }

        return Column(
          children: [
            _buildHeader(context, provider),
            if (provider.errorMessage != null) _buildErrorBanner(provider),
            Expanded(child: _buildConnectionsList(context, provider)),
          ],
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context, DatabaseProvider provider) {
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
            Icons.storage,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(width: 8),
          const Text(
            'Database Connections',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: provider.isLoading ? null : () => _showAddConnectionDialog(context),
            icon: const Icon(Icons.add),
            tooltip: 'Add Connection',
          ),
          IconButton(
            onPressed: provider.isLoading ? null : () => provider.refreshConnections(),
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
          ),
          if (provider.connections.isNotEmpty)
            PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'clear_all') {
                  _showClearAllDialog(context, provider);
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'clear_all',
                  child: Row(
                    children: [
                      Icon(Icons.clear_all, color: Colors.red),
                      SizedBox(width: 8),
                      Text('Clear All'),
                    ],
                  ),
                ),
              ],
              child: const Icon(Icons.more_vert),
            ),
        ],
      ),
    );
  }

  Widget _buildErrorBanner(DatabaseProvider provider) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      color: Theme.of(context).colorScheme.errorContainer,
      child: Row(
        children: [
          Icon(
            Icons.error_outline,
            color: Theme.of(context).colorScheme.onErrorContainer,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              provider.errorMessage!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onErrorContainer,
              ),
            ),
          ),
          IconButton(
            onPressed: () {
              // Clear error by refreshing connections
              provider.refreshConnections();
            },
            icon: Icon(
              Icons.close,
              color: Theme.of(context).colorScheme.onErrorContainer,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConnectionsList(BuildContext context, DatabaseProvider provider) {
    if (provider.connections.isEmpty) {
      return _buildEmptyState(context);
    }

    return ListView.builder(
      itemCount: provider.connections.length,
      itemBuilder: (context, index) {
        final connection = provider.connections[index];
        return ConnectionListItem(
          connection: connection,
          isActive: provider.activeConnection?.id == connection.id,
          onTap: () => provider.setActiveConnection(connection.id),
          onEdit: () => _showEditConnectionDialog(context, connection),
          onDelete: () => _showDeleteConnectionDialog(context, provider, connection),
          onTest: () => _testConnection(context, provider, connection),
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.storage_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No Database Connections',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add your first database connection to get started',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => _showAddConnectionDialog(context),
            icon: const Icon(Icons.add),
            label: const Text('Add Connection'),
          ),
        ],
      ),
    );
  }

  void _showAddConnectionDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const ConnectionFormDialog(),
    );
  }

  void _showEditConnectionDialog(BuildContext context, DatabaseConnection connection) {
    showDialog(
      context: context,
      builder: (context) => ConnectionFormDialog(connection: connection),
    );
  }

  void _showDeleteConnectionDialog(BuildContext context, DatabaseProvider provider, DatabaseConnection connection) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Connection'),
        content: Text('Are you sure you want to delete "${connection.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              provider.removeConnection(connection.id);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
              foregroundColor: Theme.of(context).colorScheme.onError,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showClearAllDialog(BuildContext context, DatabaseProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear All Connections'),
        content: const Text('Are you sure you want to delete all connections? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              provider.clearAllConnections();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
              foregroundColor: Theme.of(context).colorScheme.onError,
            ),
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }

  void _testConnection(BuildContext context, DatabaseProvider provider, DatabaseConnection connection) async {
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Testing connection...'),
          ],
        ),
      ),
    );

    try {
      final result = await provider.testConnection(connection);
      
      if (context.mounted) {
        Navigator.of(context).pop(); // Close loading dialog
        
        // Show result dialog
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
                if (result.details != null) ...[
                  const SizedBox(height: 8),
                  const Text('Details:', style: TextStyle(fontWeight: FontWeight.bold)),
                  ...result.details!.entries.map((entry) => 
                    Text('${entry.key}: ${entry.value}', style: const TextStyle(fontSize: 12)),
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
      if (context.mounted) {
        Navigator.of(context).pop(); // Close loading dialog
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to test connection: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }
}