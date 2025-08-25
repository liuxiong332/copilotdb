import 'package:flutter/material.dart';

import '../../widgets/title_bar/custom_title_bar.dart';
import '../../widgets/explorer/database_explorer.dart';
import '../../services/ai_service.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  Future<void> _handleAiQueryGeneration(BuildContext context) async {
    final success = await AiService.requireAuthentication(context);
    if (success && context.mounted) {
      // Show AI query generation interface
      _showAiQueryDialog(context);
    }
  }

  Future<void> _handleAiAssistance(BuildContext context) async {
    final success = await AiService.requireAuthentication(context);
    if (success && context.mounted) {
      // Show AI assistance interface
      _showAiAssistantDialog(context);
    }
  }

  void _showAiQueryDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.auto_awesome),
            SizedBox(width: 8),
            Text('AI Query Generator'),
          ],
        ),
        content: const Text(
          'AI query generation feature will be implemented in future updates. '
          'This demonstrates the authentication flow for AI features.',
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

  void _showAiAssistantDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.help_outline),
            SizedBox(width: 8),
            Text('AI Assistant'),
          ],
        ),
        content: const Text(
          'AI assistant feature will be implemented in future updates. '
          'This demonstrates the authentication flow for AI features.',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Custom Title Bar
          const CustomTitleBar(),
          // Main content area
          Expanded(
            child: Row(
              children: [
                // Database Explorer
                SizedBox(
                  width: 300,
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border(
                        right: BorderSide(
                          color: Theme.of(context).dividerColor,
                          width: 1,
                        ),
                      ),
                    ),
                    child: const DatabaseExplorer(),
                  ),
                ),
                // Query and Results area
                Expanded(
                  child: Container(
                    color: Theme.of(context).colorScheme.surface,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.code,
                            size: 64,
                            color: Colors.grey,
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Query Editor',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Connect to a database and start querying',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 32),
                          
                          // AI Features Section
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: Theme.of(context).dividerColor,
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.auto_awesome,
                                      color: Theme.of(context).colorScheme.primary,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'AI-Powered Features',
                                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Generate queries using natural language and get AI assistance',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: Colors.grey),
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  onPressed: () => _handleAiQueryGeneration(context),
                                  icon: const Icon(Icons.auto_awesome),
                                  label: const Text('Generate Query with AI'),
                                ),
                                const SizedBox(height: 8),
                                OutlinedButton.icon(
                                  onPressed: () => _handleAiAssistance(context),
                                  icon: const Icon(Icons.help_outline),
                                  label: const Text('Ask AI Assistant'),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }


}