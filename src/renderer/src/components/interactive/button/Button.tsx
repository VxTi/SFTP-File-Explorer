/**
 * @fileoverview Button.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 15:10
 */
import { CSSProperties, ReactNode } from 'react';

export interface ButtonProps {
    onClick?: () => void;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    disabled?: boolean;
}

/**
 * Button component
 *
 * @param props
 * @constructor
 */
export function Button(props: ButtonProps) {
    return (
        <button
            className={`px-3 py-1 text-sm bg-theme-200 transition-colors duration-300 hover:bg-hover text-primary border-[1px] border-solid border-theme-300 ${props.className}`}
            onClick={props.onClick}
            style={props.style}
            disabled={props.disabled}
        >
            {props.children}
        </button>
    );
}
