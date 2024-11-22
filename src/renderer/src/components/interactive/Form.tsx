/**
 * @fileoverview Form.tsx
 * @author Luca Warmenhoven
 * @date Created on Monday, November 04 - 00:19
 */
import { CheckIcon }                                     from 'lucide-react';
import { CSSProperties, FormEvent, ReactNode, useState } from 'react';

export interface FormProps {
    children: ReactNode
    style?: CSSProperties
    className?: string,
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void
}

export function Form(props: FormProps) {
    return (
        <form className={`flex text-sm flex-col justify-start items-stretch gap-2 ${props.className ?? ''}`}
              style={props.style}
              onSubmit={props.onSubmit}>
            {props.children}
        </form>
    )
}

export function FormRow(props: { children: ReactNode, className?: string }) {
    return (
        <div className={`flex flex-row justify-start gap-1 ${props.className ?? 'items-center'}`}>
            {props.children}
        </div>
    )
}

export function SubmitButton( props: { title: string } ) {
    return (
        <input type="submit"
               className="py-1 px-2 placeholder-text-secondary rounded-md grow focus:outline-none bg-secondary border-[1px] border-solid border-primary focus:border-theme-special hover:bg-hover transition-colors duration-200 hover:text-special cursor-pointer"
               value={ props.title }
        />
    );
}

export function FormInput(props: any) {
    return (
        <>
            <label className="select-none">{props.label}</label>
            <input
                type={props.type ?? 'text'}
                {...props}
                placeholder={props.placeholder ?? ''}
                className={`py-1 px-2 placeholder-text-secondary rounded-md grow focus:outline-none bg-secondary border-[1px] border-solid border-primary focus:border-theme-special ${props.className ?? ''}`}
                onChange={(e) => props.onChange?.(e.target.value)}/>
        </>
    )
}

export function FormCheckbox(props: any) {

    const [ checked, setChecked ] = useState(false);

    return (
        <label className="flex flex-row items-center gap-2">
            <div className="grid grid-cols-1 grid-rows-1 place-items-center">
                <input type="checkbox"
                       {...props}
                       className={`row-start-1 col-start-1 rounded-md appearance-none w-4 h-4 bg-secondary border-[1px] border-solid border-primary focus:outline-theme-special ${props.className ?? ''}`}
                       onChange={(e) => {
                           setChecked(e.target.checked);
                           props.onChange?.(e.target.checked)
                       }}/>
                {checked && (
                    <CheckIcon strokeWidth={3} size={14}
                               className="pointer-events-none row-start-1 col-start-1 text-special"/>
                )}
            </div>
            <span className="select-none">{props.label}</span>
        </label>
    )
}

export function FormTextArea(props: any) {
    return (
        <>
            <label className="select-none">{props.label}</label>
            <textarea
                {...props}
                placeholder={props.placeholder ?? ''}
                className={`py-1 px-2 placeholder-text-secondary rounded-md grow focus:outline-none bg-secondary border-[1px] border-solid border-primary focus:border-theme-special ${props.className ?? ''}`}
                onChange={(e) => props.onChange?.(e.target.value)}/>
        </>
    )
}
