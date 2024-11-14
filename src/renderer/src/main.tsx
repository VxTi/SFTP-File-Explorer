import './services/Services'

import { createRoot }            from 'react-dom/client'
import { App }                   from './App'
import { WindowContentProvider } from "@renderer/contexts/WindowContentContext";
import { PopupProvider }         from "@renderer/contexts/PopupContext";
import { SFTPContextProvider }   from "@renderer/contexts/SFTPContextProvider";

import './styles/theme.css'
import './styles/index.css'
import { ContextMenuProvider }   from "@renderer/hooks/ContextMenu";

createRoot(document.getElementById('root') as HTMLElement).render(
    <ContextMenuProvider>
        <PopupProvider>
            <SFTPContextProvider>
                <WindowContentProvider>
                    <App/>
                </WindowContentProvider>
            </SFTPContextProvider>
        </PopupProvider>
    </ContextMenuProvider>
);
