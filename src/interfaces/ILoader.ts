import { JsonObject } from '../types/Json';

/**
 * This interface is used by Cursor to load documents
 */
export interface ILoader {
    load(key: string): Promise<JsonObject | undefined>;
}
