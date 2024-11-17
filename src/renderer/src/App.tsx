import { useContext, useEffect }   from "react";
import { NavigationContainer }     from "@renderer/components/container/Navigator";
import { ContextMenuContext }      from "@renderer/contexts/ContextMenu";
import EVENTS                      from "@/common/events.json";
import { Settings }                from "@renderer/components/popups/Settings";
import { PopupContext }            from "@renderer/contexts/Popups";
import { setTheme }                from "@renderer/util/services/ThemeService";
import { BasicApplicationContent } from "@renderer/components/container/BasicApplicationContent";

export function App() {

    const { contextMenu } = useContext(ContextMenuContext);
    const { setPopup }    = useContext(PopupContext);

    useEffect(() => {

        if ( window.localStorage.getItem('theme') ) {
            setTheme(window.localStorage.getItem('theme') as string);
        }

        window.addEventListener(EVENTS.RENDERER.SHOW_SETTINGS, () => {
            setPopup({ content: <Settings/>, uid: 'settings' });
        });
    }, []);

    return (
        <div className="flex flex-col justify-start items-stretch grow" style={{
            textRendering: 'optimizeLegibility',
        }}>
            {contextMenu}
            <NavigationContainer position='header' trulyIsTheNavigator/>
            <BasicApplicationContent/>
            <NavigationContainer position='footer'/>
        </div>
    )
}
