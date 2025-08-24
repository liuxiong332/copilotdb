# Build script for Database GUI Desktop Application

Write-Host "Building Database GUI Desktop Application..." -ForegroundColor Green

# Check if Flutter is available
if (!(Get-Command flutter -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Flutter is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Get dependencies
Write-Host "Getting Flutter dependencies..." -ForegroundColor Yellow
flutter pub get

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to get dependencies" -ForegroundColor Red
    exit 1
}

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
flutter test

if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Some tests failed" -ForegroundColor Yellow
}

# Build for Windows (requires Developer Mode enabled)
Write-Host "Building for Windows..." -ForegroundColor Yellow
flutter build windows --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "Executable location: build/windows/x64/runner/Release/database_gui_desktop.exe" -ForegroundColor Cyan
} else {
    Write-Host "Build failed. Common issues and solutions:" -ForegroundColor Red
    Write-Host "1. Developer Mode: Run 'start ms-settings:developers' to enable Developer Mode" -ForegroundColor Yellow
    Write-Host "2. Missing ATL headers: Install Visual Studio with 'Desktop development with C++' workload" -ForegroundColor Yellow
    Write-Host "3. Ensure ATL components are installed in Visual Studio Individual Components" -ForegroundColor Yellow
    Write-Host "4. Try running 'flutter clean' and 'flutter pub get' then build again" -ForegroundColor Yellow
    Write-Host "See README.md for detailed troubleshooting steps." -ForegroundColor Cyan
}