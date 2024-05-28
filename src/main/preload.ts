import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getSerialportList: () => ipcRenderer.invoke('ipc-list'),
  config: (...args: any) => ipcRenderer.invoke('ipc-config', ...args),
  close: (...args: any) => ipcRenderer.invoke('ipc-close', ...args),
  sendMessage: (...args: any) => ipcRenderer.invoke('ipc-send', ...args),
  getSender: () => ipcRenderer.invoke('ipc-phone')
})
