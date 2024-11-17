/**
 * @fileoverview PopupHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 17 - 15:43
 */
import { XIcon }        from "lucide-react";
import { useContext }   from "react";
import { PopupContext } from "@renderer/contexts/Popups";

/**
 * Popup header component.
 * @param props - title, onClose
 * @constructor
 */
export function PopupHeader(props: { title: string, onClose?: () => void }) {
    const { setPopup } = useContext(PopupContext);
    return (
        <div className="grid mb-4 items-center"
             style={{ gridTemplateColumns: '60px 1fr 60px'}}>
            <h3 className="text-center col-start-2 text-xl font-bold font-satoshi">{props.title}</h3>
            <XIcon size={32} className="justify-self-end rounded-full hover:bg-hover p-1 cursor-pointer"
                   onClick={() => {
                       setPopup(undefined);
                       props.onClose?.();
                   }}/>
        </div>
    )
}
