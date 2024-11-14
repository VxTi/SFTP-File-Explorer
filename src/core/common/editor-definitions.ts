/**
 * @fileoverview editor-definitions.ts
 * @author Luca Warmenhoven
 * @date Created on Tuesday, November 12 - 00:43
 */

export type FileExtension =
    'ts' | 'js' | 'c' | 'go'
    | 'html' | 'css' | 'json' | 'md'
    | 'txt' | 'xml' | 'yaml' | 'yml'
    | 'sh' | 'bat' | 'py' | 'java'
    | 'cpp' | 'h' | 'hpp' | 'cs'
    | 'rb' | 'php' | 'pl' | 'sql'
    | 'swift' | 'kt' | 'rs' | 'groovy'
    | 'gradle' | 'dockerfile' | 'properties'
    | 'ini' | 'conf' | 'env'
    | 'gitignore' | 'npmignore'
    | 'yarnignore' | 'eslintignore'
    | 'prettierignore' | 'babelrc'
    | 'eslintrc' | 'prettierrc'
    | 'tsconfig' | 'webpack'
    | 'jest' | 'babel' | 'dockerignore'
    | 'editorconfig' | 'gitattributes'
    | 'gitmodules' | string;

/**
 * The context of the editor, containing the content, path, name, extension, and last modified date of the file.
 * This is used to provide the editor with the necessary information to display the file.
 */
export interface IEditorContext {
    /** The content of the file */
    content: string;

    /** The amount of lines in the file */
    lineNumbers: number;

    /** The path of the file */
    filePath: string;

    /** The name of the file, e.g., `main` */
    fileName: string;

    /** The type of the file, e.g., `ts` */
    fileExtension: FileExtension;

    /** The last modified date of the file */
    lastModified: number;

    /** The cursor position of the editor */
    cursorPosition: ICursorPosition;
}

/**
 * The cursor position of the editor, containing the line and column number of the cursor.
 */
export interface ICursorPosition {
    /** The line number of the cursor */
    line: number;

    /** The column number of the cursor */
    column: number;
}

/**
 * The line of the editor, containing the content and number of the line.
 */
export interface IEditorLine {
    /** The content of the line */
    tokens: IEditorToken[];

    /** The line number */
    number: number;
}

/**
 * The token of the editor, containing the content and type of the token.
 */
export interface IEditorToken {
    /** The content of the token */
    content: string;

    /** The type of the token */
    type: string;
}
