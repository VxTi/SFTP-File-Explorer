import { ICommandSnippet, ISSHSessionSecure }           from '@/common/ssh-definitions';
import { Form, FormInput, FormTextArea, SubmitButton }  from '@renderer/components/interactive/Form';
import { PopupHeader }                                  from '@renderer/components/popups/PopupHeader';
import { PopupContext }                                 from '@renderer/contexts/Popups';
import { SFTPContext }                                  from '@renderer/contexts/SFTP';
import { XIcon }                                        from 'lucide-react';
import { FormEvent, useCallback, useContext, useState } from 'react';

/**
 * Command snippet popup.
 * With this popup, one can create command snippets, that can be executed when one enters a SSH session.
 * @constructor
 */
export function CreateCommandSnippet( props: { snippet?: ICommandSnippet } ) {

    const [ statusMessage, setStatusMessage ] = useState<string>( '' );
    const { setPopup } = useContext( PopupContext );

    const handleSubmit = useCallback( ( event: FormEvent ) => {
        event.preventDefault();

        const target   = event.currentTarget as HTMLFormElement;
        const formData = new FormData( target );
        const formObject: Record<string, FormDataEntryValue> = Object.fromEntries( formData.entries() );

        if ( !formObject.title || ( formObject.title as string ).trim().length === 0 ) {
            setStatusMessage( 'Snippet must have a title' );
            return;
        }

        if ( !formObject.command || ( formObject.command as string ).trim().length === 0 ) {
            setStatusMessage( 'Command name is required' );
            return;
        }

        window.api.sftp.shell.snippets.create( {
                                                   title:        formObject.title,
                                                   command:      formObject.command,
                                                   runOnConnect: Object.values( formObject )
                                                                       .filter( entry =>
                                                                                    ( entry as string ) === 'on' ) as string[]
                                               } as Omit<ICommandSnippet, 'snippetId'> );

        setPopup( undefined );

    }, [] );

    const { sessions } = useContext( SFTPContext );

    return (
        <>
            <PopupHeader title={ props.snippet ? 'Edit Snippet' : 'Create Command Snippet' } />
            <span className="text-xs max-w-[400px] mx-auto mb-2 select-none">
                Command snippets can automatically ran when connected to a SSH session,
                or manually triggered whilst connected.
            </span>
            <Form onSubmit={ handleSubmit }>
                <FormInput type="text" name="title" label="Title"
                           defaultValue={ props.snippet?.title || '' }

                />
                <FormTextArea name="command" label="Commands"
                              className="font-mono"
                              rows={ 5 }
                              cols={ 60 }
                              defaultValue={ props.snippet?.command || '' }
                              style={ { resize: 'none' } } />
                { sessions.length > 0 && ( <>
                    <span>Run this script upon connect with session:</span>
                    <div className="flex flex-col justify-start items-stretch gap-2 py-1">

                        { sessions.map( ( session, index ) => (
                            <SessionEntry session={ session } key={ index } />
                        ) ) }
                    </div>
                </> ) }
                <span className="text-red-500 text-center text-sm h-5">{ statusMessage }</span>
                <SubmitButton title={ props.snippet ? 'Save snippet' : 'Add new snippet' } />
            </Form>
        </>
    );
}

function SessionEntry( props: { session: ISSHSessionSecure } ) {
    const [ selected, setSelected ] = useState<boolean>( false );
    return (
        <>
            <input type="checkbox" className="hidden"
                   name={ props.session.sessionId }
                   checked={ selected }
                   onChange={ () => {} }
            />
            <div
                className={ `flex flex-row justify-between items-center rounded-md py-1 px-2 ${ selected ? 'bg-special bg-opacity-20 hover:bg-opacity-100' : 'hover:bg-hover' }` }>
                <span className="flex justify-start select-none">
                    { props.session.alias || ( `${ props.session.hostAddress }:${ props.session.port }` ) }
                </span>
                <div className="" onClick={ () => setSelected( !selected ) }>
                    <XIcon size={ 20 }
                           className={ `${ selected ? '' : 'rotate-45' } transition-transform duration-200 cursor-pointer` } />
                </div>
            </div>
        </>
    );
}