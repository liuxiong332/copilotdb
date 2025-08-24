import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/database_connection.dart';
import '../../providers/database_provider.dart';
import '../connections/connection_form_dialog.dart';
import 'database_search_dialog.dart';

class DatabaseInstanceSelector extends StatelessWidget {
  const DatabaseInstanceSelector({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<DatabaseProvider>(
      builder: (context, provider, child) {
        final activeConnection = provider.activeConnection;
        
        return Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
              // Database Instance Dropdown
              Expanded(
                child: _buildInstanceSelector(context, provider, activeConnection),
              ),
              const SizedBox(width: 8),
              // Search Button
              IconButton(
                onPressed: activeConnection?.status == ConnectionStatus.connected
                    ? () => _showSearchDialog(context)
                    : null,
                icon: const Icon(Icons.search),
                tooltip: 'Search databases and tables',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInstanceSelector(
    BuildContext context,
    DatabaseProvider provider,
    DatabaseConnection? activeConnection,
  ) {
    return InkWell(
      onTap: () => _showInstanceSelector(context, provider),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              _getConnectionIcon(activeConnection?.type),
              size: 20,
              color: activeConnection?.status == ConnectionStatus.connected
                  ? Colors.green
                  : activeConnection?.status == ConnectionStatus.connecting
                      ? Colors.orange
                      : Colors.grey,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    activeConnection?.name ?? 'No connection selected',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                  if (activeConnection != null)
                    Text(
                      _getConnectionStatusText(activeConnection.status),
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                ],
              ),
            ),
            const Icon(Icons.arrow_drop_down),
          ],
        ),
      ),
    );
  }

  IconData _getConnectionIcon(DatabaseType? type) {
    switch (type) {
      case DatabaseType.mysql:
        return Icons.storage;
      case DatabaseType.postgresql:
        return Icons.account_tree;
      case DatabaseType.mongodb:
        return Icons.view_module;
      case DatabaseType.sqlite:
        return Icons.folder;
      case null:
        return Icons.storage_outlined;
    }
  }

  String _getConnectionStatusText(ConnectionStatus status) {
    switch (status) {
      case ConnectionStatus.connected:
        return 'Connected';
      case ConnectionStatus.connecting:
        return 'Connecting...';
      case ConnectionStatus.disconnected:
        return 'Disconnected';
      case ConnectionStatus.error:
        return 'Connection Error';
      case ConnectionStatus.testing:
        return 'Testing...';
    }
  }

  void _showInstanceSelector(BuildContext context, DatabaseProvider provider) {
    showDialog(
      context: context,
      builder: (context) => _DatabaseInstanceDialog(provider: provider),
    );
  }

  void _showSearchDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const DatabaseSearchDialog(),
    );
  }
}

class _DatabaseInstanceDialog extends StatelessWidget {
  final DatabaseProvider provider;

  const _DatabaseInstanceDialog({required this.provider});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: 400,
        constraints: const BoxConstraints(maxHeight: 500),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
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
                  const Icon(Icons.storage),
                  const SizedBox(width: 8),
                  const Text(
                    'Select Database Instance',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),
            // Connection List
            Flexible(
              child: provider.connections.isEmpty
                  ? _buildEmptyState(context)
                  : ListView.builder(
                      shrinkWrap: true,
                      itemCount: provider.connections.length,
                      itemBuilder: (context, index) {
                        final connection = provider.connections[index];
                        final isActive = provider.activeConnection?.id == connection.id;
                        
                        return ListTile(
                          leading: Icon(
                            _getConnectionIcon(connection.type),
                            color: connection.status == ConnectionStatus.connected
                                ? Colors.green
                                : connection.status == ConnectionStatus.connecting
                                    ? Colors.orange
                                    : Colors.grey,
                          ),
                          title: Text(
                            connection.name,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(
                            '${connection.type.name.toUpperCase()} • ${_getConnectionStatusText(connection.status)}',
                            overflow: TextOverflow.ellipsis,
                          ),
                          trailing: isActive
                              ? Icon(
                                  Icons.check_circle,
                                  color: Theme.of(context).colorScheme.primary,
                                )
                              : null,
                          selected: isActive,
                          onTap: () {
                            provider.setActiveConnection(connection.id);
                            Navigator.of(context).pop();
                          },
                        );
                      },
                    ),
            ),
            // Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: Theme.of(context).dividerColor,
                    width: 1,
                  ),
                ),
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                    _showAddConnectionDialog(context);
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Add Connection'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.storage_outlined,
            size: 48,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No Database Connections',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add your first database connection to get started',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  IconData _getConnectionIcon(DatabaseType? type) {
    switch (type) {
      case DatabaseType.mysql:
        return Icons.storage;
      case DatabaseType.postgresql:
        return Icons.account_tree;
      case DatabaseType.mongodb:
        return Icons.view_module;
      case DatabaseType.sqlite:
        return Icons.folder;
      case null:
        return Icons.storage_outlined;
    }
  }

  String _getConnectionStatusText(ConnectionStatus status) {
    switch (status) {
      case ConnectionStatus.connected:
        return 'Connected';
      case ConnectionStatus.connecting:
        return 'Connecting...';
      case ConnectionStatus.disconnected:
        return 'Disconnected';
      case ConnectionStatus.error:
        return 'Connection Error';
      case ConnectionStatus.testing:
        return 'Testing...';
    }
  }

  void _showAddConnectionDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const ConnectionFormDialog(),
    );
  }
}