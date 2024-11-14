/**
 * @fileoverview CreateSession.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 10 - 14:12
 */
import { Form, FormCheckbox, FormInput, FormRow, FormTextArea } from "@renderer/components/interactive/Form";
import { FormEvent, useCallback, useContext }                   from "react";
import { XIcon }                                                from "lucide-react";
import { PopupContext }                                         from "@renderer/contexts/PopupContext";
import { ISSHSessionSafe }                                      from "@/common/ssh-definitions";

/**
 * Popup to add a new session
 * @constructor
 */
export function CreateSession(props: { session?: ISSHSessionSafe }) {
    const { setPopup } = useContext(PopupContext);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Acquire values from form event
        const target     = event.currentTarget as HTMLFormElement;
        const formData   = new FormData(target);
        const formObject = Object.fromEntries(formData.entries());
        console.log(formObject);
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
    }, []);

    return (
        <div className="text-primary flex flex-col justify-start items-stretch px-2">
            <div className="grid mb-4 items-center"
                 style={{
                     gridTemplateColumns: '60px 1fr 60px',
                 }}>
                <h3 className="text-center col-start-2 text-xl font-bold font-satoshi">
                    {props.session ? "Edit Session" : "Create New Session"}
                </h3>
                <XIcon size={32} className="justify-self-end rounded-full hover:bg-hover p-1"
                       onClick={() => setPopup(undefined)}/>
            </div>
            <Form onSubmit={handleSubmit}>
                <FormRow>
                    <FormInput label="Host Address" type="text" name="host"
                               defaultValue={props.session?.hostAddress ?? ''}
                               required
                    />
                    <FormInput label="Port" type="number" min={0} max={1 << 16}
                               className="text-center"
                               defaultValue={props.session?.port ?? 22}
                               name="port"/>
                </FormRow>
                <FormInput label="Username" type="text" name="username"
                           defaultValue={props.session?.username ?? ''}
                           required
                />
                <FormInput label="Password (recommended)" type="password" name="password"/>

                <FormTextArea name="private-key" label="Private key (optional)" style={{ resize: 'none' }}/>

                <FormInput label="Passphrase (optional)" type="password" name="passphrase"/>

                <FormInput label="Alias (optional)" type="text" name="alias"
                           defaultValue={props.session?.alias ?? ''}
                />
                <FormCheckbox type="checkbox" label="Use fingerprint verification" name="fingerprint"/>
                <FormInput value={props.session ? "Save Session" : "Create Session"} type="submit"
                           className="hover:bg-hover cursor-pointer mt-2"/>
            </Form>
        </div>
    )
}
