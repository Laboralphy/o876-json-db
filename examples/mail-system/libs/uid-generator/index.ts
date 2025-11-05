import crypto from 'node:crypto';
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const ALPHABET_LENGTH = ALPHABET.length;
const MS_IN_HOUR = 1000 * 3600;
const VAR_SIZE_DEFAULT = 10;

export function generateUID(nVarSize: number = VAR_SIZE_DEFAULT): string {
    // will produce an identifier of size nVarSize + 4 char until date : 2161-08-11 01:00:00
    // after this data : will produce as identifier of size nVarSize + 5
    const timestamp = Math.floor(Date.now() / MS_IN_HOUR).toString(36);
    let randomPart = '';
    const buffer = new Uint32Array(nVarSize);
    crypto.getRandomValues(buffer);
    for (let i = 0; i < nVarSize; i++) {
        randomPart += ALPHABET[buffer[i] % ALPHABET_LENGTH];
    }
    return timestamp + randomPart; // Ex: "01y7x3b9kp1q2r" (14 chars)
}
