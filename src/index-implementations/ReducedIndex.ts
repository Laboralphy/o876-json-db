import { IPropertyIndex } from '../interfaces/IPropertyIndex';
import { sortMap } from '../sort-map';
import { ScalarValue } from '../types';

export abstract class ReducedIndex<T, K, X extends ScalarValue> implements IPropertyIndex<T, K, X> {
    protected propertyIndex: Map<X, Set<K>>;
    protected sorted: boolean = false;

    constructor() {
        this.propertyIndex = new Map(); // to get all primary keys to documents whose property as a given value
    }

    add(value: T, primaryKey: K): void {
        const reducedValue = this.reduceValue(value);
        if (!this.propertyIndex.has(reducedValue)) {
            this.propertyIndex.set(reducedValue, new Set());
            this.sorted = false; // ordered list must be rebuilt
        }
        this.propertyIndex.get(reducedValue)!.add(primaryKey);
    }

    get(value: T): K[] {
        return Array.from(this.propertyIndex.get(this.reduceValue(value)) || []);
    }

    remove(value: T, primaryKey: K): void {
        const reducedValue = this.reduceValue(value);
        if (this.propertyIndex.has(reducedValue)) {
            const keys = this.propertyIndex.get(reducedValue)!;
            keys.delete(primaryKey);
            if (keys.size === 0) {
                this.propertyIndex.delete(reducedValue);
                this.sorted = false; // ordered list must be rebuilt
            }
        }
    }

    has(value: T): boolean {
        return this.propertyIndex.has(this.reduceValue(value));
    }

    clear(): void {
        this.propertyIndex.clear();
        this.sorted = false; // ordered list must be rebuilt
    }

    abstract reduceValue(value: T): X;

    getIndexMap(): Map<X, Set<K>> {
        this.propertyIndex = sortMap(this.propertyIndex);
        this.sorted = true;
        return this.propertyIndex;
    }
}
