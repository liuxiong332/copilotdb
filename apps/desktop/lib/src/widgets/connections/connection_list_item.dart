import 'package:flutter/material.dart';
import '../../models/database_connection.dart';

class ConnectionListItem extends StatelessWidget {
  final DatabaseConnection connection;
  final bool isActive;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;
  final VoidCallback? onTest;

  const ConnectionListItem({
    super.key,
    required this.connection,
    this.isActive = false,
    this.onTap,
    this.onEdit,
    this.onDelete,
    this.onTest,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      elevation: isActive ? 4 : 1,
      color: isActive 
          ? Theme.of(context).colorScheme.primaryContainer
          : null,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              _buildDatabaseIcon(context),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            connection.name,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                              color: isActive 
                                  ? Theme.of(context).colorScheme.onPrimaryContainer
                                  : null,
                            ),
                          ),
                        ),
                        _buildStatusIndicator(context),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _getConnectionDescription(),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: isActive 
                            ? Theme.of(context).colorScheme.onPrimaryContainer.withOpacity(0.7)
                            : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                    if (connection.lastConnected != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        'Last connected: ${_formatDateTime(connection.lastConnected!)}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: isActive 
                              ? Theme.of(context).colorScheme.onPrimaryContainer.withOpacity(0.5)
                              : Theme.of(context).colorScheme.onSurface.withOpacity(0.4),
                          fontSize: 11,
                        ),
                      ),
                    ],
                    if (connection.errorMessage != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 12,
                            color: Theme.of(context).colorScheme.error,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              connection.errorMessage!,
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.error,
                                fontSize: 11,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _buildActionButtons(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDatabaseIcon(BuildContext context) {
    IconData iconData;
    Color? iconColor;

    switch (connection.type) {
      case DatabaseType.mongodb:
        iconData = Icons.account_tree;
        iconColor = const Color(0xFF4DB33D);
        break;
      case DatabaseType.mysql:
        iconData = Icons.storage;
        iconColor = const Color(0xFF00758F);
        break;
      case DatabaseType.postgresql:
        iconData = Icons.storage;
        iconColor = const Color(0xFF336791);
        break;
      case DatabaseType.sqlite:
        iconData = Icons.folder;
        iconColor = const Color(0xFF003B57);
        break;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: iconColor?.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(
        iconData,
        color: iconColor,
        size: 24,
      ),
    );
  }

  Widget _buildStatusIndicator(BuildContext context) {
    Color statusColor;
    IconData statusIcon;
    String statusText;

    switch (connection.status) {
      case ConnectionStatus.connected:
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        statusText = 'Connected';
        break;
      case ConnectionStatus.connecting:
        statusColor = Colors.orange;
        statusIcon = Icons.sync;
        statusText = 'Connecting';
        break;
      case ConnectionStatus.testing:
        statusColor = Colors.blue;
        statusIcon = Icons.sync;
        statusText = 'Testing';
        break;
      case ConnectionStatus.error:
        statusColor = Colors.red;
        statusIcon = Icons.error;
        statusText = 'Error';
        break;
      case ConnectionStatus.disconnected:
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.radio_button_unchecked;
        statusText = 'Disconnected';
        break;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          statusIcon,
          size: 12,
          color: statusColor,
        ),
        const SizedBox(width: 4),
        Text(
          statusText,
          style: TextStyle(
            fontSize: 11,
            color: statusColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          onPressed: onTest,
          icon: const Icon(Icons.wifi_protected_setup),
          tooltip: 'Test Connection',
          iconSize: 18,
        ),
        IconButton(
          onPressed: onEdit,
          icon: const Icon(Icons.edit),
          tooltip: 'Edit Connection',
          iconSize: 18,
        ),
        IconButton(
          onPressed: onDelete,
          icon: const Icon(Icons.delete),
          tooltip: 'Delete Connection',
          iconSize: 18,
          color: Theme.of(context).colorScheme.error,
        ),
      ],
    );
  }

  String _getConnectionDescription() {
    switch (connection.type) {
      case DatabaseType.sqlite:
        return '${connection.type.displayName} • ${connection.config.filePath ?? connection.config.database}';
      default:
        final host = connection.config.host ?? 'localhost';
        final port = connection.config.port ?? 0;
        return '${connection.type.displayName} • $host:$port/${connection.config.database}';
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}