import { app, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import {
  getSerialportList,
  MainlandChinaAdapter,
  SMSerialport
} from 'smserialport'

import { AdapterOptinos } from 'smserialport'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2]
    mainWindow.loadURL(`http://localhost:${rendererPort}`)
  } else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["script-src 'self'"]
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('ipc-list', () => {
  return getSerialportList()
})

const smserialport = new SMSerialport(MainlandChinaAdapter)

let connectOnce = false
let devicePath = ''

const config = () => {
  smserialport.config({
    path: devicePath,
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  })
}

ipcMain.handle('ipc-config', (_event, path: string) => {
  if (connectOnce) {
    return
  }

  connectOnce = true

  devicePath = path
})

ipcMain.handle('ipc-close', (_event) => {
  smserialport.close()
})

ipcMain.handle('ipc-send', async (_event, options: AdapterOptinos) => {
  config()
  return smserialport.send(options)
})

ipcMain.handle('ipc-phone', () => {
  config()
  return smserialport.getSender()
})
