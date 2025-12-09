import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { spawn } from 'child_process';

let serverProcess: any = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 760,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Open DevTools automatically in dev mode
  if (process.env.ELECTRON_DEV === 'true') {
    win.webContents.openDevTools();
    console.log('[Electron] Loading from dev server: http://localhost:4200');
    win.loadURL('http://localhost:4200');
    
    // Handle loading errors
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('[Electron] Failed to load:', errorDescription);
      console.error('[Electron] Make sure Angular dev server is running on http://localhost:4200');
    });
  } else {
    const indexPath = path.join(__dirname, '../client/dist/client/browser/index.html');
    console.log('[Electron] Loading from file:', indexPath);
    win.loadFile(indexPath);
  }
  
  // Log when page finishes loading
  win.webContents.on('did-finish-load', () => {
    console.log('[Electron] Page loaded successfully');
  });
}

function startEmbeddedServer(nodeEntry: string, port: number, envVars: Record<string, string>) {
  if (serverProcess) return;
  serverProcess = spawn(process.execPath, [nodeEntry], {
    env: { ...process.env, ...envVars, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout?.on('data', (d) => console.log('[server]', d.toString()));
  serverProcess.stderr?.on('data', (d) => console.error('[server-err]', d.toString()));
  serverProcess.on('exit', () => { serverProcess = null; });
}

ipcMain.handle('start-server', (_, args) => { startEmbeddedServer(args.nodeEntry, args.port, args.env || {}); return true; });
ipcMain.handle('stop-server', () => { serverProcess?.kill(); return true; });

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

