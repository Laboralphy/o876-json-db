import { IIndex } from '../interfaces/IIndex';

export abstract class ReducedIndex<T, K> implements IIndex<T, K> {
    private indexMap: Map<T, Set<K>>;

    constructor() {
        this.indexMap = new Map();
    }

    add(value: T, primaryKey: K): void {
        if (!this.indexMap.has(value)) {
            this.indexMap.set(value, new Set());
        }
        this.indexMap.get(value)!.add(primaryKey);
    }

    get(value: T): K[] {
        return Array.from(this.indexMap.get(value) || []);
    }

    remove(value: T, primaryKey?: K): void {
        if (!this.indexMap.has(value)) {
            return;
        }

        if (primaryKey === undefined) {
            this.indexMap.delete(value);
        } else {
            const keys = this.indexMap.get(value);
            keys?.delete(primaryKey);
            if (keys?.size === 0) {
                this.indexMap.delete(value);
            }
        }
    }

    has(value: T): boolean {
        return this.indexMap.has(value);
    }

    protected abstract reduceValue(value: T): T;
}
