/**
 * @fileoverview UseUniqueHashSet.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, November 07 - 18:22
 */
import { useCallback, useState } from "react";

/**
 * A hook that returns a hashmap and two functions to add and remove values from the hashmap.
 * @param initialValue The initial hashmap to use.
 */
export function useMap<K, V>(initialValue: Map<K, V> = new Map<K, V>()): [
    Map<K, V>,
    (key: K, value: V) => void,
    (key: K) => void
] {
    const [ map, setMap ] = useState<Map<K, V>>(initialValue);

    /**
     * Adds a value to the hashmap.
     * @param key The key to add.
     * @param value The value to add.
     */
    const add = useCallback((key: K, value: V) => {
        setMap((prev) => {
            const newSet = new Map(prev);
            newSet.set(key, value);
            return newSet;
        });
    }, []);

    /**
     * Removes a value from the hashmap.
     * @param key The key to remove.
     */
    const remove = useCallback((key: K) => {
        setMap((prev) => {
            const newSet = new Map(prev);
            newSet.delete(key);
            return newSet;
        });
    }, []);

    return [ map, add, remove ];
}
