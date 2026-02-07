const setupEvents = require('./installers/setupEvents')
 if (setupEvents.handleSquirrelEvent()) {
    return;
 }

const server = require('./server');
const {app, BrowserWindow, ipcMain, screen} = require('electron');
const path = require('path')
const Store = require('electron-store');
const contextMenu = require('electron-context-menu');

let mainWindow
let storage = new Store();

function createWindow() {
  var primaryDisplay = screen.getPrimaryDisplay();
  var screenDimensions = primaryDisplay.workAreaSize;
  mainWindow = new BrowserWindow({
    width: screenDimensions.width,
    height: screenDimensions.height,
    frame: false,
    minWidth: 1200, 
    minHeight: 750,
    
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadURL(
    `file://${path.join(__dirname, 'index.html')}`
  )

    // Add this - opens DevTools automatically in development
  if (process.env.NODE_ENV === 'dev') {
    mainWindow.webContents.openDevTools();
}

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}


app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})



ipcMain.on('app-quit', (evt, arg) => {
  app.quit()
})


ipcMain.on('app-reload', (event, arg) => {
  mainWindow.reload();
});

ipcMain.handle('get-app-path', (event, pathType) => {
  return app.getPath(pathType);
});

ipcMain.handle('store-get', (event, key) => {
  return storage.get(key);
});

ipcMain.on('store-set', (event, key, value) => {
  storage.set(key, value);
});

ipcMain.on('store-delete', (event, key) => {
  storage.delete(key);
});

contextMenu({
  prepend: (params, browserWindow) => [
     
      {label: 'DevTools',
       click(item, focusedWindow){
        focusedWindow.toggleDevTools();
      }
    },
     { 
      label: "Reload", 
        click() {
          mainWindow.reload();
      } 
    // },
    // {  label: 'Quit',  click:  function(){
    //    mainWindow.destroy();
    //     mainWindow.quit();
    // } 
  }  
  ],

});
