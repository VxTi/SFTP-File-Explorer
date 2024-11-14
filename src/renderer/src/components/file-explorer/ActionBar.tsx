/**
 * @fileoverview ActionBar.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 09:04
 */
import { IClient }                                                     from "@/common/ssh-definitions";
import { useCallback, useState }                                       from "react";
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, RefreshCcwIcon } from "lucide-react";
import { InteractiveIconClasses, InteractiveIconSize }                 from "@renderer/components/Icons";

/**
 * ActionBar component.
 * This component resides at the top of the file explorer and allows the user to navigate through the file system.
 * @param props.client - The client instance to navigate with.
 */
export function ActionBar(props: { client: IClient }) {

    const [ isEditing, setEditing ] = useState<boolean>(false);

    const [ path, setPath ] = useState(props.client.cwd);

    const PathSegments = useCallback(() => {
        if ( props.client.cwd === window.api.fs.separator || props.client.cwd === '' )
            return <ChevronRightIcon size={15}/>
        return props.client.cwd.split(window.api.fs.separator).map((part, index, array) => {
            return (
                <div key={index} className="flex flex-row justify-start items-center gap-1">
                            <span
                                className="text-secondary hover:underline select-none hover:cursor-pointer p-0.5">{part}</span>
                    {index < array.length - 1 && <ChevronRightIcon size={15}/>}
                </div>
            );
        });
    }, [ props.client.cwd ]);

    return (
        <div className="grid items-center text-primary text-sm w-full h-full p-1"
             style={{ gridTemplateColumns: '1fr 3fr 1fr' }}
        >
            <div className="pr-1 mr-1 gap-1 flex justify-start items-center">
                <ChevronLeftIcon className={InteractiveIconClasses} size={InteractiveIconSize}/>
                <ChevronRightIcon className={InteractiveIconClasses} size={InteractiveIconSize}/>
                <HomeIcon className={InteractiveIconClasses} size={InteractiveIconSize}
                          onClick={() => props.client.setCwd(props.client.homeDir)}
                />
            </div>
            <div
                className="flex place-self-center justify-start items-center text-xs bg-primary rounded-full px-2 w-full h-full my-1 hover:bg-hover overflow-x-scroll"
                onDoubleClick={() => setEditing( !isEditing)}
            >
                {isEditing ? (
                    <input
                        type="text"
                        className='bg-transparent p-0.5 border-none text-primary outline-none mx-2'
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        onKeyDown={(e) => {
                            if ( e.key === 'Escape' || e.key === 'Enter' ) {
                                setEditing(false);
                                if ( e.key === 'Enter' )
                                    props.client.setCwd(path);
                            }
                        }}
                        onBlur={() => {
                            setEditing(false);
                            props.client.setCwd(path);
                        }}
                        autoFocus
                    />
                ) : (<PathSegments/>)}
            </div>
            <div className="flex flex-row justify-end items-center gap-1">
                <RefreshCcwIcon className={InteractiveIconClasses} size={InteractiveIconSize}
                />
            </div>
        </div>
    )
}
