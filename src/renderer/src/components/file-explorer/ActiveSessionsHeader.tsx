/**
 * @fileoverview ActiveSessionsHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 10:41
 */
import { CloudOffIcon, PlusIcon } from "lucide-react";
import { InteractiveIconClasses } from "@renderer/components/Icons";
import { ActiveSession }          from "@renderer/components/file-explorer/ActiveSession";

/**
 * ActiveSessionsHeader component.
 * This component represents the header of the active sessions' container.
 * @constructor
 */
export function ActiveSessionsHeader() {
    return (
        <div className="flex flex-row justify-start items-center border-b-[1px] border-primary gap-0.5">
            <CloudOffIcon size={26} className={InteractiveIconClasses}/>
            <ActiveSession displayName="Test Session"/>
            <PlusIcon size={26} className={InteractiveIconClasses}
                      onClick={() => void 0}/>
        </div>
    )
}
