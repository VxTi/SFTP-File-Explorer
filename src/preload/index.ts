import EVENTS                                              from '@/common/events.json';
import { IFileEntry }                                      from '@/common/file-information';
import { ICommandSnippet, ISSHSession, ISSHSessionSecure } from '@/common/ssh-definitions';
import { electronAPI }                                     from '@electron-toolkit/preload';
import { contextBridge }                                   from 'electron';
import path                                                from 'node:path';

contextBridge.exposeInMainWorld( 'electron', electronAPI );
contextBridge.exposeInMainWorld( 'api', {
    on:       ( channel: string, listener: ( ...args: any[] ) => void ) => {
        electronAPI.ipcRenderer.on( channel, listener );
    },
    sessions: {
        /**
         * Lists all SSH sessions
         */
        list: async () => {
            return await electronAPI.ipcRenderer.invoke( EVENTS.SESSIONS.LIST );
        },

        /**
         * Creates a new SSH session
         * @param session The session to create
         */
        create: async ( session: Omit<ISSHSession, 'uid'> ) => {
            await electronAPI.ipcRenderer.invoke( EVENTS.SESSIONS.CREATE, session );
        },

        /**
         * Removes an SSH session
         * @param sessionId The session ID of the session to remove
         */
        remove: async ( sessionId: string ) => {
            await electronAPI.ipcRenderer.invoke( EVENTS.SESSIONS.REMOVE, sessionId );
        },

        update: async ( session: ISSHSessionSecure ) => {
            await electronAPI.ipcRenderer.invoke( EVENTS.SESSIONS.UPDATE, session );
        }
    },
    fs:       {

        /**
         * Lists files in a directory
         * @param targetPath The path to list files in
         */
        listFiles:    async ( targetPath: string ): Promise<IFileEntry[]> => {
            return await electronAPI.ipcRenderer.invoke( EVENTS.LOCAL_FS.LIST_FILES, targetPath );
        },
        localHomeDir: electronAPI.ipcRenderer.sendSync( EVENTS.LOCAL_FS.HOME_DIRECTORY ),
        separator:    path.sep
    },
    sftp:     {
        shell: {

            /**
             * Creates a shell on the SFTP server
             * @param sessionUid The session ID of the SFTP server
             */
            create: async ( sessionUid: string ) => {
                return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.SHELL.CREATE, sessionUid );
            },

            /**
             * Destroys a shell with a given session ID and shell ID
             * @param sessionId The session ID of the shell
             * @param shellId The shell ID
             */
            destroy: async ( sessionId: string, shellId: string ) => {
                return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.SHELL.DESTROY, sessionId, shellId );
            },

            /**
             * Executes a command in a shell on the SFTP server
             * @param sessionId The session ID of the shell
             * @param shellId The shell ID
             * @param command The command to execute
             */
            exec: async ( sessionId: string, shellId: string, command: string ) => {
                return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.SHELL.EXEC, sessionId, shellId, command );
            },

            /**
             * Lists all shells associated with the provided session ID
             * @param sessionId The session ID of the shell
             */
            listShells: async ( sessionId: string ) => {
                return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.SHELL.LIST_SHELLS, sessionId );
            },

            /**
             * Gets the content of a shell from a given session with a given shell ID
             * @param sessionId The session ID of the shell
             * @param shellId The shell ID
             */
            getContent: async ( sessionId: string, shellId: string ) => {
                return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.SHELL.GET_CONTENT, sessionId, shellId );
            },

            snippets: {
                /**
                 * Returns a list of registered command snippets
                 */
                list: async (): Promise<ICommandSnippet[]> => {
                    return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.SHELL.SNIPPET.LIST );
                },
                /**
                 * Creates a new command snippet
                 * @param snippet
                 */
                create: ( snippet: Omit<ICommandSnippet, 'snippetId'> ): void => {
                    electronAPI.ipcRenderer.invoke( EVENTS.SFTP.SHELL.SNIPPET.CREATE, snippet );
                },
                /**
                 * Removes a snippet from the registered command snippets list,
                 * based on its snippetId.
                 * @param snippetId The snippet ID to remove.
                 */
                remove: ( snippetId: string ): void => {
                    electronAPI.ipcRenderer.invoke( EVENTS.SFTP.SHELL.SNIPPET.REMOVE, snippetId );
                }
            }
        },

        /**
         * Connects to an SFTP server
         * @param sessionId The session ID of the SFTP server
         */
        connect: async ( sessionId: string ): Promise<{ sessionId: string | null, error: string | null }> => {
            return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.ESTABLISH_CONNECTION, sessionId );
        },

        /**
         * Gets the home directory of the SFTP server
         * @param sessionId The session ID of the SFTP server
         */
        homeDir: async ( sessionId: string ): Promise<string> => {
            return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.HOME_DIR, sessionId );
        },

        /**
         * Lists files in a directory
         * @param sessionId The session ID of the SFTP server
         * @param targetPath The path to list files in
         */
        listFiles: async ( sessionId: string, targetPath: string ): Promise<IFileEntry[]> => {
            return await electronAPI.ipcRenderer.invoke( EVENTS.SFTP.LIST_FILES, sessionId, targetPath );
        }
    }
} );
