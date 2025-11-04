import { ReducedIndex } from './ReducedIndex';
import { JsonValue } from '../types/Json';

/**
 * this truthy index will index any value that is not : false, 0, null, or undefined
 */
export class TruthyIndex extends ReducedIndex<JsonValue, string, boolean> {
    constructor() {
        // by design this index accept null values
        super(true);
    }

    reduceValue(value: JsonValue): boolean {
        return value !== null && value !== undefined && value !== false && value !== 0;
    }

    get isExact() {
        return false;
    }
}
