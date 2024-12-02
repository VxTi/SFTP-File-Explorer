/**
 * @fileoverview SFTPHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 14:44
 */

import { EVENTS }                                                       from '@/common/app';
import { IFileEntry }                                                   from '@/common/file-information';
import { IShellMessage, IShellSession, ISSHSession, TConnectionStatus } from '@/common/ssh-definitions';
import { ipcMain, IpcMainInvokeEvent, systemPreferences, WebContents }  from 'electron';
import fs                                                               from 'fs';
import { Client, ClientChannel, SFTPWrapper }                           from 'ssh2';
import { ConfigFile }                                                   from '../util/ConfigFile';
import { emitError }                                                    from '../util/IPCMessages';
import { SessionsConfig }                                               from './SessionHandlers';

export interface IRegisteredSession {
    session: ISSHSession;
    status: TConnectionStatus;
    shells: Map<string, IShellSession>;
    client?: Client;
    sftp?: SFTPWrapper;
}

/**
 * Executes a command in the provided shell instance.
 * The IO of the shell execution will be emitted in the 'SFTP.SHELL.MESSAGE' event.
 */
ipcMain.handle( EVENTS.SFTP.SHELL.EXEC, ( _, sessionId: string, shellId: string, command: string ) => {

    const session = SessionsConfig.valueAt( sessionId );

    if ( !session || !session.shells.has( shellId ) ) {
        emitError( { error: 'No active connection with shell' } );
        return;
    }

    session.shells.get( shellId )?.exec( command );
} );

/**
 * Lists the available shells in the provided SSH session.
 * @returns {string[]} An array of shell IDs.
 */
ipcMain.handle( EVENTS.SFTP.SHELL.LIST_SHELLS, ( _, sessionId: string ) => {
    const session = SessionsConfig.valueAt( sessionId );

    console.log( 'LIST_SHELLS', session, sessionId );

    if ( !session || session.status !== 'connected' ) {
        emitError( { error: 'No active connection with shell' } );
        console.log( session, sessionId );
        return [];
    }

    return Array.from( session.shells.keys() );
} );

/**
 * Creates a new shell instance in the provided SSH session.
 * This will attempt to create a new shell instance in the provided SSH session.
 * If the creation is successful, the shell ID will emit in the 'SFTP.SHELL.CREATED' event.
 * @sends `SFTP.SHELL.CREATED` event with params `{ shellId: string }`
 * @sends `SFTP.SHELL.MESSAGE` event with params `{ target: 'stderr', message: string }`
 */
ipcMain.handle( EVENTS.SFTP.SHELL.CREATE, ( event: IpcMainInvokeEvent, sessionId: string ) => createShell( event.sender, sessionId ) );

/**
 * Destroys the shell instance in the provided SSH session.
 * @sends `SFTP.SHELL.DESTROYED` event with params `{ shellId: string }`
 */
ipcMain.handle( EVENTS.SFTP.SHELL.DESTROY, ( event, sessionId: string, shellId: string ) => {
    const session = SessionsConfig.valueAt( sessionId );

    if ( !session ) {
        return;
    }

    if ( !session.shells.has( shellId ) ) {
        emitError( { error: 'Failed to disconnect shell: shell not found.' } );
        return;
    }

    session.shells.delete( shellId );

    event.sender.send( EVENTS.SFTP.SHELL.DESTROYED, { shellId: shellId } );
} );

/**
 * Retrieves the content of the shell instance in the provided SSH session.
 * This will return the content of the shell instance.
 * @returns {string} The content of the shell instance.
 */
ipcMain.handle( EVENTS.SFTP.SHELL.GET_CONTENT, ( _, sessionId: string, shellId: string ) => {
    const session = SessionsConfig.valueAt( sessionId );

    if ( !session || !session.shells.has( shellId ) ) {
        emitError( { error: 'No active connection with shell' } );
        return;
    }

    return session.shells.get( shellId )!.sessionContent;
} );

/**
 * Attempts to establish an SSH Connection with the remote server.
 * This will return the session object if the connection is successful.
 */
ipcMain.handle( EVENTS.SFTP.ESTABLISH_CONNECTION, async ( _, sessionId: string ) => {
    const session = SessionsConfig.valueAt( sessionId )?.session;
    if ( !session ) {
        emitError( { error: 'No session found with ID ' + sessionId } );
        return { sessionId: null, error: 'Session not found.' };
    }

    /* Fingerprint verification */
    do {

        // Check if the session requires fingerprint verification, and if the platform is macOS
        // Fingerprints are only supported on macOS
        if ( !( session.requiresFingerprintVerification && process.platform === 'darwin' ) )
            break;

        // Check if the system can prompt for TouchID
        if ( !systemPreferences.canPromptTouchID() )
            break;

        try {
            await systemPreferences.promptTouchID( 'verify fingerprint' );
        } catch ( _ ) {
            console.log( 'Fingerprint cancelled' );
            return { sessionId: null, error: 'Fingerprint verification failed.' };
        }

    } while ( false );

    const client = new Client();

    const sessionObject: IRegisteredSession = {
        session: session,
        status: 'idle',
        client: client,
        shells: new Map()
    };
    SessionsConfig.value[ session.uid ]     = sessionObject;

    const privateKeyFileContent = session.privateKeyFile && fs.existsSync( session.privateKeyFile ) ?
                                  fs.readFileSync( session.privateKeyFile, 'utf-8' ) : '';

    const handleDisconnect = () => {
        sessionObject.status = 'idle';
        sessionObject.shells.clear();
    };

    return await new Promise( ( resolve ) => {
        client
            .on( 'ready', () => {
                client.sftp( ( error: Error | undefined, sftp: SFTPWrapper ) => {
                    if ( error ) {
                        emitError( { error: 'Failed to access remote file system: ' + error.message } );
                        resolve( { sessionId: null, error: error.message } );
                    }

                    sessionObject.sftp   = sftp;
                    sessionObject.status = 'connected';

                    resolve( { sessionId: sessionObject.session.uid, error: null } );
                } );
            } )
            // @ts-ignore
            .on( 'keyboard-interactive', ( name, instructions, instructionsLang, prompts, finish ) => {
                console.log( prompts );
                if ( prompts.length > 0 && prompts[ 0 ][ 'prompt' ].toLowerCase().includes( 'password' ) )
                    finish( [ session.password ?? '' ] );
            } )
            .on( 'error', ( error ) => {
                emitError( { error: 'Failed to connect with session: ' + error.message } );
                resolve( { sessionId: null, error: error.message } );
            } )
            .on( 'close', () => handleDisconnect() )
            .on( 'end', () => handleDisconnect() )
            .connect(
                {
                    host:       session.hostAddress,
                    port:       session.port ?? 22,
                    password:   session.password ?? '',
                    username:   session.username,
                    privateKey: privateKeyFileContent,
                    passphrase: session.passphrase ?? ''
                } );
    } );
} );

/**
 * Attempts to list the files in the provided directory on the remote server.
 * This will return an empty array if the session is not found or the connection is not established.
 */
ipcMain.handle( EVENTS.SFTP.LIST_FILES, async ( _, sessionUid: string, targetPath ) => {

    const session = SessionsConfig.valueAt( sessionUid );

    if ( !session || !session.sftp || session.status !== 'connected' ) {
        emitError( { error: 'Failed to list files; not connected.' } );
        return [];
    }

    return await new Promise( ( resolve ) => {
        session.sftp!.readdir( targetPath, ( error, files ) => {
            if ( error ) {
                emitError( { error: 'An error occurred whilst listing home directory: ' + error.message } );
                console.error( session );
                return;
            }

            resolve( files.map( ( file ) => ( {
                name:             file.filename,
                path:             targetPath + '/' + file.filename,
                type:             file.attrs.isSymbolicLink() ? 'symlink' :
                                  file.attrs.isDirectory() ? 'directory' :
                                  file.attrs.isBlockDevice() ? 'block-device' :
                                  file.attrs.isCharacterDevice() ? 'character-device' : 'file',
                size:             file.attrs.size,
                mode:             file.attrs.mode,
                lastAccessTimeMs: file.attrs.atime,
                lastModifiedTimeMs: file.attrs.mtime,
                creationTimeMs:   file.attrs.atime,
                nlink:            0, blocks: 0, blksize: 0, dev: 0,
                gid:              0, ino: 0, rdev: 0, uid: 0
            } as IFileEntry ) ) );
        } );
    } );
} );

/**
 * Attempts to retrieve the home directory of the remote server.
 */
ipcMain.handle( EVENTS.SFTP.HOME_DIR, async ( _, sessionId: string ) => {

    const session = SessionsConfig.valueAt( sessionId );

    if ( !session || !session.sftp || session.status !== 'connected' ) {
        emitError( { error: 'Failed to retrieve home directory, not connected.' } );
        return '/';
    }

    return await new Promise( ( resolve ) => {
        session.sftp!.realpath( '.', ( error, path ) => {
            if ( error ) {
                emitError( { error: 'Failed to resolve home directory: ' + error.message } );
                resolve( '/' );
                return;
            }

            resolve( path );
        } );
    } );
} );

/**
 * Retrieves a file from the remove session from `remotePath` and appends it to the local file system at `localPath`
 */
ipcMain.handle( EVENTS.SFTP.GET_FILE, async ( _, sessionId: string, localPath: string, remotePath: string ) => {
    const session = SessionsConfig.valueAt( sessionId );
    if ( !session || !session.sftp || session.status !== 'connected' ) {
        emitError( { error: 'Failed to retrieve file, not connected.' } );
        return;
    }

    return await new Promise<Error | void>( ( resolve, reject ) => {
        session.sftp!.fastGet( remotePath, localPath, ( error?: Error | null ) => {
            if ( error ) return reject( error );
            resolve( void 0 );
        } );
    } );
} );

/**
 * Appends a file to the remote server at `remotePath` with content `data`.
 */
ipcMain.handle( EVENTS.SFTP.PUT_FILE, async ( _, sessionId: string, remotePath: string, data: string ) => {
    const session = SessionsConfig.valueAt( sessionId );
    if ( !session || !session.sftp || session.status !== 'connected' ) {
        emitError( { error: 'Failed to append file on remote; not connected.' } );
        return;
    }

    return await new Promise( ( resolve, reject ) => {
        session.sftp!.appendFile( remotePath, data, ( error?: Error | null ) => {
            if ( error ) return reject( error );
            resolve( void 0 );
        } );
    } );
} );

/**
 *
 */
ipcMain.handle( EVENTS.SFTP.RM_FILE, async ( _, sessionId: string, path: string ) => {

} );

/**
 * Attempts to create a new shell on the remote server, given the sessionId.
 * If there's no active connection associated with the sessionId
 * @param senderEvent
 * @param sessionId
 */
function createShell( senderEvent: WebContents, sessionId: string ) {
    const session = SessionsConfig.valueAt( sessionId );

    if ( !session || !session.client || session.status !== 'connected' ) {
        emitError( { error: 'Failed to create shell, no active connection available.' } );
        return;
    }

    const client = session.client;

    /*
     * Create a new shell instance in the provided SSH session.
     */
    client.shell( ( error: Error | undefined, stream: ClientChannel ) => {
        if ( error ) {
            emitError( { error: 'Failed to create shell, ' + error.message } );
            return;
        }

        const shellId = ConfigFile.randomKey();
        senderEvent.send( EVENTS.SFTP.SHELL.CREATED, { shellId } );

        const handleSendCommand = ( command: string ) => {
            client.exec( command + '\n', ( error ) => {
                if ( error ) {
                    emitError( { error: 'Failed to execute command: ' + error.message, details: error.stack } );
                    return;
                }
            } );
        };

        let sessionContent = '';
        stream.on( 'data', ( data: Buffer ) => {
                  const decoded = data.toString();
                  senderEvent.send( EVENTS.SFTP.SHELL.MESSAGE,
                                    { shellId: shellId, target: 'stdio', message: decoded } as IShellMessage );
                  sessionContent += decoded;
              } )
              .stderr.on( 'data', ( data: Buffer ) => {
                  const decoded = data.toString();
                  senderEvent.send( EVENTS.SFTP.SHELL.MESSAGE,
                                    { shellId: shellId, target: 'stderr', message: decoded } as IShellMessage );
              } )
              .on( 'close', () => {
                  // Remove the shell from the session.
                  session.shells.delete( shellId );
                  senderEvent.send( EVENTS.SFTP.SHELL.DESTROYED, { shellId: shellId } );
              } );

        // Register the shell instance in the session.
        session.shells.set( shellId, { exec: handleSendCommand, sessionContent: sessionContent } );
    } );
}

