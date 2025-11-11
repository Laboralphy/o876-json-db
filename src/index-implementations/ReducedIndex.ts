import { IPropertyIndex } from '../interfaces/IPropertyIndex';
import { sortMap } from '../sort-map';
import { ScalarValue } from '../types';

export type ReducedIndexOptions = {
    nullable: boolean;
};

export abstract class ReducedIndex<T, K, X extends ScalarValue> implements IPropertyIndex<T, K, X> {
    protected propertyIndex: Map<X, Set<K>>;
    protected nullIndex: Set<K>;
    protected sorted: boolean = false;

    protected constructor(private readonly _nullable: boolean) {
        this.propertyIndex = new Map(); // to get all primary keys to documents whose property as a given value
        this.nullIndex = new Set();
    }

    protected checkNullable() {
        if (!this._nullable) {
            throw new TypeError(
                `This index does not accept null values (nullable = ${this._nullable})`
            );
        }
    }

    add(value: T | null, primaryKey: K): void {
        if (value === null) {
            this.checkNullable();
            this.nullIndex.add(primaryKey);
            return;
        }
        const reducedValue = this.reduceValue(value);
        if (!this.propertyIndex.has(reducedValue)) {
            this.propertyIndex.set(reducedValue, new Set());
            this.sorted = false; // ordered list must be rebuilt
        }
        this.propertyIndex.get(reducedValue)!.add(primaryKey);
    }

    get(value: T | null): K[] {
        if (value === null) {
            this.checkNullable();
            return Array.from(this.nullIndex);
        }
        return Array.from(this.propertyIndex.get(this.reduceValue(value)) || []);
    }

    remove(value: T | null, primaryKey: K): void {
        if (value === null) {
            this.checkNullable();
            this.nullIndex.delete(primaryKey);
            return;
        }
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

    has(value: T | null): boolean {
        if (value === null) {
            this.checkNullable();
            return this.nullIndex.size > 0;
        }
        return this.propertyIndex.has(this.reduceValue(value));
    }

    clear(): void {
        this.nullIndex.clear();
        this.propertyIndex.clear();
        this.sorted = false; // ordered list must be rebuilt
    }

    abstract reduceValue(value: T): X;

    getIndexMap(): Map<X, Set<K>> {
        this.propertyIndex = sortMap(this.propertyIndex);
        this.sorted = true;
        return this.propertyIndex;
    }

    abstract get isExact(): boolean;
}
