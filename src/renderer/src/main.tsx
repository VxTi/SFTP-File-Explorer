import '@renderer/util/services/Services';
import { ContextMenuProvider } from '@renderer/contexts/ContextMenu';

import '@renderer/resources/styles/theme.css';
import { PopupProvider }       from '@renderer/contexts/Popups';
import { SFTPContextProvider } from '@renderer/contexts/SFTP';

import { createRoot } from 'react-dom/client';
import { App }        from './App';
import '@renderer/resources/styles/index.css';

createRoot( document.getElementById( 'root' ) as HTMLElement ).render(
    <ContextMenuProvider>
        <SFTPContextProvider>
            <PopupProvider>
                <App />
            </PopupProvider>
        </SFTPContextProvider>
    </ContextMenuProvider>
);
