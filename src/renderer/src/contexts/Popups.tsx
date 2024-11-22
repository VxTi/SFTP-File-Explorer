/**
 * @fileoverview Popups.tsx
 * @author Luca Warmenhoven
 * @date Created on Monday, November 04 - 10:26
 */
import {
    createContext,
    Dispatch,
    MouseEvent,
    ReactNode,
    RefObject,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';

type PopupType = {
    uid: string,
    content: ReactNode,
    type?: 'fullscreen' | 'lowerscreen',
    dismissNode?: ReactNode,
    onDismiss?: () => void
};

export const PopupContext = createContext<{
    popup: PopupType | undefined,
    setPopup: Dispatch<SetStateAction<PopupType | undefined>>,
}>(
    {
        popup: undefined,
        setPopup: () => void 0
    }
);

export function PopupProvider( props: { children: ReactNode } ) {

    const [ popup, setPopup ] = useState<PopupType | undefined>( undefined );

    return (
        <PopupContext.Provider value={ { popup, setPopup } }>
            { props.children }
            <PopupWrapper />
        </PopupContext.Provider>
    );
}

function PopupWrapper() {
    const { popup, setPopup } = useContext( PopupContext );
    const containerRef = useRef<HTMLDivElement>( null );

    useEffect( () => {

        const handleKeydown = ( event: KeyboardEvent ) => {
            if ( event.key !== 'Escape' ) return;

            setPopup( undefined );
        };

        window.addEventListener( 'keydown', handleKeydown );

        return () => {
            window.removeEventListener( 'keydown', handleKeydown );
        };

    }, [ popup, setPopup ] );

    const handleMouseDown = useCallback( ( event: MouseEvent ) => {
        if ( !containerRef.current ) return;

        const containerStyles = containerRef.current.style;
        const dimensions = containerRef.current.getBoundingClientRect();

        const [ initialX, initialY ] = [ event.clientX - dimensions.left, event.clientY - dimensions.top ];
        let [ translatedX, translatedY ] = [ 0, 0 ];

        const handleMouseMove = ( event: globalThis.MouseEvent ) => {
            translatedX = event.clientX - initialX;
            translatedY = event.clientY - initialY;
            containerStyles.left = Math.max( Math.min( translatedX, window.innerWidth - dimensions.width ), 0 ) + 'px';
            containerStyles.top = Math.max( Math.min( translatedY, window.innerHeight - dimensions.height ), 0 ) + 'px';
        };

        const handleMouseUp = () => {
            window.removeEventListener( 'mouseup', handleMouseUp );
            window.removeEventListener( 'mousemove', handleMouseMove );
        };

        window.addEventListener( 'mousemove', handleMouseMove );
        window.addEventListener( 'mouseup', handleMouseUp );

        return () => {
            window.removeEventListener( 'mouseup', handleMouseUp );
            window.removeEventListener( 'mousemove', handleMouseMove );
        };
    }, [ containerRef.current ] );

    if ( !popup ) return null;

    return (
        <div
            className={ 'absolute flex flex-col inset-0 w-full h-full backdrop-blur-sm bg-black/50 z-20 ' + ( popup.type === 'lowerscreen' ? 'justify-end items-stretch' : 'justify-center items-center' ) }>
            <PopupBody refObj={ containerRef } handleMouseDown={ handleMouseDown }>
                { popup.content }
            </PopupBody>
        </div>
    );
}

function PopupBody( props: {
    children: ReactNode,
    refObj: RefObject<HTMLDivElement>,
    handleMouseDown: ( evt: MouseEvent ) => void
} ) {

    return (
        <div ref={ props.refObj }
             onMouseDownCapture={ props.handleMouseDown }
             className="absolute flex flex-col justify-start items-stretch max-h-screen bg-primary border-[1px] border-primary p-4 z-20 animate-in slide-in-from-bottom-2 zoom-in-95 fade-in-10 duration-200 rounded-xl transition-none">
            { props.children }
        </div>
    );
}

