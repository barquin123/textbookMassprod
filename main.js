const path = require('path');
const { app, BrowserWindow,ipcMain, dialog } = require('electron');
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js')
      },
    });

    app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
  
    mainWindow.loadFile('index.html');
  });

  // Ensure this handler is registered
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
  });
  return result.filePaths[0]; // Return the selected folder path
});

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  