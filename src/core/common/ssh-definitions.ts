/**
 * @fileoverview ssh-definitions.ts
 * @author Luca Warmenhoven
 * @date Created on Tuesday, November 12 - 12:11
 */

import { IFileEntry } from "@/common/file-information";


export type TConnectionStatus = 'connected' | 'idle';
export type TShellMessageTarget = 'stderr' | 'stdio';

/**
 * Represents a shell message.
 */
export interface IShellMessage {

    /** The unique shell ID for the message */
    shellId: string;

    /** The target of the message. */
    target: TShellMessageTarget,

    /** The message content. */
    message: string,
}

/**
 * Represents a shell session.
 */
export interface IShellSession {

    /** The shell stream. */
    exec: (command: string) => void;

    /** The content of the session. */
    sessionContent: string;
}

/**
 * SFTP explorer context
 */
export interface ISFTPContext {

    /** Local client instance */
    localClient: IClient;

    /** Remote client instance */
    remoteClient: IClient;

    /** The SSH session ID. This can be used to refer to internal data in `RegisteredSessions` */
    sessionId: string;

    /** The Shell sessions that are active in this SSH session */
    shells: IShell[];
}

/**
 * SFTP client interface.
 * This is an instance of either the local or remote file system.
 */
export interface IClient {

    /** The current working directory of the client */
    readonly cwd: string;

    /** Sets the current working directory of the client */
    setCwd: (cwd: string) => void;

    /**
     * Returns a list of files in the specified path
     * @param parentDirectoryPath The path to the directory to list the files of
     */
    listFiles: (parentDirectoryPath: string) => Promise<IFileEntry[]>;

    /**
     * Appends a file to the specified path
     * @param absolutePath The absolute path to the file to append to, e.g. `/home/user/file.txt`
     * @param content The content to append to the file
     */
    appendFile: (absolutePath: string, content: string) => Promise<void>;

    /**
     *  Removes a file from the specified path
     *  @param absolutePath The absolute path to the file to remove, e.g. `/home/user/file.txt`
     */
    rmFile: (absolutePath: string) => Promise<void>;

    /**
     * Creates a directory in the specified path
     * @param absolutePath The absolute path to create the directory in,
     * including the directory name, e.g. `/home/user/new-directory`
     */
    mkdir: (absolutePath: string) => Promise<void>;

    /**
     * The home directory of the client
     */
    homeDir: string;
}

/**
 * Shell interface
 */
export interface IShell {

    /** The shell ID */
    shellID: string;

    /** The output of the shell */
    stdout: string;

    /** Execute a command on the remote shell  */
    exec: (command: string) => Promise<string>;

    /** Error handler */
    onError?: (error: Error | string) => void;
}

/**
 * SSH Session Safe interface.
 * This interface houses information regarding SSH sessions that are safe to store.
 * This interface differs from the `ISSHSession` interface in that it does not contain sensitive information,
 * and thus can be shared to the renderer process.
 */
export interface ISSHSessionSafe {
    /** The unique identifier of the session */
    sessionId: string;

    /** The username to connect with */
    username: string;

    /** The host address to connect to */
    hostAddress: string;

    /** The port to connect to */
    port: number;

    /** Whether the session requires fingerprint verification */
    requiresFingerprintVerification?: boolean;

    /** The alias to connect with */
    alias?: string;
}

/**
 * SSH Session interface.
 * This interface houses information regarding SSH sessions.
 */
export interface ISSHSession {

    /**
     * The unique identifier of the session
     */
    readonly uid: string;

    /**
     * The host address to connect to
     */
    readonly hostAddress: string;

    /**
     * The username to connect with
     */
    readonly username: string;

    /**
     * The password to connect with (optional)
     */
    readonly password?: string;

    /**
     * The private key to connect with (optional)
     */
    readonly privateKey?: string;

    /**
     * The passphrase for the private key (optional)
     */
    readonly passphrase?: string;

    /**
     * The fingerprint of the host to connect to (optional, only available on macOS)
     */
    requiresFingerprintVerification?: boolean;

    /**
     * The port to connect to. Default is 22
     */
    readonly port?: number;

    /**
     * The alias to connect with. Default is the host address
     */
    alias?: string;
}
