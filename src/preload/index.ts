import { contextBridge } from 'electron'
import { electronAPI }   from '@electron-toolkit/preload'
import { IFileEntry }    from "@/common/file-information";
import { ISSHSession }   from "@/common/ssh-definitions";
import path              from "node:path";

import EVENTS from '@/common/ipc-events.json';

contextBridge.exposeInMainWorld('electron', electronAPI);
contextBridge.exposeInMainWorld('api', {
    on: (channel: string, listener: (...args: any[]) => void) => {
        electronAPI.ipcRenderer.on(channel, listener)
    },
    sessions: {
        list: async () => {
            return await electronAPI.ipcRenderer.invoke(EVENTS.SESSIONS.LIST)
        },
        create: async (session: ISSHSession) => {
            await electronAPI.ipcRenderer.invoke(EVENTS.SESSIONS.CREATE, session)
        },
        remove: async (sessionId: string) => {
            await electronAPI.ipcRenderer.invoke(EVENTS.SESSIONS.REMOVE, sessionId)
        },
    },
    fs: {
        listFiles: async (targetPath: string): Promise<IFileEntry[]> => {
            return await electronAPI.ipcRenderer.invoke(EVENTS.LOCAL_FS.LIST_FILES, targetPath)
        },
        localHomeDir: electronAPI.ipcRenderer.sendSync(EVENTS.LOCAL_FS.HOME_DIRECTORY),
        separator: path.sep
    },
    sftp: {
        shell: {
            create: async (sessionUid: string) => {
                return await electronAPI.ipcRenderer.invoke(EVENTS.SFTP.SHELL.CREATE, sessionUid)
            },
            destroy: async (sessionUid: string) => {
                return await electronAPI.ipcRenderer.invoke(EVENTS.SFTP.SHELL.DESTROY, sessionUid)
            },
            exec: async (sessionUid: string, shellUid: string, command: string) => {
                return await electronAPI.ipcRenderer.invoke(EVENTS.SFTP.SHELL.EXEC, sessionUid, shellUid, command)
            },
            listShells: async (sessionUid: string) => {
                return await electronAPI.ipcRenderer.invoke(EVENTS.SFTP.SHELL.LIST_SHELLS, sessionUid)
            }
        },
        connect: async (session: ISSHSession): Promise<{ sessionId: string | null, error: string | null }> => {
            return await electronAPI.ipcRenderer.invoke(EVENTS.SFTP.ESTABLISH_CONNECTION, session)
        },
        homeDir: async (sessionUid: string): Promise<string> => {
            return await electronAPI.ipcRenderer.invoke(EVENTS.SFTP.HOME_DIR, sessionUid)
        },
        listFiles: async (sessionUid: string, targetPath: string): Promise<IFileEntry[]> => {
            return await electronAPI.ipcRenderer.invoke(EVENTS.SFTP.LIST_FILES, sessionUid, targetPath)
        }
    }
})
