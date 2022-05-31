const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
require('@electron/remote/main').initialize()


let win


function createWindow() {
   win = new BrowserWindow({
      width: 800,
      height: 600,

      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false
      }
   })
   win.loadURL(url.format({
      pathname: path.join(__dirname, 'main.html'),
      protocol: 'file:',
      slashes: true
   }))

   require("@electron/remote/main").enable(win.webContents)

   win.webContents.openDevTools()
}

app.on('ready', createWindow)
