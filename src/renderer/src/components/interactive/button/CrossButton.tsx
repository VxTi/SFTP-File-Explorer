import { XIcon } from 'lucide-react';

export function CrossButton( props: { className?: string, size?: number, onClick: () => void } ): JSX.Element {
    return (
        <XIcon size={ props.size || 32 }
               className="justify-self-end rounded-md hover:bg-hover active:bg-tertiary p-1 cursor-pointer"
               onClick={ props.onClick } />
    );
}