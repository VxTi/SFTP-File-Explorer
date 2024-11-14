/**
 * @fileoverview FileExplorer.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 03 - 17:43
 */
import { useContext }         from "react";
import { SFTPContext }        from "@renderer/contexts/SFTPContextProvider";
import { DragDropContext }    from "@hello-pangea/dnd";
import { Navigator }          from "@renderer/components/file-explorer/Navigator";
import { FileExplorerOrigin } from "@renderer/components/file-explorer/FileList";
import { LoadingRotor }       from "@renderer/components/LoadingRotor";

export function FileExplorer() {

    const { clients } = useContext(SFTPContext);

    if ( !clients.local || !clients.remote )
        return <LoadingRotor/>

    return (<>
        <div
            className="flex flex-row justify-center items-start self-stretch overflow-x-scroll border-b-[1px] border-solid border-primary">
            <Navigator client={clients.local}/>
            <div className="min-w-[1px] h-full bg-border"/>
            <Navigator client={clients.remote}/>
        </div>

        <DragDropContext onDragEnd={() => void 0}>
            <div className="grid grid-cols-2 items-stretch grow">
                <div
                    className="flex flex-col overflow-y-scroll justify-start items-stretch grow border-r-[1px] border-solid border-primary">
                    <FileExplorerOrigin client={clients.local}/>
                </div>
                <div className="flex flex-col overflow-y-scroll justify-start items-stretch grow">
                    <FileExplorerOrigin client={clients.remote}/>
                </div>
            </div>
        </DragDropContext>
    </>)
}

