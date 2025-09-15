import { ScalarValue } from './index';

export type FieldValue = ScalarValue | QueryObject | ArrayField | RegExp | Date;

/**
 * A generic description of a JSON object
 */
export interface QueryObject {
    [key: string]: FieldValue;
}

export type ArrayField = Array<QueryObject>;
