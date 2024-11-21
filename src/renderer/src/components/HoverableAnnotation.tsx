/**
 * @fileoverview HoverableAnnotation.tsx
 * @author Luca Warmenhoven
 * @date Created on Monday, November 18 - 08:56
 */
import { ReactNode, RefObject, useEffect, useRef } from "react";

const edgeMargin = 10;

export function HoverableAnnotation<T extends HTMLElement>(props: {
    text: string,
    children: (ref: RefObject<T>) => ReactNode
}) {

    const hoverRef = useRef<T>(null);

    useEffect(() => {

        if ( !hoverRef.current ) return;

        const element                         = hoverRef.current;
        let pseudoElement: HTMLElement | null = null;

        const handleMouseEnter = () => {
            pseudoElement    = document.createElement('div');

            pseudoElement.classList.add('absolute', 'text-nowrap', 'animate-in', 'fade-in-10', 'duration-300', 'text-sm', 'pointer-events-none', 'bg-tertiary', 'text-primary', 'rounded-lg', 'py-1', 'px-2');
            pseudoElement.innerText = props.text;

            document.body.appendChild(pseudoElement);
            const dimensions = element.getBoundingClientRect();
            const pseudoDimensions = pseudoElement.getBoundingClientRect();

            let [ left, top ] = [
                Math.max(edgeMargin, Math.min(window.innerWidth - pseudoDimensions.width / 2 - edgeMargin * 2,  dimensions.left - pseudoDimensions.width / 2 - edgeMargin * 2)),
                dimensions.bottom + edgeMargin + dimensions.height > window.innerHeight ? dimensions.top - pseudoDimensions.height - edgeMargin : dimensions.top + edgeMargin * 2
            ];
            pseudoElement.style.top  = `${top}px`;
            pseudoElement.style.left = `${left}px`;
        }

        const handleMouseLeave = () => {
            pseudoElement?.remove();
        }

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
        }

    }, [ hoverRef ]);

    return (
        <>
            {props.children(hoverRef)}
        </>
    )
}
