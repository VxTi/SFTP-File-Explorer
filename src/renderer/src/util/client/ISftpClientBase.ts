import { IFile, IFileEntry } from '@/common/file-information';

/**
 * Abstract Client definition.
 * This class is the base abstraction for a client.
 * A client can have a connection with another client,
 * transfer files, etc.
 */
export class ISftpClientBase {

    /**
     * Creates a file on the file system
     * @param path The path to the file to create
     * @param content The content of the file.
     */
    // @ts-ignore
    public async putFile( path: string, content: string ): Promise<void> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Method for getting a file from the client's file system
     * @param path The path to retrieve the file from
     * @returns A promise containing the retrieved file data, or undefined
     * if the file doesn't exist, or if you don't have the required permissions.
     */
    // @ts-ignore
    public async getFile( path: string ): Promise<IFile | undefined> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Method for renaming a file on the client's file system
     * @param absolutePath The absolute path to the file, including its name
     * @param newName The new name for the file.
     */
    // @ts-ignore
    public async renameFile( absolutePath: string, newName: string ): Promise<void> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Removes a file from the client's file system
     * @param absolutePath The path to remove the file from
     */
    // @ts-ignore
    public async rmFile( absolutePath: string ): Promise<void> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Method for creating a symbolic link (shortcut) on the client's
     * file system.
     * @param absolutePath The absolute path to create the symbolic link at
     */
    // @ts-ignore
    public async putSymLink( absolutePath: string ): Promise<void> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Method for creating a directory at the given pa th
     * @param absolutePath The path to create the directory at.
     */
    // @ts-ignore
    public async mkdir( absolutePath: string ): Promise<void> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Method for recursively adding a directory from one file system to another.
     * @param absolutePath
     */
    // @ts-ignore
    public async putDirectory( absolutePath: string ): Promise<void> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Method for listing all the files in the given path.
     * @param absolutePath The path to list the files in. If left absent,
     * the last registered `cwd` is used.
     * @returns The files in the provided directory's path.
     */
    // @ts-ignore
    public async listFiles( absolutePath?: string ): Promise<IFileEntry[] | undefined> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Returns the home directory of the file system
     */
    public async homeDirectory(): Promise<string> {
        throw new Error( 'Method not implemented.' );
    }

    /**
     * Executes a command on the remote file system
     * @param command The command to execute
     * @param cwd The current working directory of the command. If left empty, the last registered working directory
     * will be used.
     * @returns A promise containing the return status of the executed command.
     */
    // @ts-ignore
    public async exec( command: string, cwd?: string ): Promise<number> {
        throw new Error( 'Method not implemented.' );
    }

}