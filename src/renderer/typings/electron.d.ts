import { AdapterOptinos, PortInfo } from '@smserialport/types'

/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  getSerialportList: () => Promise<PortInfo[]>
  config: (path: string) => Promise<any>
  close: () => Promise<any>
  sendMessage: (options: AdapterOptinos) => Promise<any>
  getSender: () => Promise<string | undefined>
}

declare global {
  interface Window {
    electronAPI: ElectronApi
  }
}
