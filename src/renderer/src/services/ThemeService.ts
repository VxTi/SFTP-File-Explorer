/**
 * @fileoverview ThemeService.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 11:58
 */

import THEMES from '../resources/themes.json';

const ThemeKeyTranslationTable: Record<string, string> = {
    'backgroundColor': '--color-background',

    'primaryColor': '--color-primary',
    'primaryTextColor': '--color-text-primary',
    'primaryBorderColor': '--color-border',

    'primaryHoverColor': '--color-primary-hover',
    'primaryTextHoverColor': '--color-text-primary-hover',
    'primaryBorderHoverColor': '--color-border-hover',

    'secondaryColor': '--color-secondary',
    'secondaryTextColor': '--color-text-secondary',
    'secondaryTextHoverColor': '--color-text-secondary-hover',
    'secondaryBorderColor': '--color-border-secondary',

    'tertiaryColor': '--color-tertiary',

    'specialColor': '--color-special',
    'specialTextColor': '--color-text-special'
}

/**
 * Theme interface.
 * This interface represents a theme object.
 */
export interface Theme {
    backgroundColor: string;

    primaryColor: string;
    primaryTextColor: string;
    primaryBorderColor: string;

    primaryHoverColor: string;
    primaryTextHoverColor: string;
    primaryBorderHoverColor: string;

    secondaryColor: string;
    secondaryTextColor: string;
    secondaryBorderColor: string;

    tertiaryColor: string;

    specialColor: string;
    specialTextColor: string;
}

function getTheme(theme: string): Theme | undefined {
    return THEMES.find(t => t.name === theme)?.colors;
}

/**
 * Set the theme of the application.
 * This will insert a style element into the head of the document with the theme styling,
 * or remove the existing theme styling element to reset to default.
 * @param theme The theme to set.
 */
export function setTheme(theme?: string) {

    let themeObj: Theme | undefined;

    // Remove existing theme styling element to reset to default
    if ( !theme || !(themeObj = getTheme(theme)) ) {
        let themeStyles = document.querySelector('style[data-theme]');
        themeStyles?.remove();
        window.localStorage.removeItem('theme');
        return;
    }

    const themeStyles         = document.createElement('style');
    themeStyles.innerHTML     = ':root {\n'.concat(Object.keys(themeObj).map(key => {
        return `${ThemeKeyTranslationTable[ key ] ?? key}: ${themeObj[ key ]};`;
    }).join('\n')).concat('\n}');
    themeStyles.dataset.theme = theme;

    window.localStorage.setItem('theme', theme);

    window.document.head.appendChild(themeStyles);
}

/**
 * Get the available themes.
 * @returns {string[]} The available themes.
 */
export function getThemes(): string[] {
    return THEMES.map(t => t.name);
}
