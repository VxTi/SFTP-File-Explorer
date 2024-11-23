import crypto                                                from 'crypto';
import { app }                                               from 'electron';
import fs                                                    from 'fs';
import { CipherGCM, CipherGCMTypes, CipherKey, DecipherGCM } from 'node:crypto';
import { join }                                              from 'path';

const configFileDirectory                 = app.getPath( 'userData' );
const encryptionAlgorithm: CipherGCMTypes = 'aes-256-gcm';

export interface ConfigFileProperties<T extends Object> {
    /** The default content of the file. If not present, the file will remain empty upon creation. */
    value?: T;

    /** The name of the file in the default folder */
    fileName: string;

    /** Whether to encrypt the file on the disk. This is useful when dealing with sensitive data. */
    encrypted?: {
        key: string;
    };
}

/**
 * Class representing a config file.
 * A system file is a file that is stored in the application's standard folder,
 * and can have a variety of properties.
 */
export class ConfigFile<T extends Object> {

    private readonly _fileName: string;
    private readonly _path: string;
    private readonly _key: CipherKey | undefined;

    /**
     * Constructor for a system file.
     * If the file doesn't exit,
     * @param config The configuration of the system file. See `SystemFileConfig`
     */
    constructor( config: ConfigFileProperties<T> ) {
        this._fileName = config.fileName;
        this._path     = join( configFileDirectory, config.fileName );
        this._key      = config.encrypted ? crypto
            .createHash( 'sha256' )
            .update( config.encrypted.key )
            .digest( 'base64' )
            .substring( 0, 32 ) : undefined;

        // If the file doesn't exist, we'll create it and fill it up with
        // the default value, if provided.
        if ( this.exists() ) {
            this._value = this.read();
            return;
        }

        this._value = config.value || {} as T;

        if ( config.value ) {
            this.write( config.value );
            return;
        }
        fs.writeFileSync( this._path, '' );
    }

    private _value: T;

    /** Getter for the currently stored value */
    public get value(): T {
        return this._value;
    }

    /** Setter for the value of this config file. This will update the config in the file system */
    public set value( value: T ) {
        this._value = value;
        this.write( value );
    }

    /**
     * Writes the given data to the file. If encryption is enabled,
     * the content will be encrypted.
     * @param data The data to write to the file.
     */
    public write( data: T ): void {
        let jsonData: string = JSON.stringify( data );
        if ( this._key !== undefined ) {
            jsonData = this._encrypt( Buffer.from( jsonData ) ).toString( 'utf-8' );
        }

        fs.writeFile( this._path, jsonData, ( error ) => {
            if ( error ) throw error;
        } );
    }

    /**
     * Reads the content of the file, and attempts to return it in
     * the provided type T.
     * @returns The content of the file as type T
     * @throws Error If the file doesn't exist, or if an IO exception occurred.
     */
    public read(): T {
        if ( !this.exists() )
            throw new Error( 'Attempting to read file content of non-existent file.' );

        const fileContentBuffer: Buffer = fs.readFileSync( this._path );
        let stringContent: string       = (
            this._key !== undefined ? this._decrypt( fileContentBuffer ) : fileContentBuffer
        ).toString( 'utf8' );

        return JSON.parse( stringContent ) as T;
    }

    /**
     * Checks whether the given file exists.
     */
    public exists(): boolean {
        return fs.existsSync( this._fileName );
    }

    /**
     * Encrypts the given data buffer.
     * @private
     * @param nonEncryptedBuffer The non-encrypted data to encrypt.
     */
    private _encrypt( nonEncryptedBuffer: Buffer ): Buffer {
        if ( !this._key )
            return nonEncryptedBuffer;

        const initializationVector: Buffer = crypto.randomBytes( 16 );
        const cipher: CipherGCM            = crypto.createCipheriv( encryptionAlgorithm, this._key, initializationVector );
        return Buffer.concat( [ initializationVector, cipher.update( nonEncryptedBuffer ), cipher.final() ] );
    }

    /**
     * Decrypts the given buffer with the provided key in the constructor.
     * @param encryptedBuffer The buffer to decrypt.
     * @private
     */
    private _decrypt( encryptedBuffer: Buffer ): Buffer {
        if ( !this._key )
            return encryptedBuffer;

        const initializationVector: Buffer = encryptedBuffer.subarray( 0, 16 );
        const encryptedSub: Buffer         = encryptedBuffer.subarray( 16 );
        const decipher: DecipherGCM        = crypto.createDecipheriv( encryptionAlgorithm, this._key, initializationVector );
        return Buffer.concat( [ decipher.update( encryptedSub ), decipher.final() ] );
    }
}