/**
 * @fileoverview FileList.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 09:06
 */
import { IFileEntry }          from "@/common/file-information";
import { IClient }             from "@/common/ssh-definitions";
import { useEffect, useState } from "react";
import { LoadingRotor }        from "@renderer/components/LoadingRotor";
import { FileListItem }        from "@renderer/components/file-explorer/FileListItem";


export function FileExplorerOrigin(props: { client: IClient }) {

    const [ files, setFiles ] = useState<IFileEntry[] | undefined>(undefined);

    useEffect(() => {
        props.client.listFiles(props.client.cwd)
             .then((files) => {
                 setFiles(files.filter((file) => file.name.charAt(0) !== '.'));
             })
             .catch((error) => {
                 console.error('Failed to list files', error);
                 setFiles([]);
             });
    }, [ props.client.cwd ]);

    return (
        <div className="flex flex-col justify-start items-stretch grow relative">
            {
                !files ? <LoadingRotor className="place-self-center grow"/> : (
                    <div
                        className="absolute hide-scrollbar left-0 top-0 w-full h-full overflow-y-scroll flex flex-col justify-start items-stretch gap-0.5">
                        {props.client.cwd !== '/' &&
                            <FileListItem client={props.client} className="sticky top-0" file={{
                                type: 'directory',
                                name: '..',
                                path: ''
                            } as IFileEntry}/>}
                        {files.map((file, index) => {
                            return <FileListItem key={index} client={props.client} file={file}/>
                        })}
                    </div>
                )
            }
        </div>
    )
}
