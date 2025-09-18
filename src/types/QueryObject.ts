import { ScalarValue } from './index';

export type FieldValue = ScalarValue | QueryObject | FieldArray | RegExp | Date;
export type FieldArray = Array<FieldValue>;

/**
 * A generic description of a JSON object
 */
export interface QueryObject {
    [fieldKey: string]: FieldValue;
}
