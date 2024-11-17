/**
 * @fileoverview AppState.ts
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 17 - 17:48
 */ import { ComponentType } from "react";

export interface IScreen<T> {
    uid: string;
    name: string;
    component: ComponentType<T>;
}

const RegisteredApplicationScreens: Map<string, IScreen<any>> = new Map();

/**
 * Register a screen type to the application.
 * If a screen with the same UID already exists, an error will be thrown.
 * @param screen The screen to register
 */
export function registerScreenType<T>(screen: IScreen<T>) {
    if ( RegisteredApplicationScreens.has(screen.uid) )
        throw new Error(`Screen with UID ${screen.uid} already exists`);

    RegisteredApplicationScreens.set(screen.uid, screen);
}

/**
 * Application state interface.
 * This interface represents the state of the application, and can be used
 * to store and restore the state of the application.
 */
export interface IAppState<T> {

    /** The current screen of the application */
    screen: IScreen<T>;

    /** The current working directory of the local client */
    localCwd: string;

    /** The current working directory of the remote client */
    remoteCwd: string;

    /** The session ID of the current session */
    sessionId: string;
}
