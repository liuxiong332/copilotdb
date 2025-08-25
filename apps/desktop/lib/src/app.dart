import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'screens/main/main_screen.dart';
import 'theme/app_theme.dart';

class DatabaseGuiApp extends StatelessWidget {
  const DatabaseGuiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Database GUI Client',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (authProvider.isLoading) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }

          // Always show the main screen, regardless of authentication status
          return const MainScreen();
        },
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}