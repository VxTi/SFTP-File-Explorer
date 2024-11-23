import { EVENTS, InternalError } from '@/common/app';
import { ipcMain }               from 'electron';

/**
 * Emits an error to the Renderer process, with a title and a description.
 * @param error The error object associated with the occurred error, containing a title and description.
 */
export function emitError( error: InternalError ) {
    ipcMain.emit( EVENTS.MESSAGES.INTERNAL_ERROR, error );
}