import { EVENTS, InternalError }   from '@/common/app';
import { BasicApplicationContent } from '@renderer/components/container/BasicApplicationContent';
import { NavigationContainer }     from '@renderer/components/container/Navigator';
import { Settings }                from '@renderer/components/popups/Settings';
import { ContextMenuContext }      from '@renderer/contexts/ContextMenu';
import { PopupContext }            from '@renderer/contexts/Popups';
import { setTheme }                from '@renderer/util/services/ThemeService';
import { useContext, useEffect }   from 'react';

export function App() {

    const { contextMenu } = useContext( ContextMenuContext );
    const { setPopup }    = useContext( PopupContext );

    useEffect( () => {

        window.api.on( EVENTS.MESSAGES.INTERNAL_ERROR, ( _, error: InternalError ) => {
            console.error( `Internal Error - ${ error.error }`, error.details || '' );
        } );

        const handleNotification = ( evt: any ) => {
            const element     = document.createElement( 'div' );
            element.classList.add(
                'animate-in', 'fade-in-10', 'rounded-lg',
                'transition-all', 'duration-300',
                'absolute', 'bg-tertiary', 'text-primary',
                'border-[1px]', 'border-primary', 'py-1', 'px-2'
            );
            element.style.left = '0px';
            element.style.top = '0px';
            element.innerText = evt.detail.message;
            document.body.appendChild( element );
            window.setTimeout( () => {
                element.style.opacity = '0';
                element.style.maxHeight = '0px';
                window.setTimeout( () => {
                    element?.remove();
                }, 300 );
            }, 2000 );
        };

        const showSettings = () => setPopup( { content: <Settings />, uid: 'settings' } );

        window.addEventListener( 'notification', handleNotification );

        if ( window.localStorage.getItem( 'theme' ) ) {
            setTheme( window.localStorage.getItem( 'theme' ) as string );
        }

        window.addEventListener( EVENTS.RENDERER.SHOW_SETTINGS, showSettings );

        return () => {
            window.removeEventListener( 'notification', handleNotification );
            window.removeEventListener( EVENTS.RENDERER.SHOW_SETTINGS, showSettings );
        };
    }, [] );

    return (
        <div className="flex flex-col justify-start items-stretch grow" style={ {
            textRendering: 'optimizeLegibility'
        } }>
            { contextMenu }
            <NavigationContainer position="header" trulyIsTheNavigator />
            <BasicApplicationContent />
            <NavigationContainer position="footer" />
        </div>
    );
}
