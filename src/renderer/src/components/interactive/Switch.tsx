/**
 * @fileoverview Switch.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 15:15
 */

import { CSSProperties, useState } from "react";

export interface SwitchProps {
    onClick?: (newState: boolean) => void;
    children?: string;
    className?: string;
    style?: CSSProperties;
    disabled?: boolean;
    checked?: boolean;
    description?: string;
}

/**
 * Switch component
 *
 * @param props
 * @constructor
 */
export function Switch(props: SwitchProps) {
    const [ state, setState ] = useState<boolean>(props.checked ?? false);

    return (
        <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer"
                   onChange={(event) => {
                       setState(event.target.checked);
                       props.onClick?.(event.target.checked);
                   }} checked={state}/>
            <div
                className="relative w-11 h-6 bg-secondary rounded-full peer peer-focus:ring-2 peer-focus:ring-special peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:border after:border-transparent after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-special after:rounded-full after:h-5 after:w-5 after:transition-all" />
            {props.description && ( <span className="text-sm text-secondary ml-2">{props.description}</span> )}
        </label>
    )
}
