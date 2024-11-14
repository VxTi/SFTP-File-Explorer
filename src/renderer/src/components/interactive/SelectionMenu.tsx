/**
 * @fileoverview SelectionMenu.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 12:19
 */

import { ChevronsUpDownIcon } from "lucide-react";
import { useRef, useState }   from "react";
import { useClickOutside }    from "@renderer/hooks/ClickOutside";

/**
 * Selection Menu Option interface.
 * This interface represents an option for the SelectionMenu component.
 */
export interface ISelectionMenuOption {
    title: string;
    value: string;
}

/**
 * SelectionMenuProps interface.
 * This interface represents the props for the SelectionMenu component.
 */
export interface ISelectionMenuProps {
    title: string;
    options: ISelectionMenuOption[];
    onSelect: (entry: ISelectionMenuOption) => void;
}

export function SelectionMenu(props: ISelectionMenuProps) {

    const [ selectedIdx, setSelectedIdx ] = useState<number>(0);
    const [ expanded, setExpanded ]       = useState<boolean>(false);
    const containerRef                    = useRef<HTMLDivElement>(null);
    useClickOutside(containerRef, () => setExpanded(false), expanded);

    return (
        <div
            className="relative flex flex-row justify-start items-center gap-3 bg-hover rounded-lg py-1 px-2 border-[1px] border-secondary text-primary"
            onClick={() => setExpanded( !expanded)}>
            <span>{props.title}</span>
            <div className="h-full w-full">
                {!expanded ? (props.options[ selectedIdx ].title) :
                 <div
                     className="absolute flex flex-col rounded-lg min-w-36 left-0 top-0 w-full border-solid border-[1px] border-primary bg-hover"
                     ref={containerRef}>
                     {
                         expanded && props.options.map((option, i) => (
                             <SelectionMenuOption
                                 key={i}
                                 isSelected={i === selectedIdx}
                                 title={option.title}
                                 onSelect={() => {
                                     props.onSelect(option);
                                     setSelectedIdx(i);
                                 }}/>
                         ))
                     }
                 </div>
                }
            </div>
            <ChevronsUpDownIcon size={16} className="shrink-0"/>
        </div>
    )
}

function SelectionMenuOption(props: { title: string, onSelect: () => void, isSelected: boolean }) {
    return (
        <div
            className={`hover:bg-tertiary cursor-pointer px-3 py-1 w-full rounded-lg text-primary ${props.isSelected ? 'bg-hover' : ''}`}
            onClick={props.onSelect}>
            {props.title}
        </div>
    )
}
