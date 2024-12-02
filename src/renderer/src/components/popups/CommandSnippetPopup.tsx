import { ICommandSnippet, ISSHSessionSecure }           from '@/common/ssh-definitions';
import { Form, FormInput, FormTextArea, SubmitButton }  from '@renderer/components/interactive/Form';
import { SearchBar }                                    from '@renderer/components/interactive/SearchBar';
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
export function CommandSnippetPopup( props: { snippet?: ICommandSnippet } ) {

    const [ statusMessage, setStatusMessage ] = useState<string>( '' );
    const { setPopup } = useContext( PopupContext );
    const { sessions } = useContext( SFTPContext );

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

        const standardProperties = {
            title:        formObject.title as string,
            command:      formObject.command as string,
            runOnConnect: Object.entries( formObject )
                                .filter( ( [ _, value ] ) => ( value as string ) === 'on' )
                                .map( ( [ key, _ ] ) => key as string )
        };

        // If there was a snippet provided, update it.
        if ( props.snippet !== undefined ) {
            window.api.sftp.shell.snippets.update(
                { ...standardProperties, snippetId: props.snippet.snippetId } as ICommandSnippet );
        } else {
            window.api.sftp.shell.snippets.create( standardProperties as Omit<ICommandSnippet, 'snippetId'> );
        }
        setPopup( undefined );
    }, [] );

    return ( <>
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
                          rows={ 5 } cols={ 60 }
                          defaultValue={ props.snippet?.command || '' }
                          style={ { resize: 'none' } } />
            { sessions.length > 0 && ( <>
                <div className="flex flex-row justify-between items-center">
                    <span>Run this script when connecting to:</span>
                    <SearchBar onChange={ () => {} } hidden={ true } />
                </div>
                <div className="flex flex-col justify-start items-stretch gap-2 py-1">

                    { sessions.map( ( session, index ) => (
                        <SessionEntry session={ session } key={ index } runOnConnect={ props.snippet?.runOnConnect } />
                    ) ) }
                </div>
            </> ) }
            <span className="text-red-500 text-center text-sm h-5">{ statusMessage }</span>
            <SubmitButton title={ props.snippet ? 'Save snippet' : 'Add new snippet' } />
        </Form>
    </> );
}

function SessionEntry( props: { session: ISSHSessionSecure, runOnConnect?: string[] | undefined } ) {
    const [ selected, setSelected ] = useState<boolean>(
        props.runOnConnect !== undefined &&
        Array.isArray( props.runOnConnect ) &&
        props.runOnConnect.findIndex( entry => entry === props.session.uid ) > -1
    );
    return ( <>
        <input type="checkbox" className="hidden"
               name={ props.session.uid }
               checked={ selected }
               onChange={ () => {} }
        />
        <div
            className={ `flex flex-row justify-between items-center rounded-md py-1 px-2 ${ selected ? 'bg-tertiary text-primary' : 'hover:bg-hover text-secondary' }` }>
                <span className="flex justify-start select-none font-satoshi">
                    { props.session.alias || ( `${ props.session.hostAddress }:${ props.session.port }` ) }
                </span>
            <div className="" onClick={ () => setSelected( !selected ) }>
                <XIcon size={ 20 }
                       className={ `${ selected ? '' : 'rotate-45' } transition-transform duration-200 cursor-pointer` } />
            </div>
        </div>
    </> );
}