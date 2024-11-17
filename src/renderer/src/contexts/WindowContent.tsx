/**
 * @fileoverview WindowContent.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 13:13
 */

import { createContext, ReactNode, useState } from "react";
import { BasicApplicationContent }            from "@renderer/components/container/BasicApplicationContent";

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
