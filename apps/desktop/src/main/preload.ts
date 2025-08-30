import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // Window controls
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
  
  // Secure storage
  storage: {
    encrypt: (data: string) => Promise<Buffer>;
    decrypt: (encryptedData: Buffer) => Promise<string>;
  };
  
  // App info
  app: {
    getVersion: () => Promise<string>;
    isDev: () => Promise<boolean>;
  };
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },
  
  storage: {
    encrypt: (data: string) => ipcRenderer.invoke('storage:encrypt', data),
    decrypt: (encryptedData: Buffer) => ipcRenderer.invoke('storage:decrypt', encryptedData),
  },
  
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    isDev: () => ipcRenderer.invoke('app:isDev'),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}