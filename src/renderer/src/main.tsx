import './services/Services'

import { createRoot }            from 'react-dom/client'
import { App }                   from './App'
import { WindowContentProvider } from "@renderer/contexts/WindowContent";
import { PopupProvider }         from "@renderer/contexts/Popups";
import { SFTPContextProvider }   from "@renderer/contexts/SFTP";

import './styles/theme.css'
import './styles/index.css'
import { ContextMenuProvider } from "@renderer/contexts/ContextMenu";

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
