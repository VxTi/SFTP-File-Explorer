/**
 * @fileoverview NavigatorElementRegistration.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 07 - 16:09
 */


import { registerNavigatorElement }                 from "@renderer/services/NavigatorElementRegistrator";
import { Columns2Icon, SettingsIcon, TerminalIcon } from "lucide-react";
import EVENTS                                       from "@/common/events.json";

registerNavigatorElement('terminal', {
    icon: <TerminalIcon size={16} className="text-primary"/>,
    position: 'footer',
    side: 'right',
    onClick: () => {
        window.dispatchEvent(new CustomEvent(EVENTS.RENDERER.TOGGLE_TERMINAL));
    }
});

registerNavigatorElement(
    'settings',
    {
        icon: <SettingsIcon size={16} className="text-primary"/>,
        position: 'header',
        side: 'right',
        onClick: () => {
            window.dispatchEvent(new CustomEvent(EVENTS.RENDERER.SHOW_SETTINGS));
        }
    });

registerNavigatorElement(
    'navigation',
    {
        icon: <Columns2Icon size={16} className="text-primary"/>,
        position: 'footer',
        side: 'left',
        onClick: () => {
            window.dispatchEvent(new CustomEvent(EVENTS.RENDERER.TOGGLE_SIDEBAR));
        }
    });
