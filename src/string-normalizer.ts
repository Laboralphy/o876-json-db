export function normalizeString(s: string): string {
    return s
        .normalize('NFD') // Dissociate accent characters into character + diacritics (ex: "é" → "e + ´")
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase(); // To lower case
}
