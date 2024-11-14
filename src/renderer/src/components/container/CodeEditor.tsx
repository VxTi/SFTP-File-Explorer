/**
 * @fileoverview CodeEditor.tsx
 * @author Luca Warmenhoven
 * @date Created on Monday, November 11 - 19:41
 */
import { useEffect, useMemo, useRef } from "react";
import { ChevronRightIcon } from "lucide-react";
import { IEditorContext }   from "@/common/editor-definitions";

export function CodeEditor(props: IEditorContext) {

    const lines = useMemo(() => props.content.split('\n'), [ props.content ]);

    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const fileContentRef = useRef<HTMLDivElement>(null);
    const containerRef   = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ( !lineNumbersRef.current || !fileContentRef.current || !containerRef.current )
            return;

        let offsetX = 0, offsetY = 0;


        const handleScroll = (event) => {
            offsetX += event.deltaX;
            offsetY += event.deltaY
            lineNumbersRef.current!.style.transform = `translateY(${-offsetY}px)`;
            fileContentRef.current!.style.transform = `translateY(${-offsetY}px) translateX(${-Math.max(0, offsetX)}px)`;
        }

        containerRef.current.addEventListener('wheel', handleScroll);

    }, []);

    return (
        <div className="grow relative flex flex-col justify-start items-stretch text-sm">
            <div
                className="absolute left-0 top-0 w-full h-full flex flex-row justify-start items-stretch font-jb-mono overflow-hidden"
                ref={containerRef}>
                <div ref={lineNumbersRef}
                     className="bg-primary px-3 text-secondary z-10 border-r-[1px] border-solid border-primary">
                    {Array.from({ length: lines.length }).map((_, index) => (
                        <div key={index} style={{
                            lineHeight: '1.3'
                        }}>
                            {index + 1}
                        </div>
                    ))}
                </div>
                <div ref={fileContentRef} className="whitespace-pre-wrap text-nowrap">
                    {lines.map((line, index) => (
                        <div key={index}>
                            {line}
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="flex flex-row justify-start items-center z-20 bg-primary border-b-[1px] border-solid border-primary self-stretch">
                {props.filePath.split('/').map((part, index, array) => {
                    return (
                        <div key={index} className="flex flex-row justify-start items-center gap-1">
                            <span
                                className="text-secondary py-1 hover:underline hover:cursor-pointer px-0.5 text-sm">{part}</span>
                            {index < array.length - 1 && <ChevronRightIcon size={15}/>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
