/**
 * @fileoverview SFTPHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 14:44
 */

import { ipcMain }                                from "electron";
import { IRegisteredSession, RegisteredSessions } from "./SFTP";
import { IShellMessage, ISSHSession }             from "@/common/ssh-definitions";
import { IFileEntry }                             from "@/common/file-information";
import { Client, ClientChannel }                  from "ssh2";
import { IpcMainInvokeEvent }                     from "electron/main";

import EVENTS from '@/common/ipc-events.json';

/**
 * Verifies the provided session ID.
 * If the session ID is not found, an error message will be sent to the renderer process.
 * @param event The IpcMainInvokeEvent object.
 * @param sessionId The session ID to verify.
 */
function verifySessionID(event: IpcMainInvokeEvent, sessionId: string): boolean {
    if ( !RegisteredSessions.has(sessionId) ) {
        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE,
                          { target: 'stderr', message: 'No active SFTP connection available.' } as IShellMessage);
        return false;
    }
    return true;
}

/**
 * Executes a command in the provided shell instance.
 * The IO of the shell execution will be emitted in the 'SFTP.SHELL.MESSAGE' event.
 */
ipcMain.handle(EVENTS.SFTP.SHELL.EXEC, (event, sessionId: string, shellId: string, command: string) => {
    if ( !verifySessionID(event, sessionId) ) {
        return;
    }

    const session = RegisteredSessions.get(sessionId)!;

    if ( !session.shells.has(shellId) ) {
        console.log("Shell ID ", shellId, " does not exist ", session.shells, sessionId, shellId, command);
        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE,
                          { target: 'stderr', message: 'Shell not found.' } as IShellMessage);
        return;
    }

    session.shells.get(shellId)?.exec(command);
});

/**
 * Lists the available shells in the provided SSH session.
 * @returns {string[]} An array of shell IDs.
 */
ipcMain.handle(EVENTS.SFTP.SHELL.LIST_SHELLS, (event, sessionId: string) => {
    if ( !verifySessionID(event, sessionId) ) {
        return [];
    }

    const session = RegisteredSessions.get(sessionId)!;

    if ( session.status !== 'connected' ) {
        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE,
                          { target: 'stderr', message: 'No active SFTP connection available.' } as IShellMessage);
        return [];
    }

    return Array.from(session.shells.keys());
});

/**
 * Creates a new shell instance in the provided SSH session.
 * This will attempt to create a new shell instance in the provided SSH session.
 * If the creation is successful, the shell ID will emit in the 'SFTP.SHELL.CREATED' event.
 */
ipcMain.handle(EVENTS.SFTP.SHELL.CREATE, (event, sessionId: string) => {
    if ( !RegisteredSessions.has(sessionId) ) {
        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE,
                          { target: 'stderr', message: 'No active SFTP connection available.' } as IShellMessage);
    }
    const session = RegisteredSessions.get(sessionId);

    if ( !session || !session.client || session.status !== 'connected' ) {
        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE,
                          { target: 'stderr', message: 'No active SFTP connection available.' } as IShellMessage);
        return;
    }

    /*
     * Create a new shell instance in the provided SSH session.
     */
    session.client.shell((error: Error | undefined, stream: ClientChannel) => {
        if ( error ) {
            event.sender.send(EVENTS.SFTP.SHELL.ERROR,
                              { message: error.message } as IShellMessage);
            return;
        }

        const shellId = 'sh-' + Math.random().toString(36).substring(2, 8);
        event.sender.send(EVENTS.SFTP.SHELL.CREATED, { shellId: shellId });

        let sessionContent = '';

        // Register the shell instance in the session.
        session.shells.set(shellId, {
            exec: (command: string) => {
                console.log(command);
                session.client!.exec(command + '\n', (error, stream) => {
                    if ( error ) {
                        event.sender.send(EVENTS.SFTP.SHELL.ERROR,
                                          { message: error.message } as IShellMessage);
                        return;
                    }

                    stream.on('data', (data) => {
                        const decoded = data.toString();
                        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE,
                                          {
                                              shellId: shellId, target: 'stdio', message: decoded
                                          } as IShellMessage);
                        sessionContent += decoded;
                        console.log(decoded);
                    });
                });
            },
            sessionContent: sessionContent
        });

        stream
            .on('close', () => {

                // Remove the shell from the session.
                session.shells.delete(shellId);
                event.sender.send(EVENTS.SFTP.SHELL.MESSAGE, {
                    target: 'stderr',
                    message: 'Shell closed.'
                } as IShellMessage);
                event.sender.send(EVENTS.SFTP.SHELL.DESTROY, { shellId: shellId });
            })
            .on('data', (message: any) => {
                const decoded = message.toString();

                // Append data and send it to the renderer process.
                event.sender.send(EVENTS.SFTP.SHELL.MESSAGE, { target: 'stdio', message: decoded } as IShellMessage);
                sessionContent += decoded;
            });
    })
})

/**
 * Destroys the shell instance in the provided SSH session.
 */
ipcMain.handle(EVENTS.SFTP.SHELL.DESTROY, (event, sessionId: string, shellId: string) => {
    if ( !verifySessionID(event, sessionId) )
        return;

    const session = RegisteredSessions.get(sessionId)!;

    if ( !session.shells.has(shellId) ) {
        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE,
                          { target: 'stderr', message: 'Shell not found.' } as IShellMessage);
        return;
    }

    session.shells.delete(shellId);
});

/**
 * Attempts to establish an SSH Connection with the remote server.
 * This will return the session object if the connection is successful.
 */
ipcMain.handle(EVENTS.SFTP.ESTABLISH_CONNECTION, async (event, session: ISSHSession) => {
    if ( RegisteredSessions.has(session.uid) )
        return { sessionId: RegisteredSessions.get(session.uid)!.session.uid, error: null };

    const client = new Client();

    const sessionObject: IRegisteredSession = {
        session: session,
        status: 'idle',
        client: client,
        shells: new Map()
    };

    console.log(sessionObject);

    return await new Promise((resolve) => {
        client
            .on('ready', () => {
                client.sftp((error, sftp) => {
                    if ( error ) {
                        event.sender.send(EVENTS.SFTP.CONNECTION_REFUSED, { message: error.message });
                        resolve({ sessionId: null, error: error.message });
                    }
                    resolve({ sessionId: sessionObject.session.uid, error: null });
                    sessionObject.sftp   = sftp;
                    sessionObject.status = 'connected';
                    RegisteredSessions.set(session.uid, sessionObject);
                })
            })
            // @ts-ignore
            .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
                console.log(prompts);
                if ( prompts.length > 0 && prompts[ 0 ][ 'prompt' ].toLowerCase().includes('password') )
                    finish([ session.password ?? '' ]);
            })
            .on('error', (error) => {
                event.sender.send(EVENTS.SFTP.CONNECTION_REFUSED, { message: error.message });
                resolve({ sessionId: null, error: error.message });
            })
            .on('close', () => {
                sessionObject.status = 'idle';
                RegisteredSessions.set(session.uid, sessionObject);
            })
            .on('end', () => {
                sessionObject.status = 'idle';
                RegisteredSessions.set(session.uid, sessionObject);
            })
            .connect(
                {
                    host: session.hostAddress,
                    port: session.port ?? 22,
                    password: session.password ?? '',
                    username: session.username,
                    privateKey: session.privateKey ?? '',
                    passphrase: session.passphrase ?? '',
                });
    });
});

/**
 * Attempts to list the files in the provided directory on the remote server.
 * This will return an empty array if the session is not found or the connection is not established.
 */
ipcMain.handle(EVENTS.SFTP.LIST_FILES, async (event, sessionUid: string, targetPath) => {
    if ( !verifySessionID(event, sessionUid) )
        return [];

    const session = RegisteredSessions.get(sessionUid)!;

    if ( !session.sftp || session.status !== 'connected' ) {
        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE, {
            target: 'stderr',
            message: 'No active SFTP connection available.'
        } as IShellMessage);
        return [];
    }

    return await new Promise((resolve) => {
        session.sftp!.readdir(targetPath, (error, files) => {
            if ( error ) {
                event.sender.send(EVENTS.SFTP.SHELL.MESSAGE, {
                    target: 'stderr',
                    message: error.message
                } as IShellMessage);
                return;
            }

            resolve(files.map((file) => ({
                name: file.filename,
                path: targetPath + '/' + file.filename,
                type: file.attrs.isSymbolicLink() ? 'symlink' :
                      file.attrs.isDirectory() ? 'directory' :
                      file.attrs.isBlockDevice() ? 'block-device' :
                      file.attrs.isCharacterDevice() ? 'character-device' : 'file',
                size: file.attrs.size,
                mode: file.attrs.mode,
                lastAccessTimeMs: file.attrs.atime,
                lastModifiedTimeMs: file.attrs.mtime,
                creationTimeMs: file.attrs.atime,
                nlink: 0, blocks: 0, blksize: 0, dev: 0,
                gid: 0, ino: 0, rdev: 0, uid: 0
            } as IFileEntry)));
        });
    });
});

/**
 * Attempts to retrieve the home directory of the remote server.
 */
ipcMain.handle(EVENTS.SFTP.HOME_DIR, async (event, sessionUid: string) => {
    if ( !verifySessionID(event, sessionUid) ) {
        return "/";
    }

    const session = RegisteredSessions.get(sessionUid)!;

    if ( !session.sftp || session.status !== 'connected' ) {
        event.sender.send(EVENTS.SFTP.SHELL.MESSAGE, {
            target: 'stderr',
            message: 'No active SFTP connection available.'
        } as IShellMessage);
        return "/";
    }

    return await new Promise((resolve) => {
        session.sftp!.realpath('.', (error, path) => {
            if ( error ) {
                event.sender.send(EVENTS.SFTP.SHELL.MESSAGE, {
                    target: 'stderr',
                    message: error.message
                } as IShellMessage);
                resolve('/');
                return;
            }

            resolve(path);
        });
    });
})
