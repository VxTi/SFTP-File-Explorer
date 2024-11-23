/**
 * @fileoverview SessionHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 10:56
 */

import EVENTS                           from '@/common/events.json';
import { ISSHSession, ISSHSessionSafe } from '@/common/ssh-definitions';
import { app, ipcMain }                 from 'electron';
import fs                               from 'fs';
import path                             from 'node:path';
import { RegisteredSessions }           from './SFTPHandlers';

export const sessionsPath = path.join( app.getPath( 'userData' ), 'sessions.json' );

/**
 * Create a session ID.
 * @returns {string} The session ID.
 */
function createSessionId(): string {
    return 'session-' + Math.random().toString( 36 ).substring( 2, 15 );
}

/**
 * Excludes sensitive properties from a session.
 * This is used to prevent sensitive information from being sent to the renderer process.
 * @param {string} sessionId The ID of the session to extract sensitive information from.
 * @returns {ISSHSessionSafe | null} The sensitive information.
 */
function excludeSensitiveProperties( sessionId: string ): ISSHSessionSafe | null {
    const session = RegisteredSessions.get( sessionId );

    if ( !session )
        return null;

    return {
        sessionId: session.session.uid,
        username: session.session.username,
        hostAddress: session.session.hostAddress,
        port: session.session.port ?? 22,
        alias: session.session.alias,
        requiresFingerprintVerification: session.session.requiresFingerprintVerification,
        status: session.status
    } as ISSHSessionSafe;
}

/**
 * Get information about a specific session.
 * @param {string} sessionUID The UID of the session to get information about.
 * @returns {IRegisteredSession} The information about the session.
 */
ipcMain.handle( EVENTS.SESSIONS.INFO, ( _, sessionUID: string ): ( ISSHSessionSafe | null ) => {
    return excludeSensitiveProperties( sessionUID );
} );

/**
 * List all registered sessions.
 * @returns {string[]} The list of all registered sessions.
 */
ipcMain.handle( EVENTS.SESSIONS.LIST, (): ISSHSessionSafe[] => {
    return Array.from( RegisteredSessions.keys() )
                .map( excludeSensitiveProperties )
                .filter( ( session ) => session !== null );
} );

/**
 * Remove a session from the registered sessions.
 * @param {string} sessionUID The UID of the session to remove.
 */
ipcMain.handle( EVENTS.SESSIONS.REMOVE, ( event, sessionUID: string ) => {
    RegisteredSessions.delete( sessionUID );
    event.sender.send( EVENTS.SESSIONS.LIST_CHANGED );

    let sessions: ISSHSession[] = [];
    if ( !fs.existsSync( sessionsPath ) ) {
        fs.writeFileSync( sessionsPath, '[]' );
    } else {
        try {
            sessions = JSON.parse( fs.readFileSync( sessionsPath ).toString() );
        } catch ( e ) {
            sessions = [];
        }
    }
    sessions = sessions.filter( ( session ) => session.uid !== sessionUID );
    fs.writeFileSync( sessionsPath, JSON.stringify( sessions ) );
} );

/**
 * Add a session to the registered sessions.
 */
ipcMain.handle( EVENTS.SESSIONS.CREATE, ( event, session: ISSHSession ) => {
    const sessionId = createSessionId();
    RegisteredSessions.set( sessionId, {
        session: Object.assign( session, { uid: sessionId } ),
        status: 'idle',
        shells: new Map()
    } );
    let sessions: ISSHSession[] = [];
    if ( !fs.existsSync( sessionsPath ) ) {
        fs.writeFileSync( sessionsPath, '[]' );
    } else {
        try {
            sessions = JSON.parse( fs.readFileSync( sessionsPath ).toString() );
            console.error( sessions );
        } catch ( e ) {
            sessions = [];
        }
    }

    sessions.push( session );
    fs.writeFileSync( sessionsPath, JSON.stringify( sessions ) );

    event.sender.send( EVENTS.SESSIONS.LIST_CHANGED );
} );

/**
 * Updates properties of an existing session, given a session object.
 */
ipcMain.handle( EVENTS.SESSIONS.UPDATE, ( event, session: ISSHSessionSafe ) => {

    // If the session doesn't exist for some reason, just exit.
    if ( !RegisteredSessions.has( session.sessionId ) )
        return;

    const storedSession   = RegisteredSessions.get( session.sessionId )!;
    storedSession.session = {
        ...storedSession.session,
        port:                            session.port || 22,
        alias:                           session.alias,
        requiresFingerprintVerification: session.requiresFingerprintVerification,
        hostAddress:                     session.hostAddress
    };
    event.sender.send( EVENTS.SESSIONS.LIST_CHANGED );
} );