/**
 * @fileoverview ResizableContainer.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 07 - 15:42
 */
import { CSSProperties, ReactNode, useEffect, useRef } from "react";
import { GripHorizontalIcon, GripVerticalIcon }        from "lucide-react";

export interface ResizableContainerProps {
    children: ReactNode;
    style?: CSSProperties;
    className?: string;
}

type ResizeDirection = 'horizontal' | 'vertical';

type ResizeSide = 'left' | 'right' | 'top' | 'bottom';

export interface ResizeConfig {

    /**
     * The sides that are supposed to be resizable.
     */
    sides: ResizeSide[];

    /**
     * The direction in which the element is supposed to be resized.
     */
    direction: ResizeDirection;

    /**
     * The minimum size the element is allowed to have.
     */
    min?: number;

    /**
     * The maximum size the element is allowed to have.
     */
    max?: number;

    /**
     * The initial size of the element.
     */
    size?: number;

    /**
     * Mouse offset margin.
     * This number determines by how many pixels aside the element is still resizable.
     */
    margin?: number;

    /**
     * Whether the element is resizable.
     * This defaults to true, and can be used by parent components to disable resizing.
     */
    resizable?: boolean;

    /**
     * Callback function that is called when the element is resized.
     */
    onResize?: (size: number) => void;

    /**
     * Callback function that is called when the element is about to be resized.
     * @param size The size the element is about to be resized to
     */
    onResizeStart?: (size: number) => void;

    /**
     * Callback function that is called when the element has been resized.
     * @param size The size the element has been resized to
     */
    onResizeEnd?: (size: number) => void;
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

const ResizeSideStyles: Record<ResizeSide, any> = {
    'left': [ 'left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-3.5', <GripVerticalIcon size={10}/> ],
    'right': [ 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-3.5', <GripVerticalIcon size={10}/> ],
    'top': [ 'top-0 left-1/2 w-3.5 h-2.5 -translate-x-1/2 -translate-y-1/2', <GripHorizontalIcon size={10}/> ],
    'bottom': [ 'top-full left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-2.5', <GripHorizontalIcon size={10}/> ]
}

/**
 * Brighten a color by a certain amount
 * @param color The color to brighten
 * @param amount The amount to brighten the color by
 */
const brightenColor = (color: string, amount: number) => {
    let rgb = color.match(/\d+/g)!.map(Number);
    amount  = Math.max(-255, Math.min(255, amount));
    rgb     = rgb.map((c) => Math.max(0, Math.min(255, c + amount)));
    return `rgb(${rgb[ 0 ]}, ${rgb[ 1 ]}, ${rgb[ 2 ]})`;
}

/**
 * The ResizeGrip component
 * This component is a grip that is used to resize the container,
 * and is placed on the sides of the container.
 */
const ResizeGrip = (props: { className: string, children: ReactNode }) => (
    <div
        className={`flex justify-center pointer-events-none overflow-visible items-center border-[1px] z-10 border-solid border-primary absolute bg-primary rounded-lg ${props.className}`}>
        {props.children}
    </div>
);

/**
 * ResizableContainer component
 * This component is a container that can be resized by dragging a bar
 * @param props The properties of the ResizableContainer, as defined by the ResizableContainerProps interface
 */
export function ResizableContainer(props: ResizableContainerProps & ResizeConfig) {

    const containerRef = useRef<HTMLDivElement>(null);
    const elementSize  = useRef<number | null>(null);

    const canResize = props.resizable ?? true;

    useEffect(() => {

        if ( !containerRef.current )
            return;

        if ( props.sides.length === 0 ) {
            console.error('No sides specified for resizable container');
            return;
        }


        for ( const side of props.sides ) {
            containerRef.current.style[ 'border' + (side.charAt(0).toUpperCase() + side.slice(1)) + 'Style' ] = 'solid';
        }

        // Update the size of the element if an initial size is provided
        if ( !elementSize.current && props.size ) {
            elementSize.current                                                            = props.size;
            containerRef.current.style[ PropertyTable[ props.direction ].minSizeProperty ] = props.size + 'px';
            containerRef.current.style[ PropertyTable[ props.direction ].maxSizeProperty ] = props.size + 'px';
        }

        const margin = props.margin ?? 10;

        /**
         * Handles the mouse down event
         * This function is called when the user presses the mouse button
         */
        const handleMouseDown = (moveEvent: MouseEvent) => {

            if ( !containerRef.current || !canResize )
                return;

            const elementDimensions = containerRef.current!.getBoundingClientRect();

            // Check whether the mouse is within the margin of the element
            // with respect to the given resize sides
            for ( let side of props.sides ) {
                const mouseAxis = side === 'left' || side === 'right' ? 'clientX' : 'clientY';
                if ( moveEvent[ mouseAxis ] < elementDimensions[ side ] - margin || moveEvent[ mouseAxis ] > elementDimensions[ side ] + margin )
                    return;
            }

            props.onResizeStart?.(elementDimensions[ PropertyTable[ props.direction ].dimensionProperty ]);

            window.document.documentElement.style.userSelect = 'none';
            window.document.documentElement.style.cursor     = PropertyTable[ props.direction ].cursor;

            // Make border brighter
            const borderColor                       = window.getComputedStyle(containerRef.current).borderColor;
            containerRef.current!.style.borderColor = brightenColor(borderColor, 30);

            const initialPos = moveEvent[ PropertyTable[ props.direction ].mouseProperty ];

            /**
             * Handles the mouse move event
             * This will change the dimensions of the element
             */
            const handleMouseMove = (event: MouseEvent) => {

                const delta        = event[ PropertyTable[ props.direction ].mouseProperty ] - initialPos;
                const newDimension = elementDimensions[ PropertyTable[ props.direction ].dimensionProperty ] - delta * PropertyTable[ props.direction ].scalar;

                if ( props.min && newDimension < props.min )
                    return;

                if ( props.max && newDimension > props.max )
                    return;

                containerRef.current!.style[ PropertyTable[ props.direction ].minSizeProperty ] = newDimension + 'px';
                containerRef.current!.style[ PropertyTable[ props.direction ].maxSizeProperty ] = newDimension + 'px';
                elementSize.current                                                             = newDimension;

                props.onResize?.(newDimension);
            }

            /**
             * Reverts the cursor and border color to their original state
             */
            const handleMouseUp = () => {
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('mousemove', handleMouseMove);
                window.document.documentElement.style.cursor     = 'auto';
                window.document.documentElement.style.userSelect = 'auto';
                containerRef.current!.style.borderColor          = borderColor;
                props.onResizeEnd?.(elementSize.current!);
            }

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        window.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        }

    }, [ props, containerRef ]);

    return (
        <div
            className={`relative p-0.5 flex flex-col bg-primary overflow-visible border-[1px] border-primary ${props.className ?? ''}`}
            style={{
                borderStyle: 'unset',
                transitionProperty: `${PropertyTable[ props.direction ].dimensionProperty} ${PropertyTable[ props.direction ].minSizeProperty}, ${PropertyTable[ props.direction ].maxSizeProperty}`,
            }}
            ref={containerRef}>
            {props.sides.map((side, i) => (
                <ResizeGrip key={i} className={ResizeSideStyles[ side ][ 0 ]} children={ResizeSideStyles[ side ][ 1 ]}/>
            ))}
            <div className="flex flex-col grow justify-start items-stretch overflow-hidden">
                {props.children}
            </div>
        </div>
    )
}
