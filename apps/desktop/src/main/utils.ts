import { app } from 'electron';

/**
 * Check if the app is running in development mode
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development' || !app.isPackaged;
}

/**
 * Get the app data path for storing user data
 */
export function getAppDataPath(): string {
  return app.getPath('userData');
}

/**
 * Get the app version
 */
export function getAppVersion(): string {
  return app.getVersion();
}