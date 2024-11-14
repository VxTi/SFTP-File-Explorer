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
import { byteValueToString }     from "@renderer/util/StringUtils";


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
        return byteValueToString(props.file.size);
    }, [ props.file.size ]);

    return (
        <ContextMenu<HTMLButtonElement> items={[
            { type: 'item', name: 'Open', onClick: () => console.log('Open') },
            { type: 'item', name: 'Edit', onClick: () => console.log('Edit') },
            { type: 'divider' },
            { type: 'item', name: 'Copy', onClick: () => console.log('Copy') },
            { type: 'item', name: 'Cut', onClick: () => console.log('Cut') },
            { type: 'item', name: 'Paste', onClick: () => console.log('Paste') },
            { type: 'divider' },
            { type: 'item', name: 'Delete', onClick: () => console.log('Delete') },
            { type: 'item', name: 'Rename', onClick: () => console.log('Rename') },
            { type: 'divider' },
            { type: 'item', name: 'Properties', onClick: () => console.log('Properties') }
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
                        <span className="text-sm text-nowrap hide-scrollbar text-primary group-focus:text-secondary">
                            {props.file.name}
                        </span>
                    </div>
                    <div className="flex flex-row group-focus:text-primary text-secondary">
                        <span className="text-xs">{fileSize}</span>
                    </div>
                </button>
            )}
        </ContextMenu>
    )
}
