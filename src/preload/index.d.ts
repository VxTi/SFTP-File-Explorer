import { ElectronAPI }                        from '@electron-toolkit/preload';
import { IFileEntry }                         from '@/common/file-information';
import { ISSHSession }                        from '@/common/ssh-definitions';
import { ICommandSnippet, ISSHSessionSecure } from '../core/common/ssh-definitions';

declare global {
    interface Window {
        electron: ElectronAPI;
        api: {
            on: ( channel: string, listener: ( event: any, ...args: any[] ) => void ) => void,
            fs: {
                listFiles: ( targetPath: string ) => Promise<IFileEntry[]>,
                localHomeDir: string,
                separator: string
            },
            sftp: {
                shell: {
                    getContent: ( sessionId: string, shellId: string ) => Promise<string>,
                    create: ( sessionId: string ) => Promise<void>,
                    destroy: ( sessionId: string, shellId: string ) => Promise<void>,
                    exec: ( sessionId: string, shellId: string, command: string ) => Promise<void>,
                    listShells: ( sessionId: string ) => Promise<string[]>,
                    snippets: {
                        list: () => Promise<ICommandSnippet[]>,
                        create: ( snippet: Omit<ICommandSnippet, 'snippetId'> ) => void,
                        remove: ( snippetId: string ) => void
                    }
                },
                connect: ( sessionId: string ) => Promise<{ error: null | string, sessionId: string | null }>,
                homeDir: ( sessionId: string ) => Promise<string>,
                listFiles: ( sessionId: string, targetPath: string ) => Promise<IFileEntry[]>
            },
            sessions: {
                list: () => Promise<ISSHSessionSecure[]>,
                create: ( session: Omit<ISSHSession, 'uid'> ) => Promise<void>,
                update: ( session: ISSHSessionSecure ) => Promise<void>,
                remove: ( sessionId: string ) => Promise<void>
            }
        };
    }
}
