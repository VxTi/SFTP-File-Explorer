/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 16:29
 */
import { Fragment, ReactNode, useContext, useEffect, useState } from "react";
import { ChevronRightIcon, PlusIcon, WrenchIcon }               from "lucide-react";

import { PopupContext }       from "@renderer/contexts/PopupContext";
import { ResizableContainer } from "@renderer/components/container/ResizableContainer";
import { CreateSession }      from "@renderer/components/container/popups/CreateSession";
import { SFTPContext }        from "@renderer/contexts/SFTPContext";
import EVENTS                 from "@/common/events.json";
import { ISSHSessionSafe }    from "@/common/ssh-definitions";
import { ContextMenu }        from "@renderer/hooks/ContextMenu";

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
            <div
                className="flex flex-col justify-start items-stretch shrink-0 overflow-scroll grow gap-1 h-full max-w-full">

                <SidebarSection title="New Session" icon={<PlusIcon strokeWidth={1.5} size={20}/>} onClick={() => {
                    setPopup({ uid: 'add-session', content: <CreateSession/>, priority: 3, type: 'fullscreen' });
                }}/>
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
        <div className="flex flex-col justify-start items-stretch gap-y-0.5 select-none w-full">
            <div
                className="grid place-items-center items-center px-0.5 h-7 gap-1 hover:cursor-pointer hover:bg-hover transition-colors duration-200"
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
                <span className="text-xs text-nowrap justify-self-start">
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

function SidebarItem(props: SidebarItemProps) {

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
}

function SessionItem(props: { session: ISSHSessionSafe }) {

    const { authorize } = useContext(SFTPContext);
    const { setPopup }  = useContext(PopupContext);

    return (
        <ContextMenu<HTMLDivElement> items={[
            {
                type: 'item', name: 'Edit', onClick: () =>
                    setPopup({ uid: 'edit-session', content: <CreateSession session={props.session}/> })
            },
            { type: 'item', name: 'Delete', onClick: () => window.api.sessions.remove(props.session.sessionId) }
        ]}>
            {(ref) => (
                <div
                    ref={ref}
                    className="grid items-center gap-1 pl-8 h-7 hover:cursor-pointer hover:bg-hover transition-colors duration-200"
                    style={{
                        gridTemplateColumns: '25px 1fr'
                    }}
                    onClick={() => authorize(props.session.sessionId)}>
                    {props.session.requiresFingerprintVerification && (
                        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                             className="text-primary p-1">
                            <path
                                fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                d="M35.62 8.94c-.16 0-.31-.04-.46-.11C31.33 6.85 28 6 24.02 6c-3.97 0-7.71.95-11.14 2.82-.49.26-1.09.09-1.36-.4-.26-.49-.09-1.09.4-1.36C15.65 5.03 19.72 4 24.02 4c4.26 0 7.98.94 12.06 3.05.49.25.68.86.43 1.35-.18.34-.53.54-.89.54zM7 19.44c-.2 0-.4-.06-.58-.18-.45-.32-.56-.94-.24-1.39 1.98-2.8 4.51-5 7.51-6.55 6.29-3.25 14.33-3.26 20.63-.02 2.99 1.54 5.51 3.72 7.5 6.5.32.45.22 1.07-.23 1.39-.45.32-1.08.22-1.4-.23-1.8-2.52-4.08-4.5-6.78-5.88-5.74-2.95-13.07-2.94-18.8.02-2.71 1.4-5 3.39-6.79 5.93-.2.27-.51.41-.82.41zm12.51 24.13c-.26 0-.51-.1-.71-.3-1.73-1.75-2.67-2.86-4.02-5.27-1.38-2.46-2.11-5.47-2.11-8.69 0-5.94 5.08-10.78 11.33-10.78s11.33 4.83 11.33 10.78c0 .55-.45 1-1 1s-1-.45-1-1c0-4.84-4.18-8.78-9.33-8.78-5.14 0-9.33 3.94-9.33 8.78 0 2.88.64 5.54 1.85 7.71 1.29 2.3 2.15 3.29 3.69 4.84.39.39.39 1.03-.01 1.41-.18.21-.44.3-.69.3zm14.33-3.7c-2.38 0-4.47-.6-6.2-1.77-2.97-2.02-4.75-5.3-4.75-8.78 0-.55.45-1 1-1s1 .45 1 1c0 2.81 1.45 5.47 3.88 7.12 1.41.96 3.07 1.43 5.07 1.43.48 0 1.29-.05 2.09-.19.54-.1 1.06.27 1.16.81.1.54-.27 1.06-.81 1.16-1.17.21-2.16.22-2.44.22zM29.81 44c-.09 0-.18-.01-.26-.04-3.19-.87-5.27-2.05-7.43-4.2-2.79-2.78-4.33-6.49-4.33-10.44 0-3.25 2.76-5.89 6.16-5.89 3.4 0 6.16 2.64 6.16 5.89 0 2.14 1.87 3.89 4.16 3.89s4.16-1.74 4.16-3.89c0-7.54-6.5-13.67-14.49-13.67-5.69 0-10.88 3.16-13.22 8.06-.78 1.62-1.17 3.51-1.17 5.61 0 1.56.14 4.02 1.33 7.21.19.52-.07 1.09-.59 1.29-.52.19-1.09-.07-1.29-.59-.98-2.63-1.46-5.21-1.46-7.91 0-2.4.46-4.58 1.37-6.47 2.67-5.58 8.57-9.19 15.02-9.19 9.09 0 16.49 7.03 16.49 15.67 0 3.25-2.77 5.89-6.16 5.89s-6.16-2.64-6.16-5.89c0-2.14-1.87-3.89-4.16-3.89s-4.16 1.74-4.16 3.89c0 3.41 1.33 6.62 3.74 9.02 1.89 1.88 3.73 2.92 6.55 3.69.53.15.85.7.7 1.23-.12.44-.52.73-.96.73z"/>
                            <path d="M0 0h48v48H0z" fill="none"/>
                        </svg>
                    )}
                    <span className="text-xs text-secondary text-nowrap col-start-2">
                {props.session.alias || (`${props.session.hostAddress}:${props.session.port}`)}
            </span>
                </div>
            )}
        </ContextMenu>
    )
}
