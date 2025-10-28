import { ScalarValue } from './types';
import { comparator } from './comparator';

export function sortMap<K extends ScalarValue, V>(map: Map<K, V>): Map<K, V> {
    const sortedMap = new Map<K, V>();
    const aValueList = [...map.keys()];
    aValueList.sort((a, b) => comparator(a, b));
    for (const value of aValueList) {
        const data = map.get(value);
        if (data !== undefined) {
            sortedMap.set(value, data);
        }
    }
    return sortedMap;
}
