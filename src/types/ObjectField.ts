export type FieldValue = string | number | boolean | null | ObjectField | ArrayField | RegExp;

/**
 * A generic description of a JSON object
 */
export interface ObjectField {
    [key: string]: FieldValue;
}

export type ArrayField = Array<ObjectField>;
