/**
 * @fileoverview BasicApplicationContent.tsx
 */

import { Sidebar }      from "@renderer/components/container/Sidebar";
import { FileExplorer } from "@renderer/components/container/FileExplorer";
import { TerminalContainer } from "@renderer/components/container/Terminal";
import { SFTPContext }       from "@renderer/contexts/SFTPContextProvider";
import { useContext }           from "react";
import { LoadingRotor }         from "@renderer/components/LoadingRotor";
import { PlusIcon }             from "lucide-react";
import { PopupContext }         from "@renderer/contexts/PopupContext";
import { CreateSession }        from "@renderer/components/container/popups/CreateSession";
import { ActiveSessionsHeader } from "@renderer/components/file-explorer/ActiveSessionsHeader";

export function BasicApplicationContent() {

    const { status, clients } = useContext(SFTPContext);

    return (
        <div className="flex flex-col justify-start items-stretch grow text-primary">
            <div className="flex flex-row justify-start items-stretch grow">
                <Sidebar/>
                <div className="flex flex-col justify-start items-stretch grow">
                    {
                        (status === 'connecting') ?
                        <LoadingRotor/> :
                        ( !clients.local && !clients.remote) ?
                        <Unauthorized/> :
                        <AuthorizedSFTPSession/>}
                </div>
            </div>
        </div>
    );
}

/**
 * Unauthorized component.
 * This component is displayed when there is no active SSH session.
 * @constructor
 */
function Unauthorized() {

    const { setPopup } = useContext(PopupContext);

    return (
        <div className="flex flex-col justify-center items-center h-full">
            <span className="text-primary text-2xl font-satoshi font-bold">No active SSH session</span>
            <button
                className="rounded-lg px-3 py-2 mt-3 bg-primary text-secondary flex items-center justify-start hover:text-special transition-colors duration-300 cursor-pointer"
                onClick={() => setPopup({ uid: 'add-session', content: <CreateSession/> })}>
                <PlusIcon size={24} className="mr-2"/>
                Create Session
            </button>
        </div>
    )
}

/**
 * AuthorizedSFTPSession component.
 * This component is displayed when there is an active SSH session.
 * @constructor
 */
function AuthorizedSFTPSession() {
    return (<>
        <div
            className="flex flex-col justify-start items-stretch shrink-0 grow-[4] overflow-y-scroll">
            <ActiveSessionsHeader/>
            <FileExplorer/>
        </div>
        <div className="flex flex-col justify-start items-stretch shrink-0 overflow-visible">
            <TerminalContainer/>
        </div>
    </>)
}
