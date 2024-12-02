/**
 * @fileoverview ContextMenu.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 14:26
 */
import { useClickOutside } from '@renderer/hooks/ClickOutside';
import {
    PencilRulerIcon,
    PlugZapIcon,
    SquarePen,
    Trash2Icon
}                          from 'lucide-react';
import {
    createContext,
    Dispatch,
    ReactNode,
    RefObject,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState
}                          from 'react';

interface ContextMenuItemBase<T> {
    type: T;
}

export type IconType = 'delete' | 'edit' | 'new' | 'info' | 'rename' | 'connect';

const ContextMenuIcons: Record<IconType, ReactNode> = {
    delete:  <Trash2Icon size={ 24 } />,
    edit:    <PencilRulerIcon size={ 24 } />,
    info:    undefined,
    new:     <SquarePen size={ 24 } />,
    rename:  undefined,
    connect: <PlugZapIcon size={ 24 } />
};

export interface ContextMenuDivider extends ContextMenuItemBase<'divider'> {}

export interface ContextMenuItem extends ContextMenuItemBase<'item'> {
    title: string;
    icon?: IconType;
    shortcut?: string;
    onClick: () => void;
}

type ContextMenuItemType = ContextMenuItem | ContextMenuDivider | null;

/**
 * ContextMenuContext definition.
 * This context provides the context menu and a setter for it.
 */
export const ContextMenuContext = createContext<{
    contextMenu: ReactNode,
    setContextMenu: Dispatch<SetStateAction<ReactNode>>
}>(
    { contextMenu: null, setContextMenu: () => 0 }
);

/**
 * ContextMenu element wrapper.
 * This component wraps an element and adds a context menu to it.
 * When the element is right-clicked, the context menu will be shown.
 * @param props.items - The items to show in the context menu
 * @constructor
 */
export function ContextMenu<T extends HTMLElement>( props: {
    children: ( childRef?: RefObject<T> ) => ReactNode,
    items: ContextMenuItemType[]
} ) {

    const { setContextMenu }  = useContext( ContextMenuContext );
    const forwardedElementRef = useRef<T>( null );

    useEffect( () => {
        if ( !forwardedElementRef || !forwardedElementRef.current )
            return;

        const handleContextMenu = ( event: MouseEvent ) => {
            event.preventDefault();
            event.stopPropagation();
            setContextMenu( <ContextMenuContainer originX={ event.clientX } originY={ event.clientY }
                                                  items={ props.items } /> );
        };

        forwardedElementRef.current.addEventListener( 'contextmenu', handleContextMenu );

        return () => {
            forwardedElementRef.current?.removeEventListener( 'contextmenu', handleContextMenu );
        };

    }, [ forwardedElementRef, props.children ] );

    return props.children( forwardedElementRef );
}

/**
 * ContextMenuContainer component.
 * This component represents the actual context menu,
 * and houses the items that are shown in the context menu.
 * @param props.items - The items to show in the context menu
 */
function ContextMenuContainer( props: {
    items: ContextMenuItemType[],
    originX: number,
    originY: number
} ) {

    const { setContextMenu } = useContext( ContextMenuContext );
    const ctxMenuRef         = useRef<HTMLDivElement>( null );
    useClickOutside( ctxMenuRef, () => setContextMenu( null ) );

    return (
        <div
            className="absolute z-50 bg-primary border-primary border-[1px] shadow-lg gap-2 rounded-lg py-0.5 px-1 w-[200px]"
            ref={ ctxMenuRef }
            style={ {
                transform: `translate(${ props.originX }px, ${ props.originY }px)`
            } }>
            { props.items.map( ( item, index ) => {
                if ( !item )
                    return null;
                if ( item.type === 'divider' )
                    return <div key={ index } className="bg-border w-full h-[1px] my-1" />;

                const shortcutElement = item.shortcut ? (
                    <span className="text-xs text-secondary">{ item.shortcut.replaceAll( 'Meta', '⌘' )
                                                                   .replaceAll( '+', '' ) }</span>
                ) : null;

                return (
                    <div key={ index }
                         className="grid text-primary items-center hover:bg-hover cursor-pointer rounded-md px-1 py-1"
                         onClick={ () => {
                             item.onClick();
                             setContextMenu( null );
                         } }
                         style={ {
                             gridTemplateColumns: '40px 1fr 40px'
                         } }>
                        <div
                            className="w-4 h-4 ml-2 mr-4 flex place-items-center">{ item.icon && ContextMenuIcons[ item.icon ] }</div>
                        <span className="text-sm">{ item.title }</span>
                        <span className="text-xs text-secondary justify-self-end">{ shortcutElement }</span>
                    </div>
                );
            } ) }
        </div>
    );
}

export function ContextMenuProvider( props: { children: ReactNode } ) {

    const [ contextMenu, setContextMenu ] = useState<ReactNode>( null );

    return (
        <ContextMenuContext.Provider value={ { contextMenu, setContextMenu } }>
            { props.children }
        </ContextMenuContext.Provider>
    );
}
