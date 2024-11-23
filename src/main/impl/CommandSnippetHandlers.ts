import EVENTS              from '@/common/events.json';
import { ICommandSnippet } from '@/common/ssh-definitions';
import { ipcMain }         from 'electron';
import { ConfigFile }      from '../fs/ConfigFile';

const minimumSnippetTitleLength = 3;
const CommandSnippetsConfig     = new ConfigFile<Omit<ICommandSnippet, 'snippetId'>>( { fileName: 'snippets.json' } );

ipcMain.handle( EVENTS.SFTP.SHELL.SNIPPET.LIST, () => {
    return Object.entries( CommandSnippetsConfig.value )
                 .map( ( [ key, value ] ) =>
                           ( { ...value, snippetId: key } as ICommandSnippet )
                 );
} );

/**
 * Handler for creating a new command snippet.
 * This handler will push the newly created snippet to the registered snippets map,
 * and emit an event to let the renderer know that there has been a change made in the
 * list.
 */
ipcMain.handle( EVENTS.SFTP.SHELL.SNIPPET.CREATE, ( event, snippet: Omit<ICommandSnippet, 'snippetId'> ) => {
    CommandSnippetsConfig.set( ConfigFile.randomKey(), snippet );
    event.sender.send( EVENTS.SFTP.SHELL.SNIPPET.LIST_CHANGED );
} );

/**
 * Handler for removing a snippet.
 * This is done based on the snippet ID.
 * If the snippet was removed successfully, a `LIST_CHANGED` event will be emitted.
 */
ipcMain.handle( EVENTS.SFTP.SHELL.SNIPPET.REMOVE, ( event, snippetId: string ) => {
    if ( !CommandSnippetsConfig.valueAt( snippetId ) )
        return;

    CommandSnippetsConfig.remove( snippetId );
    event.sender.send( EVENTS.SFTP.SHELL.SNIPPET.LIST_CHANGED );
} );

/**
 * Updates an existing command snippet in the config.
 */
ipcMain.handle( EVENTS.SFTP.SHELL.SNIPPET.UPDATE, ( event, snippet: ICommandSnippet ) => {
    if ( !CommandSnippetsConfig.valueAt( snippet.snippetId ) ||
         snippet.title.trim.length < minimumSnippetTitleLength ||
         snippet.command.length === 0 )
        return;

    CommandSnippetsConfig.set( snippet.snippetId, { ...snippet } as ICommandSnippet );
    event.sender.send( EVENTS.SFTP.SHELL.SNIPPET.LIST_CHANGED );
} );