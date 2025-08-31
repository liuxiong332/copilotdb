import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Electron API
const mockElectronAPI = {
  window: {
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn().mockResolvedValue(false),
  },
  storage: {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  app: {
    getVersion: vi.fn().mockResolvedValue('1.0.0'),
    isDev: vi.fn().mockResolvedValue(true),
  },
};

// Mock the global electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Mock localStorage with actual implementation
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// React 18 compatibility - suppress act warnings in tests
(global as any).IS_REACT_ACT_ENVIRONMENT = true;