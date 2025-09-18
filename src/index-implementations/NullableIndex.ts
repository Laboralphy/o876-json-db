import { IPropertyIndex } from '../interfaces/IPropertyIndex';

export class NullableIndex<T, K> implements IPropertyIndex<T, K> {
    private readonly nullIndex = new Set<K>();

    constructor(private readonly index: IPropertyIndex<T, K>) {}

    add(value: T | null, primaryKey: K): void {
        if (value === null) {
            this.nullIndex.add(primaryKey);
            return;
        } else {
            this.index.add(value, primaryKey);
        }
    }

    get(value: T | null): K[] {
        if (value === null) {
            return [...this.nullIndex];
        } else {
            return this.index.get(value);
        }
    }

    remove(value: T | null, primaryKey: K): void {
        if (value === null) {
            if (primaryKey !== undefined) {
                this.nullIndex.delete(primaryKey);
            } else {
                this.nullIndex.clear();
            }
        } else {
            this.index.remove(value, primaryKey);
        }
    }

    has(value: T | null): boolean {
        if (value === null) {
            return this.nullIndex.size > 0;
        } else {
            return this.index.has(value);
        }
    }

    clear(): void {
        this.nullIndex.clear();
        this.index.clear();
    }
}
