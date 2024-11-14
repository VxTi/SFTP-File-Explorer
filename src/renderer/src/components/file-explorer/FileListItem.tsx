/**
 * @fileoverview FileListItem.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 09:35
 */
import { IFileEntry, IFileType } from "@/common/file-information";
import { ReactNode, useMemo }    from "react";
import { FileIcon, FolderIcon }  from "lucide-react";
import { IClient }               from "@/common/ssh-definitions";
import { ContextMenu }           from "@renderer/hooks/ContextMenu";
import { Renamable }             from "@renderer/components/interactive/Renamable";


const FileEntryTypeElements: Record<IFileType, ReactNode> = {
    'directory': <FolderIcon size={16}/>,
    'symlink': <FolderIcon size={16}/>,
    'block-device': <FolderIcon size={16}/>,
    'file': <FileIcon size={16}/>,
    'character-device': <FolderIcon size={16}/>,
};

/**
 * FileEntry component.
 * This component represents a single file entry in the file explorer.
 * @param props
 * @constructor
 */
export function FileListItem(props: { file: IFileEntry, client: IClient, className?: string }) {

    const fileSize = useMemo(() => {
        if ( props.file.type === 'directory' )
            return '';
        if ( props.file.size < 1024 )
            return props.file.size + ' bytes';
        if ( props.file.size < 1024 * 1024 )
            return (props.file.size / 1024).toFixed(2) + ' KB';
        if ( props.file.size < 1024 * 1024 * 1024 )
            return (props.file.size / 1024 / 1024).toFixed(2) + ' MB';
        return (props.file.size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }, [ props.file.size ]);

    return (
        <ContextMenu<HTMLButtonElement> items={[
            { type: 'item', name: 'Open', icon: 'open', onClick: () => console.log('Open') },
            { type: 'item', name: 'Edit', icon: 'edit', onClick: () => console.log('Edit') },
            { type: 'divider' },
            { type: 'item', name: 'Copy', icon: 'copy', onClick: () => console.log('Copy') },
            { type: 'item', name: 'Cut', icon: 'cut', onClick: () => console.log('Cut') },
            { type: 'item', name: 'Paste', icon: 'paste', onClick: () => console.log('Paste') },
            { type: 'divider' },
            { type: 'item', name: 'Delete', icon: 'delete', onClick: () => console.log('Delete') },
            { type: 'item', name: 'Rename', icon: 'rename', onClick: () => console.log('Rename') },
            { type: 'divider' },
            { type: 'item', name: 'Properties', icon: 'properties', onClick: () => console.log('Properties') }
        ]}>
            {(ref) => (
                <button
                    ref={ref}
                    className={`grid items-center px-2 mx-1 py-0.5 gap-1 hover:bg-hover bg-background hover:cursor-pointer group focus:bg-special focus:text-secondary rounded-md ${props.className ?? ''}`}
                    style={{
                        gridTemplateColumns: 'auto 1fr auto'
                    }}
                    onDoubleClick={() => {
                        if ( props.file.type === 'directory' ) {
                            props.client.setCwd(props.file.path + window.api.fs.separator + props.file.name);
                            console.log('Double clicked on directory', props.file);
                        }
                    }}
                >
                    {FileEntryTypeElements[ props.file.type ]}
                    <div className="flex flex-row justify-start items-center w-full overflow-x-scroll pl-0.5 pr-1">
                        <Renamable className="text-sm text-nowrap hide-scrollbar text-primary group-focus:text-secondary" initialValue={props.file.name} />
                    </div>
                    <div className="flex flex-row group-focus:text-primary text-secondary">
                        <span className="text-xs">{fileSize}</span>
                    </div>
                </button>
            )}
        </ContextMenu>
    )
}
