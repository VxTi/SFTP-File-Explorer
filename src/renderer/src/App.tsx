import { useContext, useEffect } from "react";
import { WindowContentContext } from "@renderer/contexts/WindowContentContext";
import { NavigationContainer }  from "@renderer/components/container/Navigator";
import { ContextMenuContext }   from "@renderer/hooks/ContextMenu";
import EVENTS                    from "@/common/ipc-events.json";
import { Settings }              from "@renderer/components/container/popups/Settings";
import { PopupContext }          from "@renderer/contexts/PopupContext";
import { setTheme }              from "@renderer/services/ThemeService";

export function App(): JSX.Element {

    const { content }     = useContext(WindowContentContext);
    const { contextMenu } = useContext(ContextMenuContext);
    const { setPopup }    = useContext(PopupContext);

    useEffect(() => {

        if ( window.localStorage.getItem('theme'))
        {
            setTheme(window.localStorage.getItem('theme') as string);
        }

        window.addEventListener(EVENTS.RENDERER.SHOW_SETTINGS, () => {
            setPopup({ content: <Settings/>, uid: 'settings' });
        });
    }, []);

    return (
        <div className="flex flex-col justify-start items-stretch grow">
            {contextMenu}
            <NavigationContainer position='header' trulyIsTheNavigator/>
            {content}
            <NavigationContainer position='footer'/>
        </div>
    )
}
