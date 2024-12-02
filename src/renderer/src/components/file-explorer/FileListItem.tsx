/**
 * @fileoverview FileListItem.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 09:35
 */
import { IFileEntry, IFileType } from '@/common/file-information';
import { IClient }               from '@/common/ssh-definitions';
import { ContextMenu }           from '@renderer/contexts/ContextMenu';
import { byteValueToString }     from '@renderer/util/StringUtils';
import { FileIcon, FolderIcon }  from 'lucide-react';
import { ReactNode, useMemo }    from 'react';

const FileEntryTypeElements: Record<IFileType, ReactNode> = {
    'directory':        <FolderIcon size={ 16 } />,
    'symlink':          <FolderIcon size={ 16 } />,
    'block-device':     <FolderIcon size={ 16 } />,
    'file':             <FileIcon size={ 16 } />,
    'character-device': <FolderIcon size={ 16 } />
};

/**
 * FileEntry component.
 * This component represents a single file entry in the file explorer.
 * @param props
 * @constructor
 */
export function FileListItem( props: { file: IFileEntry, client: IClient, className?: string } ) {

    const fileSize = useMemo( () => {
        if ( props.file.type === 'directory' )
            return '';
        return byteValueToString( props.file.size );
    }, [ props.file.size ] );

    return (
        <ContextMenu<HTMLButtonElement> items={ [
            (
                props.file.type === 'directory' ? {
                    type:    'item',
                    title:   'Open',
                    onClick: () => props.client.setCwd( props.file.path + window.api.fs.separator + props.file.name )
                } : null
            ),
            (
                props.file.type === 'directory' ? null :
                { type: 'item', title: 'Edit', onClick: () => console.log( 'Edit' ), icon: 'edit' }
            ),
            { type: 'divider' },
            { type: 'item', title: 'Copy', onClick: () => console.log( 'Copy' ) },
            { type: 'item', title: 'Cut', onClick: () => console.log( 'Cut' ) },
            { type: 'item', title: 'Paste', onClick: () => console.log( 'Paste' ) },
            { type: 'divider' },
            { type: 'item', title: 'Delete', onClick: () => console.log( 'Delete' ), icon: 'delete' },
            { type: 'item', title: 'Rename', onClick: () => console.log( 'Rename' ) },
            { type: 'divider' },
            { type: 'item', title: 'Properties', onClick: () => console.log( 'Properties' ) }
        ] }>
            { ( ref ) => (
                <button
                    ref={ ref }
                    className={ `grid items-center px-2 mx-1 py-0.5 gap-1 hover:bg-hover bg-background hover:cursor-pointer group focus:bg-special focus:text-secondary rounded-md ${ props.className ?? '' }` }
                    style={ {
                        gridTemplateColumns: 'auto 1fr auto'
                    } }
                    onDoubleClick={ () => {
                        if ( props.file.type === 'directory' ) {
                            props.client.setCwd( props.file.path + window.api.fs.separator + props.file.name );
                            console.log( 'Double clicked on directory', props.file );
                        }
                    } }
                >
                    { FileEntryTypeElements[ props.file.type ] }
                    <div className="flex flex-row justify-start items-center w-full overflow-x-scroll pl-0.5 pr-1">
                        <span
                            className="text-sm text-nowrap hide-scrollbar text-primary group-focus:text-secondary font-satoshi">
                            { props.file.name }
                        </span>
                    </div>
                    <div className="flex flex-row group-focus:text-primary text-secondary">
                        <span className="text-xs">{ fileSize }</span>
                    </div>
                </button>
            ) }
        </ContextMenu>
    );
}
