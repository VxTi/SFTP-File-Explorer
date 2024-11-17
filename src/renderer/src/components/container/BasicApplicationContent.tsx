/**
 * @fileoverview BasicApplicationContent.tsx
 */

import { Sidebar }                            from "@renderer/components/container/Sidebar";
import { FileExplorer }                       from "@renderer/components/container/FileExplorer";
import { TerminalContainer } from "@renderer/components/container/Terminal";
import { SFTPContext }       from "@renderer/contexts/SFTP";
import { useContext }        from "react";
import { LoadingRotor }                       from "@renderer/components/LoadingRotor";
import { CloudOffIcon, PlusIcon, UnplugIcon } from "lucide-react";
import { PopupContext }                       from "@renderer/contexts/Popups";
import { CreateSession }                      from "@renderer/components/popups/CreateSession";
import { ActiveSessionsHeader }               from "@renderer/components/file-explorer/ActiveSessionsHeader";
import { QuickConnect }                       from "@renderer/components/popups/QuickConnect";

export function BasicApplicationContent() {

    const { status, clients } = useContext(SFTPContext);

    return (
        <div className="flex flex-col justify-start items-stretch grow text-primary">
            <div className="flex flex-row justify-start items-stretch grow">
                <Sidebar/>
                <div className="flex flex-col justify-start items-stretch grow">
                    {(status === 'connecting') ?
                     (
                         <div className="flex flex-col justify-center items-center grow place-self-center gap-2">
                             <LoadingRotor/>
                             <span>Connecting to session...</span>
                         </div>
                     ) :
                     ( !clients.local && !clients.remote) ?
                     <Unauthorized/> : <AuthorizedSFTPSession/>}
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
        <div className="flex flex-col justify-center items-center h-full gap-2">
            <CloudOffIcon size={60}/>
            <span className="text-primary text-2xl font-satoshi font-bold">
                Not connected to any session yet.
            </span>
            <div className="grid grid-cols-2 gap-2">

                <button
                    className="rounded-lg px-3 py-1.5 mt-3 bg-secondary text-secondary flex items-center justify-start hover:text-special transition-colors duration-300 cursor-pointer"
                    onClick={() => setPopup({ uid: 'add-session', content: <CreateSession/> })}>
                    <PlusIcon size={24} className="mr-2"/>
                    Create Session
                </button>
                <button
                    className="rounded-lg px-3 py-1.5 mt-3 bg-secondary text-secondary flex items-center justify-start hover:text-special transition-colors duration-300 cursor-pointer"
                    onClick={() => setPopup({ uid: 'quick-connect', content: <QuickConnect/> })}
                >
                    <UnplugIcon size={24} className="mr-2"/>
                    Quick Connect
                </button>
            </div>
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
