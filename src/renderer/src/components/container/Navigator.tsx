/**
 * @fileoverview ActionBar.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 07 - 16:35
 */
import { NavigatorElementPosition, NavigatorElements } from "@renderer/util/services/NavigatorElementRegistrator";
import { MenuItemElement }                             from "@renderer/components/interactive/MenuItemElement";

const PositionSpecificStyling: Record<NavigatorElementPosition, string> = {
    'header': 'border-b-[1px]',
    'footer': 'border-t-[1px]'
};

export function NavigationContainer(props: { position: NavigatorElementPosition, trulyIsTheNavigator?: boolean }) {

    return (
        <div
            className={`flex flex-row justify-between items-stretch h-9 text-xs bg-primary border-solid border-primary px-1 ${PositionSpecificStyling[ props.position ]}`}>
            <div className="flex flex-row justify-start items-center">
                {Object.values(NavigatorElements[ props.position ][ 'left' ]).map((item, index) => (
                    <MenuItemElement key={index} name={item.title} icon={item.icon} onClick={item.onClick}/>
                ))}
            </div>
            {props.trulyIsTheNavigator && (
                <div className="grow"
                style={props.trulyIsTheNavigator ? {
                        WebkitUserSelect: 'none',
                        /** @ts-ignore */
                        WebkitAppRegion: 'drag',
                        height: '35px'
                    } : {}} />
            )}
            <div className="flex flex-row justify-end items-center">
                {Object.values(NavigatorElements[ props.position ][ 'right' ]).map((item, index) => (
                    <MenuItemElement key={index} name={item.title} icon={item.icon} onClick={item.onClick}/>
                ))}
            </div>
        </div>
    )
}
