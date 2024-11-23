/**
 * @fileoverview SessionHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 10:56
 */

import EVENTS                             from '@/common/events.json';
import { ISSHSession, ISSHSessionSecure } from '@/common/ssh-definitions';
import { ipcMain }                        from 'electron';
import { ConfigFile }                     from '../fs/ConfigFile';
import { IRegisteredSession }             from './SFTPHandlers';

export const SessionsConfig = new ConfigFile<IRegisteredSession>(
    { fileName: 'sessions.json', encryption: { key: 'test' } }
);

/**
 * Excludes sensitive properties from a session.
 * This is used to prevent sensitive information from being sent to the renderer process.
 * @param {string} sessionId The ID of the session to extract sensitive information from.
 * @returns {ISSHSessionSecure | null} The sensitive information.
 */
function excludeSensitiveProperties( sessionId: string ): ISSHSessionSecure | null {
    const session: IRegisteredSession | undefined = SessionsConfig.value[ sessionId ];

    if ( !session )
        return null;

    return {
        uid:         session.session.uid,
        username:    session.session.username,
        hostAddress: session.session.hostAddress,
        port:        session.session.port ?? 22,
        alias:       session.session.alias,
        requiresFingerprintVerification: session.session.requiresFingerprintVerification,
        status:      session.status
    } as ISSHSessionSecure;
}

/**
 * Get information about a specific session.
 * @param {string} sessionUID The UID of the session to get information about.
 * @returns {IRegisteredSession} The information about the session.
 */
ipcMain.handle( EVENTS.SESSIONS.INFO, ( _, sessionId: string ): ( ISSHSessionSecure | null ) => {
    return excludeSensitiveProperties( sessionId );
} );

/**
 * List all registered sessions.
 * @returns {string[]} The list of all registered sessions.
 */
ipcMain.handle( EVENTS.SESSIONS.LIST, (): ISSHSessionSecure[] => {
    return Object.keys( SessionsConfig.value )
                 .map( excludeSensitiveProperties )
                 .filter( ( session ) => session !== null );
} );

/**
 * Remove a session from the registered sessions.
 * @param {string} sessionUID The UID of the session to remove.
 */
ipcMain.handle( EVENTS.SESSIONS.REMOVE, ( event, sessionId: string ) => {
    SessionsConfig.remove( sessionId );
    event.sender.send( EVENTS.SESSIONS.LIST_CHANGED );
} );

/**
 * Add a session to the registered sessions.
 */
ipcMain.handle( EVENTS.SESSIONS.CREATE, ( event, session: Omit<ISSHSession, 'uid'> ) => {
    const sessionId = ConfigFile.randomKey();
    SessionsConfig.set( sessionId, {
        session: Object.assign( session, { uid: sessionId } ),
        status: 'idle',
        shells: new Map()
    } );

    event.sender.send( EVENTS.SESSIONS.LIST_CHANGED );
} );

/**
 * Updates properties of an existing session, given a session object.
 */
ipcMain.handle( EVENTS.SESSIONS.UPDATE, ( event, session: ISSHSessionSecure ) => {

    // If the session doesn't exist for some reason, just exit.
    if ( !SessionsConfig.value[ session.uid ] ) {
        return;
    }

    const currentValue = SessionsConfig.value[ session.uid ];
    SessionsConfig.set( session.uid, { ...currentValue, session: { ...session, port: session.port || 22 } } );
    event.sender.send( EVENTS.SESSIONS.LIST_CHANGED );
} );