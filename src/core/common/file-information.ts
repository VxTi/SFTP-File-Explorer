/**
 * @fileoverview file-information.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 12:01
 */

export type IFileType = 'file' | 'directory' | 'symlink' | 'block-device' | 'character-device';

/**
 * This interface contains information about a file,
 * either on the local or remote file system.
 */
export interface IFileInfo {

    /** Type of the file */
    type: IFileType;

    /** Unique identifier of the file */
    dev: number;

    /** Inode number of the file */
    ino: number;

    /** File permissions */
    mode: number;

    /** Number of hard links to the file */
    nlink: number;

    /** User ID of the file owner */
    uid: number;

    /** Group ID of the file owner */
    gid: number;

    /** Device ID (if the file is a character or block device */
    rdev: number;

    /** Size of the file in bytes */
    size: number;

    /** Block size of the file, e.g. 4096 */
    blksize: number;

    /** Number of blocks allocated to the file */
    blocks: number;

    /** Last access time */
    lastAccessTimeMs: number;

    /** Last modification time */
    lastModifiedTimeMs: number;

    /** File creation time */
    creationTimeMs: number;
}

/**
 * FileInformation
 * @interface
 */
export interface IFileEntry extends IFileInfo {

    /** Name of the file */
    name: string;

    /** Path of the file, excluding the name */
    path: string;

}
