# Database GUI Desktop Client

A cross-platform desktop application for database management with AI assistance, built with Flutter.

## Features

- **Multi-Database Support**: Connect to MongoDB, MySQL, PostgreSQL, and SQLite databases
- **Cross-Platform**: Runs on Windows and macOS
- **AI-Powered**: Query generation and natural language database interactions
- **Secure Authentication**: Supabase-powered user accounts and session management
- **Modern UI**: Material Design 3 with light and dark theme support

## Prerequisites

- Flutter SDK 3.35.1 or later
- Dart 3.9.0 or later
- For Windows: Developer Mode enabled (for symlink support)
- For macOS: Xcode command line tools

## Getting Started

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Run Tests

```bash
flutter test
```

### 3. Run in Development Mode

```bash
flutter run -d windows  # For Windows
flutter run -d macos    # For macOS
```

### 4. Build for Production

#### Windows
```powershell
# Run the build script
.\scripts\build.ps1

# Or build manually
flutter build windows --release
```

#### macOS
```bash
# Run the build script
./scripts/build-macos.sh

# Or build manually
flutter build macos --release
```

## Project Structure

```
lib/
├── main.dart                 # Application entry point
├── src/
│   ├── app.dart             # Main app widget
│   ├── config/              # Configuration files
│   │   └── supabase_config.dart
│   ├── models/              # Data models
│   │   ├── database_connection.dart
│   │   └── database_schema.dart
│   ├── providers/           # State management
│   │   ├── auth_provider.dart
│   │   └── database_provider.dart
│   ├── services/            # Business logic services
│   │   ├── connection_storage_service.dart
│   │   ├── database_connection_service.dart
│   │   └── database_schema_service.dart
│   ├── screens/             # UI screens
│   │   ├── auth/
│   │   ├── main/
│   │   └── profile/
│   ├── widgets/             # Reusable widgets
│   │   ├── auth/
│   │   ├── connections/
│   │   ├── database_selector/  # New database instance selector
│   │   └── explorer/
│   └── theme/               # App theming
│       └── app_theme.dart
```

## UI Architecture

The main screen now features a streamlined layout:

- **Database Instance Selector**: Located adjacent to the menu bar, allows quick switching between database connections
- **Search Functionality**: Integrated search button for finding databases, tables, and columns across the active connection
- **Database Explorer**: Tree view of the selected database structure
- **Query Editor Area**: Main workspace for query execution (coming in future updates)

### Key UI Components

- `DatabaseInstanceSelector`: Dropdown-style selector for active database connections
- `DatabaseSearchDialog`: Full-featured search dialog with database/table/column filtering
- `DatabaseExplorer`: Tree navigation for database schema exploration
- `ConnectionManager`: Connection management moved to dialog-based interface

## Configuration

### Environment Variables

Create a `.env` file in the project root with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

The application requires a Supabase project for authentication. Configure your Supabase URL and anonymous key in `lib/src/config/supabase_config.dart`.

## Development

### Running Tests

```bash
# Run all tests
flutter test

# Run specific test
flutter test test/widget_test.dart
```

### Code Generation

If you modify any generated code or add new dependencies, run:

```bash
flutter packages pub run build_runner build
```

## Building

### Windows Requirements

- Enable Developer Mode in Windows Settings
- Visual Studio 2019 or later with C++ build tools

### macOS Requirements

- Xcode 12.0 or later
- macOS 10.14 or later

## Troubleshooting

### Windows Build Issues

#### Symlink Errors
If you encounter symlink errors:
1. Enable Developer Mode: `start ms-settings:developers`
2. Restart your terminal/IDE
3. Try building again

#### Missing ATL Headers (atlstr.h)
If you encounter `atlstr.h: No such file or directory` error:

**Option 1: Install Visual Studio with C++ ATL components**
1. Install Visual Studio 2019 or later (Community edition is free)
2. During installation, select "Desktop development with C++" workload
3. In Individual components, ensure these are selected:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 10/11 SDK (latest version)
   - CMake tools for Visual Studio
   - **ATL for latest v143 build tools (x86 & x64)**

**Option 2: Use alternative secure storage**
If you can't install Visual Studio, temporarily disable secure storage:
1. Remove `flutter_secure_storage` from `pubspec.yaml`
2. Update `AuthProvider` to use `SharedPreferences` instead
3. Note: This is less secure and only recommended for development

**Option 3: Build without secure storage features**
Create a development build configuration that doesn't use secure storage for credentials.

### macOS Build Issues

If you encounter signing issues:
1. Open the project in Xcode: `open macos/Runner.xcworkspace`
2. Configure signing in the project settings
3. Build from Xcode or return to Flutter CLI

### General Flutter Issues

#### Plugin Compatibility
If you encounter plugin-related build errors:
1. Run `flutter clean`
2. Run `flutter pub get`
3. Try building again

#### Flutter Version Issues
Ensure you're using Flutter 3.35.1 or later:
```bash
flutter --version
flutter upgrade  # if needed
```

## Contributing

1. Follow the existing code style and structure
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting changes

## License

This project is part of the Database GUI Client application suite.
