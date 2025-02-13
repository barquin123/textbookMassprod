const path = require('path');
const { app, BrowserWindow } = require('electron');
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, 'preload.js')
      },
    });

    app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
  
    mainWindow.loadFile('index.html');
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  