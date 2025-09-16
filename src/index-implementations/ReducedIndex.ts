import { IPropertyIndex } from '../interfaces/IPropertyIndex';

export abstract class ReducedIndex<T, K> implements IPropertyIndex<T, K> {
    private propertyIndex: Map<T, Set<K>>;

    constructor() {
        this.propertyIndex = new Map(); // to get all primary keys to documents whose property as a given value
    }

    add(value: T, primaryKey: K): void {
        value = this.reduceValue(value);
        if (!this.propertyIndex.has(value)) {
            this.propertyIndex.set(value, new Set());
        }
        this.propertyIndex.get(value)!.add(primaryKey);
    }

    get(value: T): K[] {
        return Array.from(this.propertyIndex.get(this.reduceValue(value)) || []);
    }

    remove(value: T, primaryKey: K): void {
        value = this.reduceValue(value);
        if (this.propertyIndex.has(value)) {
            const keys = this.propertyIndex.get(value)!;
            keys.delete(primaryKey);
            if (keys.size === 0) {
                this.propertyIndex.delete(value);
            }
        }
    }

    has(value: T): boolean {
        return this.propertyIndex.has(this.reduceValue(value));
    }

    protected abstract reduceValue(value: T): T;
}
