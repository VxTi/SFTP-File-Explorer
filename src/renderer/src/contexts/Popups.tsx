/**
 * @fileoverview Popups.tsx
 * @author Luca Warmenhoven
 * @date Created on Monday, November 04 - 10:26
 */
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";

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
            if ( event.key !== 'Escape' ) return;

            setPopup(undefined);
        }

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        }

    }, [ popup, setPopup ]);

    if ( !popup ) return null;

    return (
        <div
            className={"absolute flex flex-col inset-0 w-full h-full backdrop-blur-sm bg-black/50 z-20 " + (popup.type === 'lowerscreen' ? "justify-end items-stretch" : "justify-center items-center")}>
            <PopupBody>
                {popup.content}
            </PopupBody>
        </div>
    );
}

function PopupBody(props: { children: ReactNode }) {
    return (
        <div
            className="flex flex-col justify-start items-stretch max-h-screen bg-primary border-[1px] border-primary p-4 z-20 animate-in slide-in-from-bottom-2 zoom-in-95 fade-in-10 duration-300 rounded-xl">
            {props.children}
        </div>
    )
}

