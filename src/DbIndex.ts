import { INDEX_TYPES } from './enums';

export type DbIndexOptions = {
    type: INDEX_TYPES;
    size: number;
    unique: boolean;
    caseInsensitive: boolean;
};

export type IndexableValues = string | number | boolean;

export class DbIndex {
    public readonly values: Map<IndexableValues, Set<string>> = new Map<
        IndexableValues,
        Set<string>
    >();
    public readonly uniqueValues: Map<IndexableValues, string> = new Map<IndexableValues, string>();
    public readonly indexType: INDEX_TYPES;
    public readonly unique: boolean;
    public readonly size: number;
    public readonly caseInsensitive: boolean;

    constructor(options: DbIndexOptions) {
        this.indexType = options.type;
        this.size = options.size;
        this.unique = options.unique;
        this.caseInsensitive = options.caseInsensitive;
    }
}
