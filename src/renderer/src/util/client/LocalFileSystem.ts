import { IFile, IFileEntry } from '@/common/file-information';
import { ISftpClientBase }   from '@renderer/util/client/ISftpClientBase';

/**
 *
 */
export class LocalFileSystem extends ISftpClientBase {

    public async getFile( path: string ): Promise<IFile | undefined> {

    }

    public async putFile( path: string, content: string ): Promise<void> {
        window.api.fs.putFile( path, content );
    }

    public homeDirectory(): Promise<string> {
        return Promise.resolve( window.api.fs.localHomeDir );
    }

    public identity(): 'unknown' | string {
        return 'local';
    }

    public async listFiles( cwd?: string ): Promise<IFileEntry[] | undefined> {
        return window.api.fs.listFiles( cwd || this._cwd );
    }

    public async renameFile( absolutePath: string, newName: string ): Promise<void> {

    }

    public async rmFile( absolutePath: string ): Promise<void> {

    }

    public async putSymLink( absolutePath: string ): Promise<void> {

    }

    public async mkdir( absolutePath: string ): Promise<void> {

    }

    public async putDirectory( absolutePath: string ): Promise<void> {

    }

    public async exec( command: string, cwd?: string ): Promise<number> {

    }
}