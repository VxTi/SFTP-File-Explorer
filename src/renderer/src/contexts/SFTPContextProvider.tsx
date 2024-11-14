/**
 * @fileoverview SFTPContextProvider.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 13:08
 */
import { IClient, IShell, ISSHSession }                                                         from "@/common/ssh-definitions";
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";

type SFTPConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface SFTPContextType {
    clients: {
        local: IClient | null,
        remote: IClient | null
    },
    status: SFTPConnectionStatus,
    setStatus: Dispatch<SetStateAction<SFTPConnectionStatus>>,
    sessionId: string | null,
    authorize: (session: ISSHSession) => void,
    createShell: () => Promise<string | null>
}

export const SFTPContext = createContext<SFTPContextType>(
    {
        authorize: () => 0,
        clients: { local: null, remote: null },
        status: 'disconnected', setStatus: () => 0,
        sessionId: null, createShell: async () => null
    });

/**
 * SFTPContextProvider
 * @param props
 * @constructor
 */
export function SFTPContextProvider(props: { children: ReactNode }) {

    const [ localClient, setLocalClient ]   = useState<IClient | null>(null);
    const [ remoteClient, setRemoteClient ] = useState<IClient | null>(null);

    const [ shells, setShells ]       = useState<IShell[]>([]);
    const [ sessionId, setSessionId ] = useState<string | null>(null);
    const [ status, setStatus ]       = useState<SFTPConnectionStatus>('disconnected');

    const [ localCwd, setLocalCwd ]   = useState<string>(window.api.fs.localHomeDir);
    const [ remoteCwd, setRemoteCwd ] = useState<string>('/');


    /**
     * Attempts to authorize a session with the given credentials
     * @param session - The session to authorize
     */
    const authorize = useCallback(async (session: ISSHSession) => {
        setStatus('connecting');
        const { error, sessionId } = await window.api.sftp.connect(session);
        if ( error || !sessionId ) {
            console.error('Failed to connect', error);
            setStatus('disconnected');
            return;
        }

        console.log('Connected to session', sessionId);
        setSessionId(sessionId);
        setStatus('connected')
    }, []);

    /**
     * Creates a new shell
     */
    const createShell: () => Promise<string | null> = useCallback(async () => {
        if ( !sessionId )
            return null;

        return await window.api.sftp.shell.create(sessionId);
    }, [ sessionId ]);

    useEffect(() => {
        if ( !sessionId ) {
            return;
        }

        setLocalClient(
            {
                cwd: localCwd,
                setCwd: setLocalCwd,
                homeDir: window.api.fs.localHomeDir,
                listFiles: window.api.fs.listFiles,
                appendFile: async (absolutePath: string, content: string) => {
                },
                rmFile: async (absolutePath: string) => {
                },
                mkdir: async (absolutePath: string) => {
                }
            })

        window.api.sftp.homeDir(sessionId)
              .then((remoteHomeDir) => {
                  setRemoteClient(
                      {
                          cwd: localCwd,
                          setCwd: setLocalCwd,
                          homeDir: window.api.fs.localHomeDir,
                          listFiles: window.api.fs.listFiles,
                          appendFile: async (absolutePath: string, content: string) => {
                          },
                          rmFile: async (absolutePath: string) => {
                          },
                          mkdir: async (absolutePath: string) => {
                          }
                      });
                  setRemoteCwd(remoteHomeDir);
              });

    }, [ localCwd, remoteCwd, sessionId, shells ]);

    return (
        <SFTPContext.Provider value={{
            clients: {
                local: localClient,
                remote: remoteClient
            },
            authorize, createShell, sessionId,
            status, setStatus
        }}>
            {props.children}
        </SFTPContext.Provider>
    );
}
