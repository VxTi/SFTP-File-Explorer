/**
 * @fileoverview MenuItem.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, November 02 - 11:01
 */
import { MenuItemProps } from "@renderer/contexts/WindowContentContext";

export function MenuItemElement(props: MenuItemProps) {
    return (
        <div
            className="flex rounded-lg bg-primary flex-row justify-start my-0.5 items-center text-primary cursor-pointer hover:bg-hover duration-300 transition-colors px-1"
            onClick={props.onClick}>
            <div className="aspect-square stretch-self p-1 shrink-0">
                {props.icon}
            </div>
            {props.name ? <span className="mx-0.5 text-xs select-none shrink">{props.name}</span> : null}
        </div>
    )
}
