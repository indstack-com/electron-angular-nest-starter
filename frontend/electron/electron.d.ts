// Type definitions for Electron API exposed via preload
export interface ElectronAPI {
  startServer: (args: {
    nodeEntry: string;
    port: number;
    env?: Record<string, string>;
  }) => Promise<boolean>;
  stopServer: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};

