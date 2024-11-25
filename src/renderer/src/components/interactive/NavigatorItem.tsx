/**
 * @fileoverview MenuItem.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, November 02 - 11:01
 */
import { HoverableAnnotation } from '@renderer/components/HoverableAnnotation';
import { ReactNode }           from 'react';

export interface MenuItemProps {
    /** The name of the item */
    name?: string;

    /** The icon of the item */
    icon: ReactNode;

    /** The action to perform when the item is clicked */
    onClick: () => void;
}

export function NavigatorItem( props: MenuItemProps ) {
    return (
        <HoverableAnnotation<HTMLDivElement> text={props.name || ''}>
            {(ref) => (
                <div
                    ref={ref}
                    className="flex rounded-md bg-primary flex-row justify-start my-0.5 items-center text-primary cursor-pointer hover:bg-hover active:bg-tertiary duration-300 transition-colors px-1"
                    onClick={props.onClick}>
                    <div className="aspect-square stretch-self p-1 shrink-0">
                        {props.icon}
                    </div>
                </div>
            )}
        </HoverableAnnotation>
    )
}
