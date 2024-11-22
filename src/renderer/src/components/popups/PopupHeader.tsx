/**
 * @fileoverview PopupHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 17 - 15:43
 */
import { PopupContext } from '@renderer/contexts/Popups';
import { XIcon }        from 'lucide-react';
import { useContext }   from 'react';

/**
 * Popup header component.
 * @param props - title, onClose
 * @constructor
 */
export function PopupHeader(props: { title: string, onClose?: () => void }) {
    const { setPopup } = useContext(PopupContext);
    return (
        <div className="grid mb-3 items-center"
             style={ { gridTemplateColumns: '60px 1fr 60px' } }>
            <h3 className="text-center col-start-2 text-xl font-bold font-satoshi select-none">{props.title}</h3>
            <XIcon size={ 32 }
                   className="justify-self-end rounded-md hover:bg-hover active:bg-tertiary p-1 cursor-pointer"
                   onClick={() => {
                       setPopup(undefined);
                       props.onClose?.();
                   } } />
        </div>
    );
}
