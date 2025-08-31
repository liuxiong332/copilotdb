import { app, BrowserWindow, ipcMain, safeStorage } from 'electron';
import * as path from 'path';
import { isDev } from './utils';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

class MainApplication {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupIpcHandlers();
    });

    // Handle window closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app activate (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      frame: false, // Frameless window as per requirements
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      show: false, // Don't show until ready
    });

    // Load the renderer
    if (isDev()) {
      this.mainWindow.loadURL('http://localhost:3001');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIpcHandlers(): void {
    // Window controls for frameless window
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });

    ipcMain.handle('window:isMaximized', () => {
      return this.mainWindow?.isMaximized() || false;
    });

    // Secure storage for database credentials
    ipcMain.handle('storage:encrypt', (_, data: string) => {
      if (safeStorage.isEncryptionAvailable()) {
        return safeStorage.encryptString(data);
      }
      throw new Error('Encryption not available');
    });

    ipcMain.handle('storage:decrypt', (_, encryptedData: Buffer) => {
      if (safeStorage.isEncryptionAvailable()) {
        return safeStorage.decryptString(encryptedData);
      }
      throw new Error('Decryption not available');
    });

    // App info
    ipcMain.handle('app:getVersion', () => {
      return app.getVersion();
    });

    ipcMain.handle('app:isDev', () => {
      return isDev();
    });
  }
}

// Initialize the application
new MainApplication();