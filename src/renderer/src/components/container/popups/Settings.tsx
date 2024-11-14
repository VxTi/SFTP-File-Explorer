/**
 * @fileoverview Settings.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 10 - 14:12
 */
import { XIcon }               from "lucide-react";
import { PopupContext }        from "@renderer/contexts/PopupContext";
import { useContext }          from "react";
import { getThemes, setTheme } from "@renderer/services/ThemeService";
import { SelectionMenu }       from "@renderer/components/interactive/SelectionMenu";

export function Settings() {

    const { setPopup } = useContext(PopupContext);

    return (
        <div className="text-primary flex flex-col justify-start items-stretch">
            <div className="grid grid-cols-3 mb-4 items-center">
                <h3 className="text-center col-start-2 text-xl font-bold font-satoshi">Settings</h3>
                <XIcon size={32} className="justify-self-end rounded-full hover:bg-hover p-1"
                       onClick={() => setPopup(undefined)}/>
            </div>
            <SelectionMenu title="Theme"
                           current={localStorage.getItem('theme') ?? ''}
                           options={[ {
                               title: 'System Dark',
                               value: ''
                           }, ...getThemes().map(theme => ({ title: theme, value: theme })) ]}
                           onSelect={theme => {
                               setTheme(theme.value);
                           }}/>
        </div>
    )
}
