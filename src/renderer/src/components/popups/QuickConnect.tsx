/**
 * @fileoverview QuickConnect.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, November 17 - 15:39
 */
import { PopupHeader }                      from "@renderer/components/popups/PopupHeader";
import { Form, FormInput, FormTextArea }    from "@renderer/components/interactive/Form";
import { FormEvent, useCallback, useState } from "react";

export function QuickConnect() {

    const [ errorMessage, setErrorMessage ] = useState<string>('');

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        // TODO: Implement
    }, []);

    return (
        <div className="flex flex-col gap-1 justify-start items-stretch">
            <PopupHeader title="Quick Connect"/>
            <Form onSubmit={handleSubmit}>
                <div className="flex flex-row justify-between gap-2">
                    <div className="flex flex-col gap-1 grow">

                        <FormInput label="Host" type="text" name="host"
                                   required
                        />
                    </div>
                    <div className="flex flex-col gap-1">

                        <FormInput label="Port" type="number" min={0} max={1 << 16}
                                   className="text-center"
                                   defaultValue={22}
                                   name="port"/>
                    </div>
                </div>
                <div className="flex flex-row justify-between gap-2">
                    <div className="flex flex-col gap-1 grow-[3]">
                        <FormInput label="Username" type="text" name="username"
                                   required/>
                    </div>
                    <div className="flex flex-col gap-1 grow">
                        <FormInput label="Password" type="password" className="tracking-wider" name="password"/>
                    </div>
                </div>
                <FormTextArea name="private-key" label="Private key (optional)" style={{ resize: 'none' }}/>

                <FormInput label="Passphrase (optional)" type="password" name="passphrase"/>

                <span className="my-0.5 text-xs text-red-600">{errorMessage}</span>

                <FormInput value="Quick Connect"
                           type="submit"
                           className="hover:bg-hover transition-colors duration-200 hover:text-special cursor-pointer"/>
            </Form>
        </div>
    )
}
