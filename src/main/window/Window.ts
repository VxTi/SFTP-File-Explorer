/**
 * @fileoverview Window.ts
 * @author Luca Warmenhoven
 * @date Created on Monday, November 11 - 15:17
 */
import { BrowserWindow, BrowserWindowConstructorOptions, shell } from "electron";

/**
 * WindowContext interface
 * This interface contains the window instance and a unique identifier.
 */
export interface WindowContext {

    /** BrowserWindow instance */
    window: BrowserWindow,

    /** Unique identifier for the window */
    uid: string
}


/**
 * Default configuration object for BrowserWindow instances.
 */
export const DefaultWindowConfig: BrowserWindowConstructorOptions = {
    width: 900,
    height: 670,
    minWidth: 900,
    minHeight: 670,
    show: false,
    transparent: process.platform === 'darwin',
    autoHideMenuBar: true,
    titleBarOverlay: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#08080880',
    webPreferences: {
        sandbox: false,
        contextIsolation: true
    }
};

const windowRegistry: Map<string, WindowContext> = new Map();

/**
 * Create a new window instance.
 * This function will create a new BrowserWindow instance and return a WindowContext object.
 * The `WindowContext` object contains the window instance and a unique identifier, and other metadata.
 * @param windowUid Unique identifier for the window
 * @param docPath Path to the document to load in the window
 * @param config Configuration object for the BrowserWindow instance
 */
export function createWindow(windowUid: string, docPath: string, config: BrowserWindowConstructorOptions): WindowContext {

    if ( windowRegistry.has(windowUid) ) {
        console.warn(`Window with uid ${windowUid} already exists.`);
        return windowRegistry.get(windowUid)!;
    }

    const entry = {
        window: new BrowserWindow(config),
        uid: windowUid
    };

    if ( process.platform === 'darwin' ) {
        entry.window.setWindowButtonVisibility(true);
    }

    entry.window.on('ready-to-show', () => {
        entry.window.show()
    })

    entry.window.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    windowRegistry.set(entry.uid, entry);
    return entry;
}

/**
 * Destroy a window instance.
 * This function will destroy the window instance and remove it from the window registry.
 * @param ctx WindowContext object
 */
export function destroyWindow(ctx: WindowContext): void {
    if ( !ctx.window.isDestroyed() )
        ctx.window.destroy();
    windowRegistry.delete(ctx.uid);
}
