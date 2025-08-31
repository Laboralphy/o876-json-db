export type ScalarValue = string | number | boolean | null;
export type ComplexValue = [] | object;
export type ScalarComparator = (value: ScalarValue | undefined) => boolean;
