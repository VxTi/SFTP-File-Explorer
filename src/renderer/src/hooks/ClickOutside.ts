/**
 * @fileoverview ClickOutside.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 13:02
 */
import { RefObject, useEffect } from "react";

/**
 * Hook to detect clicks outside a ref.
 * @param ref The ref to detect clicks outside.
 * @param callback The callback to call when a click outside is detected.
 * @param deps The dependencies for the hook.
 */
export function useClickOutside<T extends HTMLElement>(ref: RefObject<T>, callback: () => void, ...deps: any[]) {
    useEffect(() => {

        if ( !ref.current )
            return;


        function handleClickOutside(event: MouseEvent) {
            if ( !ref.current )
                return;

            const dimensions = ref.current.getBoundingClientRect();

            if ( ref.current && (
                event.clientX < dimensions.left ||
                event.clientX > dimensions.right ||
                event.clientY < dimensions.top ||
                event.clientY > dimensions.bottom
            ) ) {
                callback();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ ref, callback, ...deps ]);
}
