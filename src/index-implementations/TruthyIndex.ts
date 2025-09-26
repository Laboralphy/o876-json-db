import { ReducedIndex } from './ReducedIndex';
import { JsonValue } from '../types/Json';

/**
 * this truthy index will index any value that is not : false, 0, null
 */
export class TruthyIndex extends ReducedIndex<JsonValue, string, boolean> {
    protected reduceValue(value: JsonValue): boolean {
        return value !== null && value !== undefined && value !== false && value !== 0;
    }
}
