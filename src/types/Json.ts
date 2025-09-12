export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

/**
 * A generic description of a JSON object
 */
export interface JsonObject {
    [key: string]: JsonValue;
}

export type JsonArray = Array<JsonValue>;
