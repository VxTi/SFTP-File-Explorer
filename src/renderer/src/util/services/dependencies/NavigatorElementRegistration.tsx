/**
 * @fileoverview NavigatorElementRegistration.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 07 - 16:09
 */


import { registerNavigatorElement }                          from "@renderer/util/services/NavigatorElementRegistrator";
import { Columns2Icon, CpuIcon, SettingsIcon, TerminalIcon } from "lucide-react";
import EVENTS                                                from "@/common/events.json";

registerNavigatorElement(
    'processes',
    {
        icon: <CpuIcon size={16} className="text-primary" />,
        position: 'footer',
        side: 'right',
        title: 'Active Processes',
        onClick: () => {

        }
    }
)

registerNavigatorElement(
    'terminal',
    {
        icon: <TerminalIcon size={16} className="text-primary"/>,
        position: 'footer',
        title: 'Toggle terminal visibility',
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
        title: 'Settings',
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
        title: 'Toggle Sidebar',
        side: 'left',
        onClick: () => {
            window.dispatchEvent(new CustomEvent(EVENTS.RENDERER.TOGGLE_SIDEBAR));
        }
    });
