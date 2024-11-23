/**
 * @fileoverview Console.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, November 01 - 14:07
 */
import { EVENTS }                                      from '@/common/app';
import { IShellMessage }                               from '@/common/ssh-definitions';
import { ResizableContainer }                          from '@renderer/components/container/ResizableContainer';
import { InteractiveIconClasses, InteractiveIconSize } from '@renderer/components/Icons';
import { Renamable }                                   from '@renderer/components/interactive/Renamable';
import { ContextMenu }                                 from '@renderer/contexts/ContextMenu';
import { SFTPContext }                                 from '@renderer/contexts/SFTP';
import { useMap }                                      from '@renderer/hooks/UseMap';
import { FitAddon }                                    from '@xterm/addon-fit';
import { MaximizeIcon, MinimizeIcon, PlusIcon, XIcon } from 'lucide-react';
import { useContext, useEffect, useRef, useState }     from 'react';
import { Terminal }                                    from 'xterm';
import '@renderer/resources/styles/xterm-styles.css';

/**
 * Default terminal configuration, used to create a new terminal instance
 */
const defaultTerminal = new Terminal(
    {
        cursorBlink: true,
        cursorWidth: 1,
        cursorStyle: 'underline',
        cursorInactiveStyle: 'underline',

        allowTransparency: true,
        lineHeight:        1.3,
        smoothScrollDuration: 100,
        scrollback:        1000,
        scrollSensitivity: 3,
        fontFamily:        'Menlo, JetBrains Mono, monospace',
        fontSize:          15,
        theme:             {
            background: '#00000000',
            foreground: 'var(--color-text-primary)',
            cursor:     'var(--color-text-primary)'
        }
    } );

const fitAddon = new FitAddon();
defaultTerminal.loadAddon( fitAddon );

/**
 * TerminalContainer
 * @constructor
 */
export function TerminalContainer() {
    const terminalContainerRef = useRef<HTMLDivElement>( null );

    const [ terminalSize, setTerminalSize ]       = useState<number>( 200 );
    const [ terminalVisible, setTerminalVisible ] = useState<boolean>( true );
    const [ isMaximized, setMaximized ]           = useState<boolean>( false );
    const [ terminalSessions, addSession, removeSession ] = useMap<string, string>();
    const { sessionId, shellId, setShellID }      = useContext( SFTPContext );

    useEffect( () => {

        if ( !sessionId || !shellId || !terminalVisible || !defaultTerminal.element )
            return;

        defaultTerminal.clear();
        fitAddon.fit();
        window.api.sftp.shell.getContent( sessionId, shellId )
              .then( content => defaultTerminal.write( content ) );

    }, [ shellId, sessionId, terminalVisible ] );

    useEffect( () => {

        const handleVisibility = () => setTerminalVisible( !terminalVisible );
        window.addEventListener( EVENTS.RENDERER.TOGGLE_TERMINAL, handleVisibility );

        if ( terminalContainerRef.current &&
             terminalVisible &&
             !defaultTerminal.element &&
             sessionId &&
             shellId ) {

            defaultTerminal.open( terminalContainerRef.current );
            fitAddon.fit();
            let lineBuffer = '';
            defaultTerminal.onKey( ( e ) => {
                switch ( e.domEvent.key ) {
                    case 'Backspace':
                        const newBuffer = lineBuffer.slice( 0, lineBuffer.length - 1 );
                        defaultTerminal.write( '\r\x1b[K' + newBuffer );
                        lineBuffer = newBuffer;
                        break;
                    case 'Enter':
                        if ( lineBuffer.trim().length === 0 || !shellId ) {
                            break;
                        }

                        window.api.sftp.shell.exec(
                            sessionId,
                            shellId,
                            lineBuffer
                        );
                        defaultTerminal.write( '\n\r' );
                        lineBuffer = '';
                        break;
                    default: {
                        if ( e.domEvent.ctrlKey && e.domEvent.key === 'c' ) {
                            lineBuffer += '\x03';
                            defaultTerminal.write( '^C' );
                        }
                        lineBuffer += e.key;
                        defaultTerminal.write( e.key );
                    }
                }
            } );
        }

        return () => {
            window.removeEventListener( EVENTS.RENDERER.TOGGLE_TERMINAL, handleVisibility );
        };

    }, [ terminalContainerRef, terminalVisible, sessionId, shellId ] );

    useEffect( () => {
        if ( !sessionId )
            return;

        // Handle creation of shell sessions.
        // This will add a new shell window if successful.
        window.api.on( EVENTS.SFTP.SHELL.CREATED, ( _, messageObj: { shellId: string } ) => {
            console.log( 'Setting shell ID: ', messageObj.shellId );
            addSession( messageObj.shellId, 'Session #' + ( terminalSessions.size + 1 ) );
            setShellID( messageObj.shellId );
        } );

        // Handle destruction of shell sessions.
        window.api.on( EVENTS.SFTP.SHELL.DESTROYED, ( _, messageObj: { shellId: string } ) => {
            removeSession( messageObj.shellId );
        } );

        // Handle deletion of terminal sessions.
        window.api.on( EVENTS.SFTP.SHELL.DESTROY, ( _, messageObj: { shellId: string } ) => {
            if ( terminalSessions.has( messageObj.shellId ) )
                terminalSessions.delete( messageObj.shellId );
        } );

        window.api.on( EVENTS.SFTP.SHELL.MESSAGE, ( _, messageObj: IShellMessage ) => {
            console.log( terminalSessions.has( messageObj.shellId ), messageObj.shellId );
            /*            if ( !terminalSessions.has(messageObj.shellId) ) {
             console.log("Shell not present", terminalSessions, messageObj.shellId)
             return;}*/

            const msg = messageObj.message.replaceAll( '\n', '\r\n' );

            if ( messageObj.target === 'stderr' )
                defaultTerminal.write( '\x1b[31m' + msg + '\x1b[0m' );
            else
                defaultTerminal.write( msg );
        } );
        if ( !shellId && sessionId )
            window.api.sftp.shell.create( sessionId );
    }, [ sessionId, shellId, terminalSessions ] );

    if ( !terminalVisible )
        return null;

    return ( <ResizableContainer
        direction="vertical"
        className="flex flex-col w-full h-full"
        min={ 50 } max={ window.innerHeight / 1.5 } margin={ 10 } size={ terminalSize }
        onResizeEnd={ ( size ) => {
            setTerminalSize( size );
            fitAddon.fit();
        } }
        sides={ [ 'top' ] }>
        <div className="grid py-0.5 items-center border-b-[1px] border-solid border-primary"
             style={ {
                 gridTemplateColumns: 'auto 1fr auto auto'
             } }>
            <span className="text-secondary py-1 px-2 text-sm">Terminals</span>
            <div className="relative w-full h-full overflow-x-scroll">
                <div
                    className="absolute left-0 top-0 w-full h-full flex flex-row justify-start items-center hide-scrollbar">
                    { Array.from( terminalSessions ).map( ( [ sessionId, sessionName ], idx ) => (
                        <ShellSession shellId={ sessionId } sessionId={ sessionId } sessionName={ sessionName }
                                      key={ idx } />
                    ) ) }
                </div>
            </div>
            <PlusIcon className={ InteractiveIconClasses }
                      onClick={ () => window.api.sftp.shell.create( sessionId! ) }
                      size={ InteractiveIconSize } />
            <div onClick={ () => setMaximized( ( !isMaximized ) ) }
                 className={ 'flex ml-auto ' + InteractiveIconClasses }>
                { isMaximized ?
                  <MinimizeIcon size={ InteractiveIconSize - 8 } strokeWidth={ 2 } />
                              :
                  <MaximizeIcon size={ InteractiveIconSize - 8 } strokeWidth={ 2 } />
                }
            </div>
        </div>
        <div className="grow min-h-1 relative">
            <div className="py-2 px-3 absolute w-full h-full"
                 ref={ terminalContainerRef } />
        </div>
    </ResizableContainer> );
}

function ShellSession( props: { shellId: string, sessionId: string, sessionName: string } ) {

    const { shellId, setShellID } = useContext( SFTPContext );

    return (
        <ContextMenu<HTMLDivElement> items={ [
            { type: 'item', title: 'Rename', onClick: () => console.log( 'Rename' ) },
            { type: 'item', title: 'Clear', onClick: () => console.log( 'Clear' ) },
            {
                type:    'item',
                title:   'Close',
                shortcut: 'Meta+W',
                onClick: () => window.api.sftp.shell.destroy( props.sessionId, props.shellId )
            }
        ] }>
            { ( ref ) => (
                <div
                    ref={ ref }
                    className={ `rounded-lg flex my-0.5 mx-1 flex-row justify-center items-center gap-2 py-1 px-4 group hover:bg-hover ${ ( props.shellId === shellId ) ? 'bg-secondary' : 'bg-primary' }` }>
                    <Renamable
                        className="text-secondary group-hover:text-secondary-hover text-sm hover:cursor-pointer text-nowrap"
                        onClick={ () => setShellID( props.shellId ) }
                        initialValue={ props.sessionName }
                    />
                    <div className="hover:brightness-110"
                         onClick={ () => window.api.sftp.shell.destroy( props.sessionId, props.shellId ) }>
                        <XIcon size={ 16 } />
                    </div>
                </div>
            ) }
        </ContextMenu>
    );
}
