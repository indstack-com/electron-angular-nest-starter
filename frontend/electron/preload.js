const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  startServer: (args) => ipcRenderer.invoke('start-server', args),
  stopServer: () => ipcRenderer.invoke('stop-server')
});

