/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 16:29
 */
import { Fragment, ReactNode, useContext, useEffect, useState }    from "react";
import { ChevronRightIcon, FingerprintIcon, PlusIcon, WrenchIcon } from "lucide-react";

import { PopupContext }       from "@renderer/contexts/Popups";
import { ResizableContainer } from "@renderer/components/container/ResizableContainer";
import { CreateSession }      from "@renderer/components/popups/CreateSession";
import { SFTPContext }        from "@renderer/contexts/SFTP";
import EVENTS                 from "@/common/events.json";
import { ISSHSessionSafe }    from "@/common/ssh-definitions";
import { ContextMenu }        from "@renderer/contexts/ContextMenu";

export interface SidebarItemProps {
    expanded?: boolean;
    title: string;
    icon?: ReactNode;
    onClick?: () => void,
    children?: ReactNode[]
}

export function Sidebar() {

    const [ visible, setVisible ]         = useState<boolean>(true);
    const [ sidebarSize, setSidebarSize ] = useState<number>(300);

    useEffect(() => {

        const handleVisibility = () => {
            setVisible( !visible);
        }

        window.addEventListener(EVENTS.RENDERER.TOGGLE_SIDEBAR, handleVisibility);

        return () => {
            window.removeEventListener(EVENTS.RENDERER.TOGGLE_SIDEBAR, handleVisibility);
        }
    }, [ visible ]);

    const { setPopup } = useContext(PopupContext);
    const { sessions } = useContext(SFTPContext);

    if ( !visible )
        return null;

    return (
        <ResizableContainer direction='horizontal'
                            className="bg-primary"
                            size={sidebarSize}
                            sides={[ 'right' ]}
                            onResizeEnd={(size) => setSidebarSize(size)}
                            min={30} max={500} margin={5}>
            <h2 className="text-xl text-primary font-satoshi font-bold px-5 py-3 text-nowrap">SFTP Client</h2>
            <div
                className="flex flex-col justify-start items-stretch shrink-0 overflow-scroll grow gap-1 h-full max-w-full p-1">

                <SidebarSection title="New Session"
                                icon={<PlusIcon strokeWidth={1.5} size={20}/>}
                                onClick={() =>
                                    setPopup({
                                                 uid: 'add-session',
                                                 content: <CreateSession/>,
                                                 type: 'fullscreen'
                                             })}/>
                <SidebarSection title="Saved Sessions"
                                expanded={true}
                                icon={<WrenchIcon size={20}/>}>
                    {sessions.map((session, index) => (
                        <SessionItem key={index} session={session}/>
                    ))}
                </SidebarSection>
            </div>
        </ResizableContainer>
    )
}

function SidebarSection(props: SidebarItemProps) {

    const [ expanded, setExpanded ] = useState<boolean>(props.expanded ?? false);

    return (
        <div className="flex flex-col justify-start items-stretch gap-y-1 select-none w-full">
            <div
                className="grid place-items-center items-center px-0.5 h-7 gap-1 hover:cursor-pointer hover:bg-hover transition-colors duration-200 rounded-lg"
                style={{
                    gridTemplateColumns: '40px 1fr'
                }}
                onClick={() => {
                    if ( !props.children || props.children.length === 0 )
                        props.onClick?.();
                    else
                        setExpanded( !expanded)
                }}>
                {props.children && props.children.length > 0 && (
                    <ChevronRightIcon
                        className={'transform transition-transform duration-300 ' + (expanded ? 'rotate-90' : 'rotate-0')}
                        size={20} strokeWidth={1.5}/>
                ) || props.icon}
                <span className="text-sm text-nowrap justify-self-start">
                    {props.title}
                </span>
            </div>
            <div
                className="flex flex-col justify-start items-stretch gap-1 overflow-hidden transition-all duration-300"
                style={{
                    maxHeight: expanded ? '100%' : 0,
                    opacity: expanded ? 1 : 0
                }}>
                {props.children?.map((item, index) => (
                    <Fragment key={index}>
                        {item}
                    </Fragment>
                ))}
            </div>
        </div>
    )
}

/*function SidebarItem(props: SidebarItemProps) {

 return (
 <div
 className="flex flex-row justify-start h-7 items-center gap-1 hover:cursor-pointer hover:bg-hover transition-colors duration-200"
 onClick={() => props.onClick?.()}>
 <div className="ml-8 aspect-square shrink-0 h-6 w-6 p-1 stroke-primary">
 {props.icon}
 </div>
 <span className="text-xs text-secondary text-nowrap">
 {props.title}
 </span>
 </div>
 )
 }*/

function SessionItem(props: { session: ISSHSessionSafe }) {

    const { authorize } = useContext(SFTPContext);
    const { setPopup }  = useContext(PopupContext);

    return (
        <ContextMenu<HTMLDivElement> items={[
            {
                type: 'item', title: 'Edit', onClick: () =>
                    setPopup({ uid: 'edit-session', content: <CreateSession session={props.session}/> })
            },
            { type: 'item', title: 'Delete', onClick: () => window.api.sessions.remove(props.session.sessionId) }
        ]}>
            {(ref) => (
                <div
                    ref={ref}
                    className="grid items-center gap-1 pl-8 h-7 rounded-lg hover:cursor-pointer hover:bg-hover transition-colors duration-200"
                    style={{
                        gridTemplateColumns: '25px 1fr'
                    }}
                    onClick={() => authorize(props.session.sessionId)}>
                    {props.session.requiresFingerprintVerification && (
                        <FingerprintIcon size={24} className="text-primary p-1"/>

                    )}
                    <span className="text-sm text-secondary text-nowrap col-start-2">
                {props.session.alias || (`${props.session.hostAddress}:${props.session.port}`)}
            </span>
                </div>
            )}
        </ContextMenu>
    )
}
