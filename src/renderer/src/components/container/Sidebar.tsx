/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 16:29
 */

import { App }                  from '@/common/app';
import EVENTS                   from '@/common/events.json';
import { ISSHSessionSecure }    from '@/common/ssh-definitions';
import { ResizableContainer }   from '@renderer/components/container/ResizableContainer';
import { CreateCommandSnippet } from '@renderer/components/popups/CreateCommandSnippet';
import { CreateSession }        from '@renderer/components/popups/CreateSession';
import { ContextMenu }          from '@renderer/contexts/ContextMenu';
import { PopupContext }         from '@renderer/contexts/Popups';
import { SFTPContext }          from '@renderer/contexts/SFTP';

import { ChevronRightIcon, CloudFogIcon, FingerprintIcon, PlusIcon, TerminalIcon, WrenchIcon } from 'lucide-react';
import { Fragment, ReactNode, useContext, useEffect, useState }                                from 'react';

export interface SidebarItemProps {
    expanded?: boolean;
    title: string;
    icon?: ReactNode;
    onClick?: () => void,
    children?: ReactNode[],

    /** Whether the list is appendable. When set to true, the list will have a plus icon on the right. */
    appendable?: () => void,
}

export function Sidebar() {

    const [ visible, setVisible ] = useState<boolean>( true );
    const [ sidebarSize, setSidebarSize ] = useState<number>( 300 );

    useEffect( () => {

        const handleVisibility = () => {
            setVisible( !visible );
        };

        window.addEventListener( EVENTS.RENDERER.TOGGLE_SIDEBAR, handleVisibility );

        return () => {
            window.removeEventListener( EVENTS.RENDERER.TOGGLE_SIDEBAR, handleVisibility );
        };
    }, [ visible ] );

    const { setPopup } = useContext( PopupContext );
    const { sessions, commandSnippets } = useContext( SFTPContext );

    if ( !visible )
        return null;

    return (
        <ResizableContainer direction="horizontal"
                            className="bg-primary"
                            size={ sidebarSize }
                            sides={ [ 'right' ] }
                            onResizeEnd={ ( size ) => setSidebarSize( size ) }
                            min={ 30 } max={ 500 } margin={ 5 }>
            <div
                className="flex flex-col justify-start items-stretch shrink-0 overflow-scroll grow gap-1 h-full max-w-full p-1">
                <div className="flex flex-row justify-start items-center gap-2 px-5 py-3 shrink-0">
                    <CloudFogIcon size={ 20 } className="shrink-0" />
                    <h2 className="text-xl text-primary font-satoshi font-bold text-nowrap">{ App.appName }</h2>
                </div>

                <SidebarList title="Saved Sessions"
                             expanded={ true }
                             appendable={ () =>
                                 setPopup( {
                                     uid: 'add-session',
                                     content: <CreateSession />,
                                     type: 'fullscreen'
                                 } ) }
                             icon={ <WrenchIcon size={ 20 } /> }>
                    { sessions.map( ( session, index ) => (
                        <SessionItem key={ index } session={ session } />
                    ) ) }
                </SidebarList>
                <SidebarList title="Command Snippets"
                             appendable={ () => setPopup( {
                                 uid: 'sidebar-command-snippet',
                                 content: <CreateCommandSnippet />,
                                 type: 'fullscreen'
                             } ) }
                             icon={ <TerminalIcon size={ 20 } /> }>
                    { commandSnippets.map( ( snippet, index ) => (
                        <SidebarItem title={ snippet.title } key={ index } onClick={ () => setPopup( {
                            uid: 'sidebar-command-snippet',
                            content: <CreateCommandSnippet snippet={ snippet } />,
                            type: 'fullscreen'
                        } ) } />
                    ) )
                    }
                </SidebarList>
            </div>
        </ResizableContainer>
    );
}

function SidebarList( props: SidebarItemProps ) {

    const [ expanded, setExpanded ] = useState<boolean>( props.expanded || false );

    return (
        <div className="flex flex-col justify-start items-stretch gap-y-1 select-none w-full">
            <div
                className="flex flex-row justify-start items-center px-0.5 w-full gap-1 max-w-[300px] hover:cursor-pointer hover:bg-hover transition-colors duration-200 rounded-lg">
                <div onClick={ () => setExpanded( !expanded ) }
                     className="grid place-items-center grow items-center gap-1 py-1.5"
                     style={ {
                         gridTemplateColumns: '40px 1fr'
                     } }>
                    < ChevronRightIcon
                        className={ `transform transition-transform duration-300 ${ expanded ? 'rotate-90' : 'rotate-0' } ${ props.children && props.children.length > 0 ? '' : 'opacity-0' }` }
                        size={ 20 } strokeWidth={ 1.5 } />

                    <span className="text-sm text-nowrap justify-self-start">
                        { props.title }
                    </span>
                </div>
                { props.appendable ? (
                    <PlusIcon size={ 30 }
                              onClick={ props.appendable }
                              className="hover:bg-hover active:bg-tertiary rounded-md cursor-pointer py-1.5" />
                ) : null }
            </div>
            <div
                className="flex flex-col justify-start items-stretch gap-1 overflow-hidden transition-all duration-300"
                style={ {
                    maxHeight: ( expanded ? ( props.children?.length ?? 1 ) * 40 : 0 ) + 'px',
                    opacity: expanded ? 1 : 0
                } }>
                { props.children?.map( ( item, index ) => (
                    <Fragment key={ index }>
                        { item }
                    </Fragment>
                ) ) }
            </div>
        </div>
    );
}

function SidebarItem( props: SidebarItemProps ) {

    return (
        <div
            className="flex flex-row justify-start rounded-lg h-8 shrink-0 items-center gap-1 hover:cursor-pointer hover:bg-hover transition-colors duration-200"
            onClick={ () => props.onClick?.() }>
            <div className="ml-8 aspect-square shrink-0 h-6 w-6 p-1 stroke-primary">
                { props.icon }
            </div>
            <span className="text-xs text-secondary text-nowrap">
                { props.title }
            </span>
        </div>
    );
}

function SessionItem( props: { session: ISSHSessionSecure } ) {

    const { authorize } = useContext( SFTPContext );
    const { setPopup } = useContext( PopupContext );

    return (
        <ContextMenu<HTMLDivElement> items={ [
            {
                type: 'item', title: 'Edit', onClick: () =>
                    setPopup( { uid: 'edit-session', content: <CreateSession session={ props.session } /> } )
            },
            { type: 'item', title: 'Delete', onClick: () => window.api.sessions.remove( props.session.uid ) }
        ] }>
            { ( ref ) => (
                <div
                    ref={ ref }
                    className="grid items-center gap-1 pl-8 h-8 shrink-0 rounded-lg hover:cursor-pointer hover:bg-hover transition-colors duration-200"
                    style={ {
                        gridTemplateColumns: '25px 1fr'
                    } }
                    onClick={ () => authorize( props.session.uid ) }>
                    { props.session.requiresFingerprintVerification && (
                        <FingerprintIcon size={ 24 } className="text-primary p-1" />

                    ) }
                    <span className="text-sm text-secondary text-nowrap col-start-2">
                { props.session.alias || ( `${ props.session.hostAddress }:${ props.session.port }` ) }
            </span>
                </div>
            ) }
        </ContextMenu>
    );
}
