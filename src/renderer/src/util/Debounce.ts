/**
 * Debounce generator function.
 * This will return a function that will execute after `wait` amount of milliseconds.
 * If the function is called again, the timer will reset.
 * @param callback The callback function to call after the given amount of time, or immediately if no time is specified
 * @param wait The time to wait until the debounce function will be called.
 */
export function debounce( callback: ( ...args: any[] ) => any, wait?: number ) {
    let timeoutId: number | undefined;
    return ( ...args: any ) => {
        if ( timeoutId ) window.clearTimeout( timeoutId );
        timeoutId = window.setTimeout( () => {
            callback( ...args );
        }, wait );
    };
}