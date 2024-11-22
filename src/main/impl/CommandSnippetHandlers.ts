import EVENTS              from '@/common/events.json';
import { ICommandSnippet } from '@/common/ssh-definitions';
import { app, ipcMain }    from 'electron';
import fs                  from 'fs';
import path                from 'node:path';

const snippetsPath = path.join( app.getPath( 'userData' ), 'snippets.json' );

/** Map of registered snippets, where the key represents the snippet ID */
const RegisteredSnippets: Record<string, Omit<ICommandSnippet, 'snippetId'>> = ( () => {
    const registeredSnippets: Record<string, Omit<ICommandSnippet, 'snippetId'>> = {};

    if ( !fs.existsSync( snippetsPath ) ) {
        fs.writeFileSync( snippetsPath, '{}' );
        return registeredSnippets;
    }

    const content: string = fs.readFileSync( snippetsPath, 'utf-8' );

    const parsedContent: Record<string, Omit<ICommandSnippet, 'snippetId'>> = JSON.parse( content );

    Object.entries( parsedContent )
          .forEach( ( [ key, value ] ) =>
              registeredSnippets[ key ] = value );

    return registeredSnippets;
} )();

const generateSnippetId = () => Math.random().toString( 36 ).substring( 2, 9 );

ipcMain.handle( EVENTS.SFTP.SHELL.SNIPPET.LIST, () => {
    return Object.entries( RegisteredSnippets )
                 .map( ( [ key, value ] ) => ( {
                         ...value,
                         snippetId: key
                     } as ICommandSnippet )
                 );
} );

/**
 * Handler for creating a new command snippet.
 * This handler will push the newly created snippet to the registered snippets map,
 * and emit an event to let the renderer know that there has been a change made in the
 * list.
 */
ipcMain.handle( EVENTS.SFTP.SHELL.SNIPPET.CREATE, ( event, snippet: Omit<ICommandSnippet, 'snippetId'> ) => {
    const snippetId = generateSnippetId();
    RegisteredSnippets[ snippetId ] = snippet;

    fs.writeFileSync( snippetsPath, JSON.stringify( RegisteredSnippets ) );
    console.log( RegisteredSnippets );

    event.sender.send( EVENTS.SFTP.SHELL.SNIPPET.LIST_CHANGED );
} );

/**
 * Handler for removing a snippet.
 * This is done based on the snippet ID.
 * If the snippet was removed successfully, a `LIST_CHANGED` event will be emitted.
 */
ipcMain.handle( EVENTS.SFTP.SHELL.SNIPPET.REMOVE, ( event, snippetId: string ) => {
    if ( !RegisteredSnippets[ snippetId ] )
        return;

    delete RegisteredSnippets[ snippetId ];
    fs.writeFileSync( snippetsPath, JSON.stringify( RegisteredSnippets ) );
    event.sender.send( EVENTS.SFTP.SHELL.SNIPPET.LIST_CHANGED );
} );