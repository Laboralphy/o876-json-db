import { IPropertyIndex } from '../interfaces/IPropertyIndex';

export abstract class ReducedIndex<T, K, X> implements IPropertyIndex<T, K> {
    protected propertyIndex: Map<X, Set<K>>;

    constructor() {
        this.propertyIndex = new Map(); // to get all primary keys to documents whose property as a given value
    }

    add(value: T, primaryKey: K): void {
        const reducedValue = this.reduceValue(value);
        if (!this.propertyIndex.has(reducedValue)) {
            this.propertyIndex.set(reducedValue, new Set());
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
            }
        }
    }

    has(value: T): boolean {
        return this.propertyIndex.has(this.reduceValue(value));
    }

    clear(): void {
        this.propertyIndex.clear();
    }

    protected abstract reduceValue(value: T): X;
}
