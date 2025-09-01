import { vi, beforeEach } from 'vitest';
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

// Mock Radix UI components to avoid React version conflicts
vi.mock('@radix-ui/react-dialog', () => {
  const React = require('react');
  return {
    Root: vi.fn(({ children, open }) => {
      return open ? React.createElement('div', { 'data-testid': 'dialog-root' }, children) : null;
    }),
    Trigger: vi.fn(({ children, ...props }) => React.createElement('button', props, children)),
    Portal: vi.fn(({ children }) => children),
    Overlay: vi.fn(({ children, ...props }) => React.createElement('div', { ...props, 'data-testid': 'dialog-overlay' }, children)),
    Content: vi.fn(({ children, ...props }) => React.createElement('div', { ...props, 'data-testid': 'dialog-content' }, children)),
    Title: vi.fn(({ children, ...props }) => React.createElement('h2', props, children)),
    Description: vi.fn(({ children, ...props }) => React.createElement('p', props, children)),
    Close: vi.fn(({ children, ...props }) => React.createElement('button', props, children)),
  };
});

vi.mock('@radix-ui/react-label', () => ({
  Root: vi.fn(({ children, ...props }) => {
    // Create a proper label element for testing
    const React = require('react');
    return React.createElement('label', props, children);
  }),
}));

vi.mock('@radix-ui/react-slot', () => ({
  Root: vi.fn(({ children }) => children),
  Slot: vi.fn(({ children }) => children),
}));

// Clear localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});