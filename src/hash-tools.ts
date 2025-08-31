function utf8StrToByteArray(str: string): number[] {
    const utf8: number[] = [];
    for (let i = 0; i < str.length; ++i) {
        let charCode = str.charCodeAt(i);
        if (charCode < 0x80) utf8.push(charCode);
        else if (charCode < 0x800) {
            utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
        } else if (charCode < 0xd800 || charCode >= 0xe000) {
            utf8.push(
                0xe0 | (charCode >> 12),
                0x80 | ((charCode >> 6) & 0x3f),
                0x80 | (charCode & 0x3f)
            );
        } else {
            ++i;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
            utf8.push(
                0xf0 | (charCode >> 18),
                0x80 | ((charCode >> 12) & 0x3f),
                0x80 | ((charCode >> 6) & 0x3f),
                0x80 | (charCode & 0x3f)
            );
        }
    }
    return utf8;
}

function crcTable(): number[] {
    let c: number;
    const crcTable = [];
    for (let n = 0; n < 256; ++n) {
        c = n;
        for (let k = 0; k < 8; ++k) {
            c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        crcTable[n] = c;
    }
    return crcTable;
}

const CRC_TABLE = crcTable();

export function crc32(str: string): number {
    const astr = utf8StrToByteArray(str);
    let crc = 0 ^ -1;
    for (let i = 0, l = astr.length; i < l; ++i) {
        crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ astr[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
}

/**
 * crc16_mcrf4xx
 * data [0x01, 0xFF, 0x07, 0x19]
 */
export function crc16(str: string): number {
    const astr = utf8StrToByteArray(str);
    // poly is 8408
    const CRC_POLY = 0x8408;
    let crc = 0xffff;
    for (let m = 0, l = astr.length; m < l; ++m) {
        crc ^= astr[m];
        for (let n = 0; n < 8; ++n) {
            if (crc & 0x0001) {
                crc = (crc >> 1) ^ CRC_POLY;
            } else {
                crc = crc >> 1;
            }
        }
    }
    return crc ^ (0x0 & 0xffff);
}
