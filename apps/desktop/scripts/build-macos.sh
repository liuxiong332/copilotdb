#!/bin/bash

# Build script for Database GUI Desktop Application (macOS)

echo "Building Database GUI Desktop Application for macOS..."

# Check if Flutter is available
if ! command -v flutter &> /dev/null; then
    echo "Error: Flutter is not installed or not in PATH"
    exit 1
fi

# Get dependencies
echo "Getting Flutter dependencies..."
flutter pub get

if [ $? -ne 0 ]; then
    echo "Error: Failed to get dependencies"
    exit 1
fi

# Run tests
echo "Running tests..."
flutter test

if [ $? -ne 0 ]; then
    echo "Warning: Some tests failed"
fi

# Build for macOS
echo "Building for macOS..."
flutter build macos --release

if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    echo "Application location: build/macos/Build/Products/Release/database_gui_desktop.app"
else
    echo "Build failed."
    exit 1
fi