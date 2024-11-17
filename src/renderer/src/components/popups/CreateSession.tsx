/**
 * @fileoverview CreateSession.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 10 - 14:12
 */
import { Form, FormCheckbox, FormInput }                from "@renderer/components/interactive/Form";
import { FormEvent, useCallback, useContext, useState } from "react";
import { PopupContext }                                 from "@renderer/contexts/Popups";
import { ISSHSessionSafe }                              from "@/common/ssh-definitions";
import { SFTPContext }                                  from "@renderer/contexts/SFTP";
import { PopupHeader }                                  from "@renderer/components/popups/PopupHeader";
import { FilePlus2 }                                    from "lucide-react";

/**
 * Popup to add a new session
 * @constructor
 */
export function CreateSession(props: { session?: ISSHSessionSafe }) {
    const { setPopup } = useContext(PopupContext);
    const { sessions } = useContext(SFTPContext);

    const [ errorMessage, setErrorMessage ] = useState<string | undefined>(undefined);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Acquire values from form event
        const target                                         = event.currentTarget as HTMLFormElement;
        const formData                                       = new FormData(target);
        const formObject: Record<string, FormDataEntryValue> = Object.fromEntries(formData.entries());

        // Prevent alias duplicates
        if ( sessions.find(session => session.alias &&
            session.alias.toLowerCase() === (formObject[ 'alias' ] as string).trim().toLowerCase()) ) {
            setErrorMessage("Alias is already in use");
            return;
        }

        // Prevent duplicates
        if ( sessions.find(session => session.hostAddress === formObject[ 'host' ] &&
            session.port === parseInt(formObject[ 'port' ] as string || '22') &&
            session.username === formObject[ 'username' ]) ) {
            setErrorMessage("Session already exists");
            return;
        }

        window.api.sessions.create(
            {
                hostAddress: formObject[ 'host' ] as string,
                port: parseInt(formObject[ 'port' ] as string) ?? 22,
                username: formObject[ 'username' ] as string,
                password: formObject[ 'password' ] as string,
                privateKey: formObject[ 'private-key' ] as string,
                passphrase: formObject[ 'passphrase' ] as string,
                alias: formObject[ 'alias' ] as string,
                requiresFingerprintVerification: formObject[ 'fingerprint' ] === 'on',
            }
        );
        setPopup(undefined);
    }, [ sessions ]);

    return (
        <div className="text-primary flex flex-col justify-start items-stretch px-2">
            <PopupHeader title={props.session ? "Edit Session" : "Create New Session"}/>
            <Form onSubmit={handleSubmit}>
                <FormInput label="Alias (optional)" type="text" name="alias"
                           defaultValue={props.session?.alias ?? ''}
                />
                <div className="flex flex-row justify-between gap-2">
                    <div className="flex flex-col gap-1 grow">

                        <FormInput label="Host" type="text" name="host"
                                   defaultValue={props.session?.hostAddress ?? ''}
                                   required
                        />
                    </div>
                    <div className="flex flex-col gap-1">

                        <FormInput label="Port" type="number" min={0} max={1 << 16}
                                   className="text-center"
                                   defaultValue={props.session?.port ?? 22}
                                   name="port"/>
                    </div>
                </div>
                <div className="flex flex-row justify-between gap-2">
                    <div className="flex flex-col gap-1 grow-[3]">
                        <FormInput label="Username" type="text" name="username"
                                   defaultValue={props.session?.username ?? ''}
                                   required/>
                    </div>
                    <div className="flex flex-col gap-1 grow">
                        <FormInput label="Password" type="password" className="tracking-wider" name="password"/>
                    </div>
                </div>
                <div className="flex flex-col justify-start items-stretch gap-1">
                    <label className="select-none">
                        Private key (optional)
                    </label>
                    <div className="relative w-full flex">
                        <textarea
                            name="private-key"
                            className={`py-1 px-2 placeholder-text-secondary grow rounded-md focus:outline-none bg-secondary border-[1px] border-solid border-primary focus:border-theme-special ${props.className ?? ''}`}
                            style={{ resize: 'none' }}
                        />
                        <div className="absolute left-full top-0 -translate-x-full translate-y-full">
                            <FilePlus2 size={18} className="text-primary"/>
                        </div>
                    </div>
                </div>

                <FormInput label="Passphrase (optional)" type="password" name="passphrase"/>
                <FormCheckbox type="checkbox" label="Use fingerprint verification" name="fingerprint"/>
                <span className="my-1 text-xs text-red-600">{errorMessage}</span>
                <FormInput value={props.session ? "Save Session" : "Create Session"} type="submit"
                           className="hover:bg-hover transition-colors duration-200 hover:text-special cursor-pointer"/>
            </Form>
        </div>
    )
}
