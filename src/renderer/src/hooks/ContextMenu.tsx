/**
 * @fileoverview ContextMenu.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 14:26
 */
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
} from "react";

interface ContextMenuItemBase<T> {
    type: T
}

export interface ContextMenuDivider extends ContextMenuItemBase<'divider'> {}

export interface ContextMenuItem extends ContextMenuItemBase<'item'> {
    name: string;
    icon: string;
    shortcut?: string;
    onClick: () => void;
}

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
export function ContextMenu<T extends HTMLElement>(props: {
    children: (childRef?: RefObject<T>) => ReactNode,
    items: (ContextMenuItem | ContextMenuDivider)[]
}) {

    const { setContextMenu } = useContext(ContextMenuContext);
    const forwardedElementRef = useRef<T>(null);

    useEffect(() => {
        if ( !forwardedElementRef || !forwardedElementRef.current )
            return;

        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            setContextMenu(<ContextMenuContainer originX={event.clientX} originY={event.clientY} items={props.items}/>);
        };

        forwardedElementRef.current.addEventListener('contextmenu', handleContextMenu);

        return () => {
            forwardedElementRef.current?.removeEventListener('contextmenu', handleContextMenu);
        }

    }, [ forwardedElementRef, props.children ]);

    return (
        <>
            {props.children(forwardedElementRef)}
        </>
    );
}

/**
 * ContextMenuContainer component.
 * This component represents the actual context menu,
 * and houses the items that are shown in the context menu.
 * @param props.items - The items to show in the context menu
 */
function ContextMenuContainer(props: {
    items: (ContextMenuItem | ContextMenuDivider)[],
    originX: number,
    originY: number
}) {

    const { setContextMenu } = useContext(ContextMenuContext);
    const ctxMenuRef         = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ( !ctxMenuRef.current )
            return;

        const dimensions = ctxMenuRef.current.getBoundingClientRect();

        const handleClick = (event: MouseEvent) => {
            if ( !ctxMenuRef.current || (
                event.clientX < dimensions.left ||
                event.clientX > dimensions.right ||
                event.clientY < dimensions.top ||
                event.clientY > dimensions.bottom
            ) )
                setContextMenu(null);
        }

        console.log('Adding event listener');

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        }
    }, [ ctxMenuRef ]);

    return (
        <div className="absolute z-50 bg-primary border-primary border-[1px] shadow-lg gap-2 rounded-lg px-3 py-1"
             ref={ctxMenuRef}
             style={{
                 transform: `translate(${props.originX}px, ${props.originY}px)`
             }}>
            {props.items.map((item, index) => {
                if ( item.type === 'divider' )
                    return <div key={index} className="bg-border w-full h-[1px] my-1"/>;

                const shortcutElement = item.shortcut ? (
                    <span className="text-xs text-secondary">{item.shortcut.replaceAll('Meta', '⌘')
                                                                  .replaceAll('+', '')}</span>
                ) : null;

                return (
                    <div key={index}
                         className="grid text-primary items-center hover:bg-primary hover:text-secondary cursor-pointer"
                         onClick={item.onClick}
                         style={{
                             gridTemplateColumns: '40px 1fr 40px'
                         }}
                    >
                        <span className={`icon-${item.icon} w-4 h-4 mr-2`}/>
                        <span className="text-sm">{item.name}</span>
                        <span className="text-xs text-secondary justify-self-end">{shortcutElement}</span>
                    </div>
                )
            })}
        </div>
    )
}

export function ContextMenuProvider(props: { children: ReactNode }) {

    const [ contextMenu, setContextMenu ] = useState<ReactNode>(null);

    return (
        <ContextMenuContext.Provider value={{ contextMenu, setContextMenu }}>
            {props.children}
        </ContextMenuContext.Provider>
    );
}
