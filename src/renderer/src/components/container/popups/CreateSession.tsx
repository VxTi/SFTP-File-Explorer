/**
 * @fileoverview CreateSession.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 10 - 14:12
 */
import { Form, FormCheckbox, FormInput, FormRow, FormTextArea } from "@renderer/components/interactive/Form";
import { FormEvent, useCallback, useContext }                   from "react";
import { XIcon }                                  from "lucide-react";
import { PopupContext }                           from "@renderer/contexts/PopupContext";


/**
 * Popup to add a new session
 * @constructor
 */
export function CreateSession() {
    const { setPopup } = useContext(PopupContext);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // TODO: Fix
        // Acquire values from form event
        const data = new FormData(event.target as HTMLFormElement);
        console.log(data, data.values())
        const host = data.get('host') as string;
        const port = data.get('port') as string;
        console.log(`Host: ${host}, Port: ${port}`);
    }, []);

    return (
        <div className="text-primary flex flex-col justify-start items-stretch px-2">
            <div className="grid mb-4 items-center"
                 style={{
                     gridTemplateColumns: '60px 1fr 60px',
                 }}>
                <h3 className="text-center col-start-2 text-xl font-bold font-satoshi">Add New Session</h3>
                <XIcon size={32} className="justify-self-end rounded-full hover:bg-hover p-1"
                       onClick={() => setPopup(undefined)}/>
            </div>
            <Form onSubmit={handleSubmit}>
                <FormRow>
                    <FormInput label="Host Address" type="text" id="host"/>
                    <FormInput label="Port" type="number" min={0} max={1 << 16}
                               className="text-center"
                               defaultValue="22"
                               id="port"/>
                </FormRow>
                <FormInput label="Username" type="text" id="username"/>
                <FormInput label="Password" type="password" id="password"/>

                <FormTextArea id="private-key" placeholder="Private key (optional)" style={{
                    resize: 'none'
                }}/>
                <FormInput label="Passphrase (optional)" type="password" id="passphrase"/>
                <FormInput label="Alias (optional)" type="text" id="alias"/>
                <FormCheckbox type="checkbox" label="Use fingerprint verification" id="fingerprint"
                              className="mt-2 mb-3"
                />
                <FormInput value="Create Session" type="submit" className="hover:bg-hover cursor-pointer"/>
            </Form>
        </div>
    )
}
