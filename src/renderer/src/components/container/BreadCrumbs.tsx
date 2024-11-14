/**
 * @fileoverview BreadCrumbs.tsx
 * @author Luca Warmenhoven
 * @date Created on Tuesday, November 12 - 01:41
 */
import { ChevronRightIcon } from "lucide-react";

export function BreadCrumbs(props: { path: string }) {
    return (
        <div className="flex flex-row justify-start items-center text-primary">
            {props.path.split('/').map((part, index, array) => {
                return (
                    <div key={index} className="flex flex-row justify-start items-center gap-1">
                            <span
                                className="text-secondary py-0.5 hover:underline hover:cursor-pointer px-0.5 text-sm">{part}</span>
                        {index < array.length - 1 && <ChevronRightIcon size={15}/>}
                    </div>
                );
            })}
        </div>
    )
}
