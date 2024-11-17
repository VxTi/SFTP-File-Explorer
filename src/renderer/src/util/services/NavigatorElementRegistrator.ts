/**
 * @fileoverview NavigatorElementRegistrator.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 07 - 16:01
 */
import { ReactNode } from "react";

/**
 * ActionBar Elements window property key
 */
export const NavigatorElementsWindowPropertyKey = "declaredNavigatorElements";

export type NavigatorElementPosition = 'header' | 'footer';

export type NavigatorElementSide = 'left' | 'right';

/**
 * ActionBar Element properties
 * These properties define the behavior of a navigator element
 */
export interface NavigatorElement {
    /** The title of the element, visible in the navigator or when hovering */
    title?: string;

    /** The icon of the element, visible in the navigator */
    icon: ReactNode;

    /** The position of the element */
    position: NavigatorElementPosition;

    /** The side of the element */
    side: NavigatorElementSide;

    /** The action to perform when the element is clicked */
    onClick: () => void;
}

window[ NavigatorElementsWindowPropertyKey ] = window[ NavigatorElementsWindowPropertyKey ] ?? {};
window[ NavigatorElementsWindowPropertyKey ][ 'header' ] ??= { 'left': {}, 'right': {} };
window[ NavigatorElementsWindowPropertyKey ][ 'footer' ] ??= { 'left': {}, 'right': {} };

/**
 * ActionBar elements, exported as a record referencing the navigator elements
 */
export const NavigatorElements = window[ NavigatorElementsWindowPropertyKey ] as
    Record<NavigatorElementPosition,
        Record<NavigatorElementSide,
            Record<string, NavigatorElement>>>;

/**
 * Register a navigator element
 * @param identifier The identifier of the navigator element
 * @param element The navigator element
 */
export function registerNavigatorElement(identifier: string, element: NavigatorElement) {
    if ( NavigatorElements[ element.position ]?.[ element.side ]?.[ identifier ] ) {
        console.warn(`Navigator element with identifier ${identifier} already exists!`);
    }
    NavigatorElements[ element.position ][ element.side ][ identifier ] = element;
}
