import { ElectronAPI } from '@electron-toolkit/preload'
import { IFileEntry }                   from "@/common/file-information";
import { ISSHSession, ISSHSessionSafe } from "@/common/ssh-definitions";

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
                    getContent: (sessionId: string, shellId: string) => Promise<string>,
                    create: (sessionId: string) => Promise<void>,
                    destroy: (sessionId: string, shellId: string) => Promise<void>,
                    exec: (sessionId: string, shellId: string, command: string) => Promise<void>,
                    listShells: (sessionId: string) => Promise<string[]>
                },
                connect: (sessionId: string) => Promise<{ error: null | string, sessionId: string | null }>,
                homeDir: (sessionId: string) => Promise<string>,
                listFiles: (sessionId: string, targetPath: string) => Promise<IFileEntry[]>
            },
            sessions: {
                list: () => Promise<ISSHSessionSafe[]>,
                create: (session: Omit<ISSHSession, 'uid'>) => Promise<void>,
                remove: (sessionId: string) => Promise<void>
            }
        }
    }
}
