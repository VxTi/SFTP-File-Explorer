/**
 * @fileoverview StringUtils.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 14 - 18:38
 */

export function byteValueToString(value: number): string {
    const suffixes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let suffixIndex = 0;
    while (value > 1024) {
        value /= 1024;
        suffixIndex++;
        if (suffixIndex === suffixes.length - 1)
            break;
    }
    return value.toFixed(suffixIndex === 0 ? 0 : 2) +' ' + suffixes[suffixIndex];
}
