/**
 * @fileoverview ActiveSessionsHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 10:41
 */
import { CloudOffIcon, PlusIcon } from "lucide-react";
import { InteractiveIconClasses } from "@renderer/components/Icons";
import { ActiveSession }       from "@renderer/components/file-explorer/ActiveSession";
import { PopupContext }        from "@renderer/contexts/Popups";
import { useContext, useMemo } from "react";
import { CreateSession } from "@renderer/components/popups/CreateSession";
import { SFTPContext }   from "@renderer/contexts/SFTP";

/**
 * ActiveSessionsHeader component.
 * This component represents the header of the active sessions' container.
 * @constructor
 */
export function ActiveSessionsHeader() {

    const { setPopup } = useContext(PopupContext);
    const { sessions } = useContext(SFTPContext);

    const visibleSessions = useMemo(() => sessions.filter(session => session.status === 'connected'), [sessions]);

    return (
        <div className="flex flex-row justify-start bg-primary items-center border-b-[1px] border-primary gap-0.5">
            <CloudOffIcon size={26} className={InteractiveIconClasses}
                          onClick={() => {

                          }}
            />
            {visibleSessions
                .map((session, i) => <ActiveSession key={i}
                    displayName={session.alias || (session.hostAddress + ':' + session.port)}/>)}
            <PlusIcon size={26} className={InteractiveIconClasses}
                      onClick={() => setPopup({ content: <CreateSession/>, uid: 'create-session' })}/>
        </div>
    )
}
