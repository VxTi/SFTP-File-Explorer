/**
 * @fileoverview ActiveSession.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 10:42
 */

import { ContextMenu } from "@renderer/hooks/ContextMenu";

/**
 * ActiveSession component.
 * This component represents a single active session in the active sessions' header.
 */
export function ActiveSession(props: { displayName: string }) {

    return (
        <ContextMenu<HTMLDivElement> items={[
            { type: 'item', name: 'Close', icon: 'close', shortcut: 'Meta+W', onClick: () => console.log('Close') },
            { type: 'item', name: 'Rename', icon: 'rename', onClick: () => console.log('Rename') },
        ]}>
            {(ref) => (
                <div ref={ref}
                     className="flex flex-row justify-start items-center px-3 py-0.5 rounded-lg bg-secondary text-secondary m-1">
                    <span className="text-sm font-satoshi font-bold ml-2">{props.displayName}</span>
                </div>
            )}
        </ContextMenu>
    )
}
