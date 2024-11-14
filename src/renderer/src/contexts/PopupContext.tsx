/**
 * @fileoverview PopupContext.tsx
 * @author Luca Warmenhoven
 * @date Created on Monday, November 04 - 10:26
 */
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import {
    useClickOutside
}                                                                                                      from "@renderer/hooks/ClickOutside";

type PopupType = {
    uid: string,
    priority?: number,
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
        setPopup: () => void 0,
    }
);

export function PopupProvider(props: { children: ReactNode }) {

    const [ popup, setPopup ] = useState<PopupType | undefined>(undefined);

    return (
        <PopupContext.Provider value={{ popup, setPopup }}>
            {props.children}
            <PopupWrapper/>
        </PopupContext.Provider>
    );
}

function PopupWrapper() {
    const { popup, setPopup } = useContext(PopupContext);

    useEffect(() => {

        const handleKeydown = (event: KeyboardEvent) => {

            if ( event.key === 'Escape' ) {
                setPopup(undefined);
            }
        }

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        }

    }, [ popup ]);

    if ( !popup ) return null;

    return (
        <div
            className={"absolute flex flex-col inset-0 w-full h-full bg-black/50 z-20 " + (popup.type === 'lowerscreen' ? "justify-end items-stretch" : "justify-center items-center")}>
            <PopupBody>
                {popup.content}
            </PopupBody>
        </div>
    );
}

function PopupBody(props: { children: ReactNode }) {

    const { setPopup } = useContext(PopupContext);
    const popupRef     = useRef<HTMLDivElement>(null);
    useClickOutside(popupRef, () => setPopup(undefined));

    return (
        <div
            className="flex flex-col justify-start items-stretch bg-primary border-[1px] border-primary p-4 z-20 animate-in slide-in-from-bottom-3 fade-in-10 duration-500"
            ref={popupRef}>
            {props.children}
        </div>
    )
}

