/**
 * @fileoverview WindowContentContext.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 13:13
 */

import { createContext, ReactNode, useState } from "react";
import { BasicApplicationContent }            from "@renderer/components/container/BasicApplicationContent";

export interface MenuItemProps {
    /** The name of the item */
    name?: string;

    /** The icon of the item */
    icon: ReactNode;

    /** The action to perform when the item is clicked */
    onClick: () => void;
}

/**
 * WindowContentContext
 */
export const WindowContentContext = createContext<
    {
        content: ReactNode | undefined, setContent: (_: ReactNode) => void,
    }>(
    {
        content: undefined, setContent: (_: ReactNode) => void 0,
    });

/**
 * WindowContentProvider
 * @param props
 */
export function WindowContentProvider(props: { children: ReactNode }) {
    const [ content, setContent ] = useState<ReactNode | undefined>(<BasicApplicationContent/>);

    return (
        <WindowContentContext.Provider value={{ content, setContent, }}>
            {props.children}
        </WindowContentContext.Provider>
    );
}
