/**
 * @fileoverview ActiveSessionsHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 10:41
 */
import { CloudOffIcon, PlusIcon } from "lucide-react";
import { InteractiveIconClasses } from "@renderer/components/Icons";
import { ActiveSession }          from "@renderer/components/file-explorer/ActiveSession";
import { PopupContext }           from "@renderer/contexts/PopupContext";
import { useContext }             from "react";
import { CreateSession }          from "@renderer/components/container/popups/CreateSession";
import { SFTPContext }            from "@renderer/contexts/SFTPContext";

/**
 * ActiveSessionsHeader component.
 * This component represents the header of the active sessions' container.
 * @constructor
 */
export function ActiveSessionsHeader() {

    const { setPopup } = useContext(PopupContext);
    const { sessions } = useContext(SFTPContext);

    return (
        <div className="flex flex-row justify-start bg-primary items-center border-b-[1px] border-primary gap-0.5">
            <CloudOffIcon size={26} className={InteractiveIconClasses}/>
            {sessions
                .filter(session => session.status === 'connected')
                .map(session => <ActiveSession
                    displayName={session.alias || (session.hostAddress + ':' + session.port)}/>)}
            <PlusIcon size={26} className={InteractiveIconClasses}
                      onClick={() => setPopup({ content: <CreateSession/>, uid: 'create-session' })}/>
        </div>
    )
}
