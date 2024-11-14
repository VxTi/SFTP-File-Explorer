/**
 * @fileoverview ResizeHook.tsx
 * @author Luca Warmenhoven
 * @date Created on Tuesday, November 05 - 21:00
 */
import { RefObject, useEffect, useRef } from "react";

type ResizeDirection = 'horizontal' | 'vertical';

export interface ResizeHookConfig {
    initialOffset?: number;

    /**
     * A ref referring to the target container that's supposed
     * to be resized.
     */
    targetElementRef: RefObject<HTMLElement>

    /**
     * The direction in which the element is supposed to be resized.
     */
    direction: ResizeDirection;

    /**
     * The minimum size the element is allowed to have.
     */
    minSize?: number;

    /**
     * The maximum size the element is allowed to have.
     */
    maxSize?: number;

    /**
     * The initial size of the element.
     */
    size?: number;

    /**
     * Mouse offset margin.
     * This number determines by how many pixels aside the element is still resizable.
     */
    margin?: number;
}

const PropertyTable: Record<ResizeDirection, any> = {
    'horizontal': {
        minSizeProperty: 'minWidth',
        maxSizeProperty: 'maxWidth',
        mouseProperty: 'clientX',
        dimensionProperty: 'width',
        cursor: 'col-resize',
        scalar: -1
    },
    'vertical': {
        minSizeProperty: 'minHeight',
        maxSizeProperty: 'maxHeight',
        mouseProperty: 'clientY',
        dimensionProperty: 'height',
        cursor: 'row-resize',
        scalar: 1
    }
}

/**
 * Resize hook.
 * This custom React hook allows you to resize any element.
 * The function returns a resize bar
 * @param config
 */
export function useResizeHook(config: ResizeHookConfig) {

    const resizeBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if ( !config.targetElementRef.current || !resizeBarRef.current )
            return;

        const offsetMargin  = config.margin ?? 5;
        const initialOffset = config.initialOffset ?? 0;

        const properties = PropertyTable[ config.direction ];

        const minSize = (config.minSize ?? parseInt(window.getComputedStyle(config.targetElementRef.current)[ properties.minSizeProperty ], 10)) || 0;
        const maxSize = (config.maxSize ?? parseInt(window.getComputedStyle(config.targetElementRef.current)[ properties.maxSizeProperty ], 10)) || Number.MAX_SAFE_INTEGER;

        config.targetElementRef.current.style[ properties.minSizeProperty ] = `${minSize}px`;
        config.targetElementRef.current.style[ properties.maxSizeProperty ] = config.size ? `${config.size}px` : `${maxSize}px`;
        if ( config.size )
            config.targetElementRef.current.style[ properties.minSizeProperty ] = `${config.size}px`;

        const handleMouseDown = (event: MouseEvent) => {

            const initialDimensions: DOMRect = config.targetElementRef.current!.getBoundingClientRect();

            console.log(initialDimensions, properties);

            const initialMousePosition = event[ properties.mouseProperty ];

            if (
                (config.direction === 'vertical' &&
                    (
                        initialMousePosition < initialDimensions.top - offsetMargin ||
                        initialMousePosition > initialDimensions.bottom + offsetMargin
                    )
                ) || (
                    initialMousePosition < initialDimensions.left - offsetMargin ||
                    initialMousePosition > initialDimensions.right + offsetMargin
                )
            )
                return;

            resizeBarRef.current!.style.filter = 'brightness(125%)';

            window.document.documentElement.style.cursor     = properties.cursor;
            window.document.documentElement.style.userSelect = 'none';

            const handleMouseMove = (moveEvent: any) => {
                const dS      = initialMousePosition - moveEvent[ properties.mouseProperty ];
                const newSize = Math.max(
                    minSize,
                    Math.min(maxSize, initialDimensions[ properties.dimensionProperty ] + properties.scalar * dS + initialOffset)
                );

                config.targetElementRef.current!.style[ properties.minSizeProperty ] = `${newSize}px`;
            }

            const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                window.document.documentElement.style.cursor     = 'auto';
                resizeBarRef.current!.style.filter               = 'none';
                window.document.documentElement.style.userSelect = 'auto';
            }
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        window.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        }

    }, [ config, resizeBarRef ]);

    return (
        <div
            ref={resizeBarRef}
            style={{
                cursor: config.direction === 'vertical' ? 'row-resize' : 'col-resize'
            }}
            className={
                (config.direction === 'vertical' ?
                 "w-full min-w-full min-h-[1px] h-[1px]" : "h-full w-[1px]") + " bg-border" +
                " hover:brightness-110 transition-all duration-100"}>
        </div>
    )
}
