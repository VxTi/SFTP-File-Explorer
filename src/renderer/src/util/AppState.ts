/**
 * @fileoverview AppState.ts
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 17 - 17:48
 */

export type TScreenType = 'explorer' | 'editor';

export interface IAppState {

    /** The current screen of the application */
    screen: TScreenType;

    /** The screen props of the current screen */
    screenProps: any;

    /** The current working directory of the local client */
    localCwd: string;

    /** The current working directory of the remote client */
    remoteCwd: string;

    /** The session ID of the current session */
    sessionId: string;
}
