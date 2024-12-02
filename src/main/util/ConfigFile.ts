import { app }                                                                   from 'electron';
import fs                                                                        from 'fs';
import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'node:crypto';
import { join }                                                                  from 'path';

const configFileDirectory: string = app.getPath( 'userData' );
const algorithm: string           = 'aes-256-cbc';
const keyLength: number           = 32;

type ConfigValue<T> = Record<string, T>;

export interface ConfigFileProperties {
    /** The name of the file in the default folder */
    fileName: string;

    /** Whether to encrypt the file on the disk. This is useful when dealing with sensitive data. */
    encryption?: {
        key: string;
    };
}

/**
 * Class representing a config file.
 * A system file is a file that is stored in the application's standard folder,
 * and can have a variety of properties.
 */
export class ConfigFile<T> {

    private readonly _path: string;
    private readonly _passphrase: string | undefined;

    /**
     * Constructor for a system file.
     * If the file doesn't exit,
     * @param config The configuration of the system file. See `SystemFileConfig`
     */
    constructor( config: ConfigFileProperties ) {
        this._path       = join( configFileDirectory, config.fileName );
        this._passphrase = config.encryption ? createHash( 'sha256' )
            .update( config.encryption.key )
            .digest( 'base64' )
            .substring( 0, keyLength ) : undefined;

        // If the file doesn't exist, we'll create it and fill it up with
        // the default value, if provided.
        if ( this.exists() ) {
            this._value = this.read();
            return;
        }

        this._value = {};
        this.write( this._value );
    }

    private _value: ConfigValue<T>;

    /** Getter for the currently stored value */
    public get value(): ConfigValue<T> {
        return this._value;
    }

    /** Setter for the value of this config file. This will update the config in the file system */
    public set value( value: ConfigValue<T> ) {
        this._value = value;
        this.write( value );
    }

    /**
     * Returns a random UUID key to map data to.
     */
    public static randomKey(): string {
        return crypto.randomUUID();
    }

    /**
     * Returns the value associated with the provided key, or undefined if
     * the entry doesn't exist.
     * @param key The key to find.
     * @returns The value of the key, or undefined.
     */
    public valueAt( key: string ): T | undefined {
        return this._value[ key ];
    }

    /**
     * Removes an entry from `value`, if `key` exists.
     * If the deletion was successful, the file on the file system will be updated.
     * @param key The key of the entry to delete.
     */
    public remove( key: string ): void {
        if ( this._value[ key ] ) {
            delete this._value[ key ];
            this.write( this._value );
        }
    }

    /**
     * Inserts the given entry into the values record, and updates the file
     * in the file system accordingly.
     * @param key The key to the entry to update
     * @param value The value of the entry.
     */
    public set( key: string, value: T ): void {
        if ( this._value[ key ] ) {
            delete this._value[ key ];
        }
        this._value[ key ] = value;
        this.write( this._value );
    }

    /**
     * Writes the given data to the file. If encryption is enabled,
     * the content will be encrypted.
     * @param data The data to write to the file.
     */
    public write( data: ConfigValue<T> ): void {
        let jsonData: string = JSON.stringify( data );
        if ( this._passphrase !== undefined ) {
            jsonData = this._encrypt( jsonData );
        }

        fs.writeFileSync( this._path, jsonData, 'utf-8' );
    }

    /**
     * Reads the content of the file, and attempts to return it in
     * the provided type T.
     * @returns The content of the file as type T
     * @throws Error If the file doesn't exist, or if an IO exception occurred.
     */
    public read(): ConfigValue<T> {
        if ( !this.exists() )
            throw new Error( 'Attempting to read file content of non-existent file.' );

        const fileContentBuffer: string = fs.readFileSync( this._path, 'utf-8' );
        let stringContent: string       = this._passphrase !== undefined ? this._decrypt( fileContentBuffer ) : fileContentBuffer;

        return JSON.parse( stringContent ) as ConfigValue<T>;
    }

    /**
     * Checks whether the given file exists.
     */
    public exists(): boolean {
        return fs.existsSync( this._path );
    }

    /**
     * Encrypts the given data buffer.
     * @private
     * @param nonEncryptedBuffer The non-encrypted data to encrypt.
     */
    private _encrypt( data: string ): string {
        if ( !this._passphrase ) return data;

        const salt = randomBytes( 16 );
        const iv   = randomBytes( 16 );
        const key  = scryptSync( this._passphrase, salt, keyLength );

        const cipher  = createCipheriv( algorithm, key, iv );
        let encrypted = cipher.update( data, 'utf8', 'hex' );
        encrypted += cipher.final( 'hex' );

        return salt.toString( 'hex' ) + iv.toString( 'hex' ) + encrypted;
    }

    /**
     * Decrypts the given buffer with the provided key in the constructor.
     * @param data The buffer to decrypt.
     * @private
     */
    private _decrypt( encryptedData: string ): string {
        if ( !this._passphrase ) return encryptedData;

        try {
            const salt      = Buffer.from( encryptedData.slice( 0, 32 ), 'hex' );
            const iv        = Buffer.from( encryptedData.slice( 32, 64 ), 'hex' );
            const encrypted = encryptedData.slice( 64 );

            const key = scryptSync( this._passphrase, salt, keyLength );

            const decipher = createDecipheriv( algorithm, key, iv );
            let decrypted  = decipher.update( encrypted, 'hex', 'utf8' );
            decrypted += decipher.final( 'utf8' );

            return decrypted;
        } catch ( error ) {
            console.error( 'Decryption failed:', error );
            throw new Error( 'Failed to decrypt data. The file may be corrupted or the passphrase may be incorrect.' );
        }
    }
}