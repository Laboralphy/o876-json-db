import { ExactIndex } from './ExactIndex';

export abstract class ReducedIndex<K> extends ExactIndex<string, K> {
    protected abstract reduceValue(value: string): string;

    add(value: string, primaryKey: K): void {
        super.add(this.reduceValue(value), primaryKey);
    }

    get(value: string): K[] {
        return super.get(this.reduceValue(value));
    }

    remove(value: string, primaryKey?: K): void {
        return super.remove(this.reduceValue(value), primaryKey);
    }

    has(value: string): boolean {
        return super.has(this.reduceValue(value));
    }
}
