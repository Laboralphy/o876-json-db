import { ScalarValue } from './index';

export type JsonValue = ScalarValue | JsonObject | JsonArray;

/**
 * A generic description of a JSON object
 */
export interface JsonObject {
    [key: string]: JsonValue;
}

export type JsonArray = Array<JsonValue>;
