/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 16:29
 */

import { App, EVENTS }         from '@/common/app';
import { ISSHSessionSecure }   from '@/common/ssh-definitions';
import { ResizableContainer }  from '@renderer/components/container/ResizableContainer';
import { CommandSnippetPopup } from '@renderer/components/popups/CommandSnippetPopup';
import { CreateSession }       from '@renderer/components/popups/CreateSession';
import { ContextMenu }         from '@renderer/contexts/ContextMenu';
import { PopupContext }        from '@renderer/contexts/Popups';
import { SFTPContext }         from '@renderer/contexts/SFTP';

import { ChevronRightIcon, CloudFogIcon, FingerprintIcon, TerminalIcon, WrenchIcon } from 'lucide-react';
import { Fragment, ReactNode, RefObject, useContext, useEffect, useState }           from 'react';

export interface SidebarItemProps {
    expanded?: boolean;
    title: string;
    icon?: ReactNode;
    refObject?: RefObject<HTMLDivElement>;
    onClick?: () => void,
    children?: ReactNode[],
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
                <div className="mx-2 bg-border h-[1px] my-2" />

                <ContextMenu<HTMLDivElement> items={ [
                    {
                        type:     'item',
                        title:    'New Session',
                        shortcut: 'Meta+N',
                        icon:     'new',
                        onClick:  () => setPopup( { uid: 'add-session', content: <CreateSession /> } )
                    }
                ] }>
                    { ( ref ) => (
                        <SidebarList title="Saved Sessions"
                                     refObject={ ref }
                                     expanded={ true }
                                     icon={ <WrenchIcon size={ 20 } /> }>
                            { sessions.map( ( session, index ) => (
                                <SessionItem key={ index } session={ session } />
                            ) ) }
                        </SidebarList>
                    ) }
                </ContextMenu>
                <ContextMenu<HTMLDivElement> items={ [
                    {
                        type:    'item',
                        title:   'New Snippet',
                        icon:    'new',
                        onClick: () => setPopup( { uid: 'sidebar-command-snippet', content: <CommandSnippetPopup /> } )
                    }
                ] }>
                    { ( ref ) => (
                        <SidebarList
                            title="Command Snippets"
                            refObject={ ref }
                            icon={ <TerminalIcon size={ 20 } /> }>

                            { commandSnippets.map( ( snippet, index ) => (
                                <ContextMenu<HTMLDivElement> key={ index } items={ [
                                    {
                                        type:    'item', title: 'Delete', icon: 'delete',
                                        onClick: () => window.api.sftp.shell.snippets.remove( snippet.snippetId )
                                    }
                                ] }>
                                    { ( ref ) => ( <SidebarItem
                                            title={ snippet.title } refObject={ ref }
                                            onClick={ () => setPopup(
                                                {
                                                    uid:     'sidebar-command-snippet',
                                                    content: <CommandSnippetPopup snippet={ snippet } />
                                                } ) } />
                                    ) }
                                </ContextMenu> ) ) }
                        </SidebarList> ) }
                </ContextMenu>
            </div>
        </ResizableContainer>
    );
}

function SidebarList( props: SidebarItemProps ) {

    const [ expanded, setExpanded ] = useState<boolean>( props.expanded || false );

    return (
        <div className="flex flex-col justify-start items-stretch gap-y-1 select-none w-full" ref={ props.refObject }>
            <div
                className="flex flex-row justify-start items-center px-0.5 w-full gap-0.5 max-w-[300px] hover:cursor-pointer hover:bg-hover transition-colors duration-300 rounded-lg">
                <div onClick={ () => setExpanded( !expanded ) }
                     className="grid place-items-center grow items-center gap-1 py-1.5"
                     style={ {
                         gridTemplateColumns: '25px 1fr'
                     } }>
                    < ChevronRightIcon
                        className={ `ml-1 transform transition-transform duration-300 ${ expanded ? 'rotate-90' : 'rotate-0' } ${ props.children && props.children.length > 0 ? '' : 'opacity-0' }` }
                        size={ 20 } strokeWidth={ 1.5 } />

                    <span
                        className="text-sm text-nowrap justify-self-start font-satoshi font-bold">{ props.title }</span>
                </div>
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
        <div ref={ props.refObject }
             className="flex flex-row justify-start rounded-lg h-7 shrink-0 items-center gap-1 hover:cursor-pointer hover:bg-hover transition-colors duration-300"
             onClick={ () => props.onClick?.() }>
            <div className="ml-1 aspect-square shrink-0 h-6 w-6 p-1 stroke-primary">
                { props.icon }
            </div>
            <span className="text-xs text-secondary text-nowrap font-satoshi">
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
                type:    'item', title: 'Connect', icon: 'connect', shortcut: 'Meta+C+0',
                onClick: () => authorize( props.session.uid )
            },
            {
                type:    'item', title: 'Edit', icon: 'edit',
                onClick: () => setPopup( { uid: 'edit-session', content: <CreateSession session={ props.session } /> } )
            },
            {
                type:    'item', title: 'Delete', icon: 'delete',
                onClick: () => window.api.sessions.remove( props.session.uid )
            }
        ] }>
            { ( ref ) => (
                <div
                    ref={ ref }
                    className="grid items-center gap-1 h-7 pl-1 shrink-0 rounded-lg hover:cursor-pointer hover:bg-hover transition-colors duration-300"
                    style={ {
                        gridTemplateColumns: '25px 1fr'
                    } }
                    onClick={ () => authorize( props.session.uid ) }>
                    { props.session.requiresFingerprintVerification && (
                        <FingerprintIcon size={ 20 } className="text-primary p-1 place-self-center" /> ) }
                    <span className="text-xs text-secondary text-nowrap col-start-2 font-satoshi">
                { props.session.alias || ( `${ props.session.hostAddress }:${ props.session.port }` ) }
            </span>
                </div>
            ) }
        </ContextMenu>
    );
}
