import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:window_manager/window_manager.dart';

import '../../models/database_connection.dart';
import '../../providers/auth_provider.dart';
import '../../providers/database_provider.dart';
import '../../services/ai_service.dart';
import '../database_selector/database_search_dialog.dart';
import '../connections/connection_form_dialog.dart';
import '../../screens/profile/profile_screen.dart';

class CustomTitleBar extends StatelessWidget {
  const CustomTitleBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
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
          // Menu and App Title
          _buildMenuSection(context),
          
          // Database Connection Selector
          Expanded(
            flex: 2,
            child: _buildConnectionSection(context),
          ),
          
          // Search Button
          _buildSearchButton(context),
          
          // User Information
          _buildUserSection(context),
          
          // Window Controls
          _buildWindowControls(context),
        ],
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) {
        windowManager.startDragging();
      },
      onDoubleTap: () async {
        if (await windowManager.isMaximized()) {
          windowManager.unmaximize();
        } else {
          windowManager.maximize();
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // App Icon/Logo
            Icon(
              Icons.storage,
              color: Theme.of(context).colorScheme.primary,
              size: 20,
            ),
            const SizedBox(width: 8),
            // App Title
            Text(
              'Database GUI Client',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            const SizedBox(width: 16),
            // Menu Button
            PopupMenuButton<String>(
              icon: const Icon(Icons.menu, size: 18),
              tooltip: 'Menu',
              onSelected: (value) => _handleMenuAction(context, value),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'file',
                  child: Row(
                    children: [
                      Icon(Icons.folder, size: 16),
                      SizedBox(width: 8),
                      Text('File'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit, size: 16),
                      SizedBox(width: 8),
                      Text('Edit'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'view',
                  child: Row(
                    children: [
                      Icon(Icons.visibility, size: 16),
                      SizedBox(width: 8),
                      Text('View'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'tools',
                  child: Row(
                    children: [
                      Icon(Icons.build, size: 16),
                      SizedBox(width: 8),
                      Text('Tools'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'help',
                  child: Row(
                    children: [
                      Icon(Icons.help, size: 16),
                      SizedBox(width: 8),
                      Text('Help'),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectionSection(BuildContext context) {
    return Consumer<DatabaseProvider>(
      builder: (context, provider, child) {
        final activeConnection = provider.activeConnection;
        
        return GestureDetector(
          onPanStart: (details) {
            windowManager.startDragging();
          },
          onDoubleTap: () async {
            if (await windowManager.isMaximized()) {
              windowManager.unmaximize();
            } else {
              windowManager.maximize();
            }
          },
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: InkWell(
              onTap: () => _showConnectionSelector(context, provider),
              borderRadius: BorderRadius.circular(6),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.3),
                  ),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _getConnectionIcon(activeConnection?.type),
                      size: 16,
                      color: _getConnectionStatusColor(activeConnection?.status),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        activeConnection?.name ?? 'No connection',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.arrow_drop_down,
                      size: 16,
                      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSearchButton(BuildContext context) {
    return Consumer<DatabaseProvider>(
      builder: (context, provider, child) {
        final isConnected = provider.activeConnection?.status == ConnectionStatus.connected;
        
        return IconButton(
          onPressed: isConnected ? () => _showSearchDialog(context) : null,
          icon: const Icon(Icons.search, size: 18),
          tooltip: 'Search databases and tables',
          iconSize: 18,
        );
      },
    );
  }

  Widget _buildUserSection(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.isAuthenticated) {
          // Show authenticated user menu
          return PopupMenuButton<String>(
            onSelected: (value) => _handleUserAction(context, authProvider, value),
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    const Icon(Icons.person, size: 16),
                    const SizedBox(width: 8),
                    Text(authProvider.user?.email ?? 'User'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'settings',
                child: Row(
                  children: [
                    Icon(Icons.settings, size: 16),
                    SizedBox(width: 8),
                    Text('Settings'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, size: 16),
                    SizedBox(width: 8),
                    Text('Sign Out'),
                  ],
                ),
              ),
            ],
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircleAvatar(
                    radius: 12,
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    child: Text(
                      authProvider.user?.email?.substring(0, 1).toUpperCase() ?? 'U',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_drop_down,
                    size: 16,
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ],
              ),
            ),
          );
        } else {
          // Show login button for unauthenticated users
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 8),
            child: OutlinedButton.icon(
              onPressed: () => _handleLogin(context),
              icon: const Icon(Icons.person_outline, size: 16),
              label: const Text('Login'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          );
        }
      },
    );
  }

  Widget _buildWindowControls(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Minimize Button
        _WindowControlButton(
          icon: Icons.minimize,
          onPressed: () => windowManager.minimize(),
          tooltip: 'Minimize',
        ),
        // Maximize/Restore Button
        FutureBuilder<bool>(
          future: windowManager.isMaximized(),
          builder: (context, snapshot) {
            final isMaximized = snapshot.data ?? false;
            return _WindowControlButton(
              icon: isMaximized ? Icons.fullscreen_exit : Icons.fullscreen,
              onPressed: () async {
                if (isMaximized) {
                  await windowManager.unmaximize();
                } else {
                  await windowManager.maximize();
                }
              },
              tooltip: isMaximized ? 'Restore' : 'Maximize',
            );
          },
        ),
        // Close Button
        _WindowControlButton(
          icon: Icons.close,
          onPressed: () => windowManager.close(),
          tooltip: 'Close',
          isCloseButton: true,
        ),
      ],
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

  Color _getConnectionStatusColor(ConnectionStatus? status) {
    switch (status) {
      case ConnectionStatus.connected:
        return Colors.green;
      case ConnectionStatus.connecting:
      case ConnectionStatus.testing:
        return Colors.orange;
      case ConnectionStatus.error:
        return Colors.red;
      case ConnectionStatus.disconnected:
      case null:
        return Colors.grey;
    }
  }

  void _handleMenuAction(BuildContext context, String action) {
    // TODO: Implement menu actions
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$action menu clicked')),
    );
  }

  void _handleUserAction(BuildContext context, AuthProvider authProvider, String action) {
    switch (action) {
      case 'profile':
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => const ProfileScreen(),
          ),
        );
        break;
      case 'settings':
        // TODO: Implement settings
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Settings coming soon')),
        );
        break;
      case 'logout':
        _showSignOutDialog(context, authProvider);
        break;
    }
  }

  void _handleLogin(BuildContext context) {
    AiService.requireAuthentication(context);
  }

  void _showConnectionSelector(BuildContext context, DatabaseProvider provider) {
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

  void _showSignOutDialog(BuildContext context, AuthProvider authProvider) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Sign Out'),
          content: const Text('Are you sure you want to sign out?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                authProvider.signOut();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('Sign Out'),
            ),
          ],
        );
      },
    );
  }
}

class _WindowControlButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final String tooltip;
  final bool isCloseButton;

  const _WindowControlButton({
    required this.icon,
    required this.onPressed,
    required this.tooltip,
    this.isCloseButton = false,
  });

  @override
  State<_WindowControlButton> createState() => _WindowControlButtonState();
}

class _WindowControlButtonState extends State<_WindowControlButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onPressed,
        child: Container(
          width: 46,
          height: 32,
          decoration: BoxDecoration(
            color: _isHovered
                ? (widget.isCloseButton ? Colors.red : Theme.of(context).colorScheme.surfaceContainerHighest)
                : Colors.transparent,
          ),
          child: Icon(
            widget.icon,
            size: 16,
            color: _isHovered && widget.isCloseButton
                ? Colors.white
                : Theme.of(context).colorScheme.onSurface,
          ),
        ),
      ),
    );
  }
}

// Reuse the dialog from database_instance_selector.dart
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
                            color: _getConnectionStatusColor(connection.status),
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

  Color _getConnectionStatusColor(ConnectionStatus? status) {
    switch (status) {
      case ConnectionStatus.connected:
        return Colors.green;
      case ConnectionStatus.connecting:
      case ConnectionStatus.testing:
        return Colors.orange;
      case ConnectionStatus.error:
        return Colors.red;
      case ConnectionStatus.disconnected:
      case null:
        return Colors.grey;
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