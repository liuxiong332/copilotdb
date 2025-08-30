# Database GUI Client - Desktop Application

A cross-platform desktop application built with Electron, React, TypeScript, Shadcn UI, and TailwindCSS for database management with AI assistance.

## Features

- **Frameless Window**: Modern UI with custom title bar
- **Multi-Database Support**: MongoDB, MySQL, PostgreSQL, SQLite (coming in future tasks)
- **AI-Powered**: Query generation and natural language database interactions (coming in future tasks)
- **Secure Authentication**: Supabase integration with offline mode
- **Cross-Platform**: Windows, macOS, and Linux support

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Supabase CLI (for local development)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
npm run dev
```

This will start both the main Electron process and the Vite development server for the renderer process.

### Scripts

- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm run dist` - Package for distribution
- `npm run test` - Run tests
- `npm run lint` - Lint code

### Architecture

The application follows Electron's main/renderer process architecture:

- **Main Process** (`src/main/`): Node.js environment, handles system APIs, window management, and secure operations
- **Renderer Process** (`src/renderer/`): Chromium environment, React application with UI components

### Key Components

- **CustomTitleBar**: Frameless window controls with menu, database switcher, search, and chat trigger
- **MainLayout**: Application layout with sidebar, editor, and results panels
- **AuthDialog**: Authentication dialog with skip functionality
- **AuthContext**: Authentication state management

### Testing

Tests are written using Vitest and React Testing Library:

```bash
npm run test
```

### Building

To build the application for distribution:

```bash
npm run dist
```

This will create platform-specific installers in the `dist-electron` directory.

## Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts     # Main entry point
│   ├── preload.ts  # Preload script for secure IPC
│   └── utils.ts    # Utility functions
└── renderer/       # React renderer process
    ├── components/ # React components
    ├── contexts/   # React contexts
    ├── lib/        # Utilities and configurations
    └── __tests__/  # Test files
```

## Security

The application follows Electron security best practices:

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via preload script
- Encrypted credential storage using Electron's safeStorage API