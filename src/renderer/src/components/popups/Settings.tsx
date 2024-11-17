/**
 * @fileoverview Settings.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 10 - 14:12
 */
import { getThemes, setTheme } from "@renderer/util/services/ThemeService";
import { SelectionMenu }       from "@renderer/components/interactive/SelectionMenu";
import { PopupHeader }         from "@renderer/components/popups/PopupHeader";
import { Switch }              from "@renderer/components/interactive/Switch";

export function Settings() {

    return (
        <div className="text-primary flex flex-col justify-start items-stretch gap-2">
            <PopupHeader title="Settings"/>
            <SelectionMenu title="Theme"
                           current={localStorage.getItem('theme') ?? ''}
                           options={[ {
                               title: 'System Dark',
                               value: ''
                           }, ...getThemes().map(theme => ({ title: theme, value: theme })) ]}
                           onSelect={theme => {
                               setTheme(theme.value);
                           }}/>
            <Switch description="Automatically restore last session on startup"/>
        </div>
    )
}
