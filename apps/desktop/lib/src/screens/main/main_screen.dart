import 'package:flutter/cupertino.dart';
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
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(CupertinoIcons.sparkles),
            SizedBox(width: 8),
            Text('AI Query Generator'),
          ],
        ),
        content: const Text(
          'AI query generation feature will be implemented in future updates. '
          'This demonstrates the authentication flow for AI features.',
        ),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showAiAssistantDialog(BuildContext context) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(CupertinoIcons.question_circle),
            SizedBox(width: 8),
            Text('AI Assistant'),
          ],
        ),
        content: const Text(
          'AI assistant feature will be implemented in future updates. '
          'This demonstrates the authentication flow for AI features.',
        ),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      child: Column(
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
                    decoration: const BoxDecoration(
                      border: Border(
                        right: BorderSide(
                          color: CupertinoColors.separator,
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
                    color: CupertinoColors.systemBackground,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            CupertinoIcons.doc_text,
                            size: 64,
                            color: CupertinoColors.systemGrey,
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Query Editor',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: CupertinoColors.label,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Connect to a database and start querying',
                            style: TextStyle(
                              fontSize: 16,
                              color: CupertinoColors.systemGrey,
                            ),
                          ),
                          const SizedBox(height: 32),
                          
                          // AI Features Section
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: CupertinoColors.separator,
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      CupertinoIcons.sparkles,
                                      color: CupertinoColors.activeBlue,
                                    ),
                                    SizedBox(width: 8),
                                    Text(
                                      'AI-Powered Features',
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: CupertinoColors.label,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Generate queries using natural language and get AI assistance',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: CupertinoColors.systemGrey),
                                ),
                                const SizedBox(height: 16),
                                CupertinoButton.filled(
                                  onPressed: () => _handleAiQueryGeneration(context),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(CupertinoIcons.sparkles),
                                      SizedBox(width: 8),
                                      Text('Generate Query with AI'),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 8),
                                CupertinoButton(
                                  onPressed: () => _handleAiAssistance(context),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(CupertinoIcons.question_circle),
                                      SizedBox(width: 8),
                                      Text('Ask AI Assistant'),
                                    ],
                                  ),
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