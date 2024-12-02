import { SearchIcon }                  from 'lucide-react';
import { RefObject, useRef, useState } from 'react';

export interface SearchBarProps {
    debounceDelay?: number;
    refObject?: RefObject<HTMLInputElement>,
    onChange: ( newValue: string ) => void,
    initialValue?: string
    hidden?: boolean;
}

export function SearchBar( props: SearchBarProps ) {

    const [ visible, setVisible ] = useState<boolean>( props.hidden ?? true );
    const inputRef                = useRef<HTMLInputElement>( null );

    return (
        <div
            className={ `flex flex-row justify-start items-center bg-secondary transition-all duration-300 ${ visible ? 'rounded-md px-2' : 'rounded-full p-0' }` }>
            <input type="text" name="search-bar" ref={ inputRef }
                   className="appearance-none bg-transparent outline-none focus:outline-none transition-all duration-200"
                   style={ { maxWidth: visible ? '150px' : '0px' } }
                   defaultValue={ props.initialValue || '' }
                   onBlur={ () => {
                       if ( !props.hidden )
                           setVisible( false );
                   } }
            />
            <SearchIcon size={ 26 } className="p-1 hover:cursor-pointer text-secondary" onClick={ () => {
                if ( !visible )
                    inputRef.current?.focus();
                setVisible( !visible );
            } } />
        </div>
    );
}