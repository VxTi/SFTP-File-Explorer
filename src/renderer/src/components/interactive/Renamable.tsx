/**
 * @fileoverview Renamable.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 10 - 15:03
 */
import { useState } from "react";

/**
 * Renamable component
 * This component allows the user to rename a value by double clicking on it
 * @param {any & { onRename?: (value: string) => void; initialValue?: string; className?: string }} props
 */
export function Renamable(props: any) {

    const [ isRenaming, setIsRenaming ] = useState<boolean>(false);
    const [ value, setValue ] = useState<string>(props.initialValue ?? '');

    return (
        <div className={``} onDoubleClick={() => {
            setIsRenaming(true);
        }}>
            {isRenaming ? (
                <input
                    autoFocus={true}
                    type="text"
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setIsRenaming(false);
                            if ( value.trim().length === 0 ) {
                                setValue(props.initialValue ?? '');
                                return;
                            }
                            props.onRename?.(value);
                        }
                    }}
                    onBlur={(e) => {
                        setIsRenaming(false);
                        props.onRename?.(e.target.value);
                    }}
                    className={`bg-transparent outline-none min-w-0 w-min appearance-none border-none ${props.className ?? ''}`}
                    value={value}
                />) : (
                 <div className={props.className ?? ''} onClick={props.onClick}>{value}</div>
             )}
        </div>
    );
}
