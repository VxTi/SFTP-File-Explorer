import '@renderer/util/services/Services'

import { createRoot }          from 'react-dom/client'
import { App }                 from './App'
import { PopupProvider }       from "@renderer/contexts/Popups";
import { SFTPContextProvider } from "@renderer/contexts/SFTP";
import { ContextMenuProvider } from "@renderer/contexts/ContextMenu";

import '@renderer/resources/styles/theme.css'
import '@renderer/resources/styles/index.css'

createRoot(document.getElementById('root') as HTMLElement).render(
    <ContextMenuProvider>
        <PopupProvider>
            <SFTPContextProvider>
                <App/>
            </SFTPContextProvider>
        </PopupProvider>
    </ContextMenuProvider>
);
