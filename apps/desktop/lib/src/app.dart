import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'screens/main/main_screen.dart';
import 'theme/app_theme.dart';

class DatabaseGuiApp extends StatelessWidget {
  const DatabaseGuiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoApp(
      title: 'Database GUI Client',
      theme: AppTheme.cupertinoTheme,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', 'US'),
      ],
      home: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (authProvider.isLoading) {
            return const CupertinoPageScaffold(
              navigationBar: CupertinoNavigationBar(
                middle: Text('Database GUI Client'),
              ),
              child: Center(
                child: CupertinoActivityIndicator(),
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