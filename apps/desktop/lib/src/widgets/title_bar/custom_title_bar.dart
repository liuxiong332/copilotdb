import 'dart:io';
import 'package:flutter/cupertino.dart';
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
    final isMacOS = Platform.isMacOS;

    return Container(
      height: 48,
      decoration: const BoxDecoration(
        color: CupertinoColors.systemBackground,
        border: Border(
          bottom: BorderSide(color: CupertinoColors.separator, width: 1),
        ),
      ),
      child: Row(
        children: isMacOS
            ? _buildMacOSLayout(context)
            : _buildWindowsLayout(context),
      ),
    );
  }

  List<Widget> _buildMacOSLayout(BuildContext context) {
    return [
      // Window Controls (left side on macOS)
      _buildMacOSWindowControls(context),

      // Menu and App Title
      _buildMenuSection(context),

      // Database Connection Selector
      Expanded(flex: 2, child: _buildConnectionSection(context)),

      // Search Button
      _buildSearchButton(context),

      // User Information
      _buildUserSection(context),
    ];
  }

  List<Widget> _buildWindowsLayout(BuildContext context) {
    return [
      // Menu and App Title
      _buildMenuSection(context),

      // Database Connection Selector
      Expanded(flex: 2, child: _buildConnectionSection(context)),

      // Search Button
      _buildSearchButton(context),

      // User Information
      _buildUserSection(context),

      // Window Controls (right side on Windows)
      _buildWindowsWindowControls(context),
    ];
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
            const Icon(
              CupertinoIcons.device_desktop,
              color: CupertinoColors.activeBlue,
              size: 20,
            ),
            const SizedBox(width: 8),
            // App Title
            const Text(
              'Database GUI Client',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: CupertinoColors.label,
              ),
            ),
            const SizedBox(width: 16),
            // Menu Button
            CupertinoButton(
              padding: const EdgeInsets.all(8),
              minSize: 0,
              onPressed: () => _showMenuOptions(context),
              child: const Icon(CupertinoIcons.ellipsis, size: 18),
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
            child: GestureDetector(
              onTap: () => _showConnectionSelector(context, provider),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: CupertinoColors.separator,
                  ),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _getConnectionIcon(activeConnection?.type),
                      size: 16,
                      color: _getConnectionStatusColor(
                        activeConnection?.status,
                      ),
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
                    const Icon(
                      CupertinoIcons.chevron_down,
                      size: 16,
                      color: CupertinoColors.systemGrey,
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
        final isConnected =
            provider.activeConnection?.status == ConnectionStatus.connected;

        return CupertinoButton(
          padding: const EdgeInsets.all(8),
          minSize: 0,
          onPressed: isConnected ? () => _showSearchDialog(context) : null,
          child: Icon(
            CupertinoIcons.search,
            size: 18,
            color: isConnected ? CupertinoColors.activeBlue : CupertinoColors.systemGrey3,
          ),
        );
      },
    );
  }

  Widget _buildUserSection(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.isAuthenticated) {
          // Show authenticated user menu
          return CupertinoButton(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            minSize: 0,
            onPressed: () => _showUserMenu(context, authProvider),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: const BoxDecoration(
                    color: CupertinoColors.activeBlue,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      authProvider.user?.email?.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: CupertinoColors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  CupertinoIcons.chevron_down,
                  size: 16,
                  color: CupertinoColors.systemGrey,
                ),
              ],
            ),
          );
        } else {
          // Show login button for unauthenticated users
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 8),
            child: CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              minSize: 0,
              onPressed: () => _handleLogin(context),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(CupertinoIcons.person, size: 16),
                  SizedBox(width: 4),
                  Text('Login'),
                ],
              ),
            ),
          );
        }
      },
    );
  }

  Widget _buildMacOSWindowControls(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 12, right: 8),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Close Button (red, leftmost on macOS)
          _MacOSWindowControlButton(
            color: Colors.red,
            icon: Icons.close,
            onPressed: () => windowManager.close(),
            tooltip: 'Close',
          ),
          const SizedBox(width: 8),
          // Minimize Button (yellow, middle on macOS)
          _MacOSWindowControlButton(
            color: Colors.orange,
            icon: Icons.minimize,
            onPressed: () => windowManager.minimize(),
            tooltip: 'Minimize',
          ),
          const SizedBox(width: 8),
          // Maximize/Restore Button (green, rightmost on macOS)
          FutureBuilder<bool>(
            future: windowManager.isMaximized(),
            builder: (context, snapshot) {
              final isMaximized = snapshot.data ?? false;
              return _MacOSWindowControlButton(
                color: Colors.green,
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
        ],
      ),
    );
  }

  Widget _buildWindowsWindowControls(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Minimize Button
        _WindowsWindowControlButton(
          icon: Icons.minimize,
          onPressed: () => windowManager.minimize(),
          tooltip: 'Minimize',
        ),
        // Maximize/Restore Button
        FutureBuilder<bool>(
          future: windowManager.isMaximized(),
          builder: (context, snapshot) {
            final isMaximized = snapshot.data ?? false;
            return _WindowsWindowControlButton(
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
        // Close Button (rightmost on Windows)
        _WindowsWindowControlButton(
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

  void _showMenuOptions(BuildContext context) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('Menu'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _handleMenuAction(context, 'file');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.folder),
                SizedBox(width: 8),
                Text('File'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _handleMenuAction(context, 'edit');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.pencil),
                SizedBox(width: 8),
                Text('Edit'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _handleMenuAction(context, 'view');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.eye),
                SizedBox(width: 8),
                Text('View'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _handleMenuAction(context, 'tools');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.wrench),
                SizedBox(width: 8),
                Text('Tools'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _handleMenuAction(context, 'help');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.question_circle),
                SizedBox(width: 8),
                Text('Help'),
              ],
            ),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ),
    );
  }

  void _handleMenuAction(BuildContext context, String action) {
    // TODO: Implement menu actions
    // For now, just show a simple message
  }

  void _showUserMenu(BuildContext context, AuthProvider authProvider) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: Text(authProvider.user?.email ?? 'User'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _handleUserAction(context, authProvider, 'profile');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.person),
                SizedBox(width: 8),
                Text('Profile'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _handleUserAction(context, authProvider, 'settings');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.settings),
                SizedBox(width: 8),
                Text('Settings'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _handleUserAction(context, authProvider, 'logout');
            },
            isDestructiveAction: true,
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.square_arrow_right),
                SizedBox(width: 8),
                Text('Sign Out'),
              ],
            ),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ),
    );
  }

  void _handleUserAction(
    BuildContext context,
    AuthProvider authProvider,
    String action,
  ) {
    switch (action) {
      case 'profile':
        Navigator.of(context).push(
          CupertinoPageRoute(builder: (context) => const ProfileScreen()),
        );
        break;
      case 'settings':
        // TODO: Implement settings
        break;
      case 'logout':
        _showSignOutDialog(context, authProvider);
        break;
    }
  }

  void _handleLogin(BuildContext context) {
    AiService.requireAuthentication(context);
  }

  void _showConnectionSelector(
    BuildContext context,
    DatabaseProvider provider,
  ) {
    showCupertinoDialog(
      context: context,
      builder: (context) => _DatabaseInstanceDialog(provider: provider),
    );
  }

  void _showSearchDialog(BuildContext context) {
    showCupertinoDialog(
      context: context,
      builder: (context) => const DatabaseSearchDialog(),
    );
  }

  void _showSignOutDialog(BuildContext context, AuthProvider authProvider) {
    showCupertinoDialog(
      context: context,
      builder: (BuildContext context) {
        return CupertinoAlertDialog(
          title: const Text('Sign Out'),
          content: const Text('Are you sure you want to sign out?'),
          actions: [
            CupertinoDialogAction(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            CupertinoDialogAction(
              onPressed: () {
                Navigator.of(context).pop();
                authProvider.signOut();
              },
              isDestructiveAction: true,
              child: const Text('Sign Out'),
            ),
          ],
        );
      },
    );
  }
}

// macOS-style window control buttons (circular with colors)
class _MacOSWindowControlButton extends StatefulWidget {
  final Color color;
  final IconData icon;
  final VoidCallback onPressed;
  final String tooltip;

  const _MacOSWindowControlButton({
    required this.color,
    required this.icon,
    required this.onPressed,
    required this.tooltip,
  });

  @override
  State<_MacOSWindowControlButton> createState() =>
      _MacOSWindowControlButtonState();
}

class _MacOSWindowControlButtonState extends State<_MacOSWindowControlButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onPressed,
        child: Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: widget.color,
            shape: BoxShape.circle,
            border: Border.all(
              color: widget.color.withValues(alpha: 0.3),
              width: 0.5,
            ),
          ),
          child: _isHovered
              ? Icon(widget.icon, size: 8, color: Colors.black54)
              : null,
        ),
      ),
    );
  }
}

// Windows-style window control buttons (rectangular)
class _WindowsWindowControlButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final String tooltip;
  final bool isCloseButton;

  const _WindowsWindowControlButton({
    required this.icon,
    required this.onPressed,
    required this.tooltip,
    this.isCloseButton = false,
  });

  @override
  State<_WindowsWindowControlButton> createState() =>
      _WindowsWindowControlButtonState();
}

class _WindowsWindowControlButtonState
    extends State<_WindowsWindowControlButton> {
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
                ? (widget.isCloseButton
                      ? Colors.red
                      : Theme.of(context).colorScheme.surfaceContainerHighest)
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
    return CupertinoAlertDialog(
      title: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(CupertinoIcons.device_desktop),
          SizedBox(width: 8),
          Text('Select Database Instance'),
        ],
      ),
      content: Container(
        width: 400,
        constraints: const BoxConstraints(maxHeight: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Connection List
            Flexible(
              child: provider.connections.isEmpty
                  ? _buildEmptyState(context)
                  : ListView.builder(
                      shrinkWrap: true,
                      itemCount: provider.connections.length,
                      itemBuilder: (context, index) {
                        final connection = provider.connections[index];
                        final isActive =
                            provider.activeConnection?.id == connection.id;

                        return CupertinoListTile(
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
                              ? const Icon(
                                  CupertinoIcons.check_mark_circled,
                                  color: CupertinoColors.activeBlue,
                                )
                              : null,
                          onTap: () {
                            provider.setActiveConnection(connection.id);
                            Navigator.of(context).pop();
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
      actions: [
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop();
            _showAddConnectionDialog(context);
          },
          child: const Text('Add Connection'),
        ),
        CupertinoDialogAction(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            CupertinoIcons.device_desktop,
            size: 48,
            color: CupertinoColors.systemGrey,
          ),
          SizedBox(height: 16),
          Text(
            'No Database Connections',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: CupertinoColors.systemGrey,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Add your first database connection to get started',
            style: TextStyle(
              fontSize: 14,
              color: CupertinoColors.systemGrey,
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
    showCupertinoDialog(
      context: context,
      builder: (context) => const ConnectionFormDialog(),
    );
  }
}
