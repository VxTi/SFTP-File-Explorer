/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 16:29
 */
import { ReactNode, useContext, useEffect, useState }                         from "react";
import { BookOpenIcon, ChevronRightIcon, PlusIcon, SettingsIcon, WrenchIcon } from "lucide-react";

import { PopupContext }       from "@renderer/contexts/PopupContext";
import { ResizableContainer } from "@renderer/components/container/ResizableContainer";
import { CreateSession } from "@renderer/components/container/popups/CreateSession";
import { SFTPContext } from "@renderer/contexts/SFTPContext";
import EVENTS          from "@/common/events.json";

export interface SidebarItemProps {
    expanded?: boolean;
    title: string;
    icon?: ReactNode;
    onClick?: () => void,
    childNodes?: SidebarItemProps[]
}

const SidebarContent: SidebarItemProps[] = [
    {
        title: "General",
        icon: null,
        childNodes: [
            {
                title: "Dashboard",
                icon: <BookOpenIcon size={16}/>,
                onClick: () => console.log("Dashboard clicked")
            },
            {
                title: "Settings",
                icon: <SettingsIcon size={16}/>,
                onClick: () => console.log("Settings clicked")
            }
        ]
    }
];

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

    const { setPopup }            = useContext(PopupContext);
    const { authorize, sessions } = useContext(SFTPContext);

    if ( !visible )
        return null;

    return (
        <ResizableContainer direction='horizontal'
                            className="bg-primary"
                            size={sidebarSize}
                            sides={[ 'right' ]}
                            onResizeEnd={(size) => setSidebarSize(size)}
                            min={30}
                            max={500}
                            margin={5}>
            <div
                className="flex flex-col justify-start items-stretch shrink-0 overflow-scroll grow gap-1 h-full max-w-full">

                <SidebarSection title="New Session" icon={<PlusIcon strokeWidth={1.5} size={20}/>} onClick={() => {
                    setPopup({ uid: 'add-session', content: <CreateSession/>, priority: 3, type: 'fullscreen' });
                }}/>
                <SidebarSection title="Recent Sessions"
                                expanded={true}
                                icon={<WrenchIcon size={20}/>}
                                childNodes={sessions.map((host) => ({
                                    title: host.alias || (`sftp://${host.hostAddress}:${host.port}`),
                                    onClick: () => authorize(host.sessionId),
                                }))}/>

                {SidebarContent.map((section, index) => (
                    <SidebarSection key={index} title={section.title} icon={section.icon}
                                    childNodes={section.childNodes}/>
                ))}
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
                    if ( !props.childNodes || props.childNodes.length === 0 )
                        props.onClick?.();
                    else
                        setExpanded( !expanded)
                }}>
                {props.childNodes && props.childNodes.length > 0 && (
                    <ChevronRightIcon
                        className={'transform transition-transform duration-300 ' + (expanded ? 'rotate-90' : 'rotate-0')}
                        size={20} strokeWidth={1.5}/>
                ) || (props.icon)}
                <span className="text-xs text-nowrap justify-self-start">
                    {props.title}
                </span>
            </div>
            {props.childNodes && props.childNodes.length > 0 && (
                <div
                    className="flex flex-col justify-start items-stretch gap-1 overflow-hidden transition-all duration-300"
                    style={{
                        maxHeight: expanded ? props.childNodes!.length * 40 : 0,
                        opacity: expanded ? 1 : 0
                    }}>
                    {props.childNodes?.map((item, index) => (
                        <SidebarItem key={index} title={item.title} icon={item.icon} onClick={item.onClick}/>
                    ))}
                </div>)}
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
