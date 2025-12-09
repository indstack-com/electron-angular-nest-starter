const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;

// Debug: Check environment variable
console.log('[Electron] ELECTRON_DEV =', process.env.ELECTRON_DEV);
console.log('[Electron] Dev mode?', process.env.ELECTRON_DEV === 'true');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 760,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Open DevTools automatically in dev mode
  if (process.env.ELECTRON_DEV === 'true') {
    win.webContents.openDevTools();
    console.log('[Electron] Dev mode detected, loading from dev server');
    console.log('[Electron] URL: http://localhost:4200');
    
    // Load with error handling
    win.loadURL('http://localhost:4200').catch(err => {
      console.error('[Electron] Failed to load URL:', err);
    });
    
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

function startEmbeddedServer(nodeEntry, port, envVars) {
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

