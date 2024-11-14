import { ElectronAPI } from '@electron-toolkit/preload'
import { IFileEntry }  from "@/common/file-information";
import { ISSHSession } from "@/common/ssh-definitions";

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            on: (channel: string, listener: (event: any, ...args: any[]) => void) => void,
            fs: {
                listFiles: (targetPath: string) => Promise<IFileEntry[]>,
                localHomeDir: string,
                separator: string
            },
            sftp: {
                shell: {
                    create: (sessionUid: string) => Promise<string>,
                    destroy: (sessionUid: string) => Promise<void>,
                    exec: (sessionUid: string, shellUid: string, command: string) => Promise<void>,
                    listShells: (sessionUid: string) => Promise<string[]>
                },
                connect: (session: ISSHSession) => Promise<{ error: null | string, sessionId: string | null }>,
                homeDir: (sessionUid: string) => Promise<string>,
                listFiles: (sessionUid: string, targetPath: string) => Promise<IFileEntry[]>
            },
            sessions: {
                list: () => Promise<ISSHSession[]>,
                create: (session: ISSHSession) => Promise<void>,
                remove: (sessionId: string) => Promise<void>
            }
        }
    }
}
