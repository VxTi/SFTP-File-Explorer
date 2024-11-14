/**
 * @fileoverview SFTP.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 14:46
 */
import { IShellSession, ISSHSession, TConnectionStatus } from "@/common/ssh-definitions";
import { Client, SFTPWrapper }                           from 'ssh2'
import { app }                                           from "electron";
import path                                              from "node:path";
import fs                                                from "fs";

const sessionsPath: string = path.join(app.getPath('userData'), 'sessions.json');

export interface IRegisteredSession {
    session: ISSHSession;
    status: TConnectionStatus;
    shells: Map<string, IShellSession>;
    client?: Client;
    sftp?: SFTPWrapper;
}

/**
 * Registered Sessions
 */
export const RegisteredSessions: Map<string, IRegisteredSession> = (() => {

    const registeredSessions = new Map<string, IRegisteredSession>();

    if ( !fs.existsSync(sessionsPath) ) {
        fs.writeFileSync(sessionsPath, '[]');
        return registeredSessions;
    }

    const content: string = fs.readFileSync(sessionsPath, 'utf-8');

    // TODO: Add encryption / decryption
    const parsedContent: ISSHSession[] = JSON.parse(content);
    for ( const session of parsedContent ) {
        registeredSessions.set(session.uid, { session, shells: new Map(), status: 'idle' });
    }
    return registeredSessions;
})();

/**
 * Register an SSH Session to the registered sessions map.
 * This will overwrite existing ones if the Session UID is the same.
 * @param session The session to register.
 */
export function registerSession(session: ISSHSession) {
    RegisteredSessions.set(session.uid, { session, shells: new Map(), status: 'idle' });
}
