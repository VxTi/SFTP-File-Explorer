/**
 * @fileoverview Line.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 03 - 14:07
 */

export function Line(props: { direction: "horizontal" | "vertical", className?: string, props?: any }) {
    return (
        <div
            className={`${props.direction === "horizontal" ? "w-full h-[1px]" : "w-[1px] h-full"} bg-theme-300 ${props.className ?? ''}`}
            {...props.props} />
    );
}
