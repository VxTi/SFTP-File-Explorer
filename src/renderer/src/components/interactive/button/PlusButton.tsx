import { PlusIcon } from 'lucide-react';

export function PlusButton( props: { className?: string, onClick: () => void } ) {
    return (
        <PlusIcon size={ 30 }
                  onClick={ props.onClick }
                  className={ `hover:bg-hover active:bg-tertiary rounded-md cursor-pointer py-1.5 ${ props.className ?? '' }` } />
    );
}