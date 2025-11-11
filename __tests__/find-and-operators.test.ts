import { Collection } from '../src/Collection';
import { INDEX_TYPES } from '../src/enums';
import { TestStorage } from '../src/storage-adapters/TestStorage';

type CharacterType = {
    name: string;
    familyName: string;
    gender: 'male' | 'female';
    age: number;
    location: string;
};

const DB: Record<string, CharacterType> = {
    p0001: {
        name: 'Eddard',
        familyName: 'Stark',
        gender: 'male',
        age: 35,
        location: 'Winterfell',
    },
    p0002: {
        name: 'Catelyn',
        familyName: 'Stark',
        gender: 'female',
        age: 40,
        location: 'Winterfell',
    },
    p0003: {
        name: 'Robb',
        familyName: 'Stark',
        gender: 'male',
        age: 20,
        location: 'Winterfell',
    },
    p0004: {
        name: 'Sansa',
        familyName: 'Stark',
        gender: 'female',
        age: 13,
        location: "King's Landing",
    },
    p0005: {
        name: 'Arya',
        familyName: 'Stark',
        gender: 'female',
        age: 11,
        location: 'Braavos',
    },
    p0006: {
        name: 'Bran',
        familyName: 'Stark',
        gender: 'male',
        age: 10,
        location: 'Beyond the Wall',
    },
    p0007: {
        name: 'Jon',
        familyName: 'Snow',
        gender: 'male',
        age: 16,
        location: 'Castle Black',
    },
    p0008: {
        name: 'Tyrion',
        familyName: 'Lannister',
        gender: 'male',
        age: 32,
        location: "King's Landing",
    },
    p0009: {
        name: 'Cersei',
        familyName: 'Lannister',
        gender: 'female',
        age: 36,
        location: "King's Landing",
    },
    p0010: {
        name: 'Jaime',
        familyName: 'Lannister',
        gender: 'male',
        age: 34,
        location: "King's Landing",
    },
    p0011: {
        name: 'Daenerys',
        familyName: 'Targaryen',
        gender: 'female',
        age: 16,
        location: 'Meereen',
    },
    p0012: {
        name: 'Viserys',
        familyName: 'Targaryen',
        gender: 'male',
        age: 21,
        location: 'Vaes Dothrak',
    },
    p0013: {
        name: 'Joffrey',
        familyName: 'Baratheon',
        gender: 'male',
        age: 13,
        location: "King's Landing",
    },
    p0014: {
        name: 'Robert',
        familyName: 'Baratheon',
        gender: 'male',
        age: 37,
        location: "King's Landing",
    },
    p0015: {
        name: 'Theon',
        familyName: 'Greyjoy',
        gender: 'male',
        age: 20,
        location: 'Pykes',
    },
    p0016: {
        name: 'Yara',
        familyName: 'Greyjoy',
        gender: 'female',
        age: 22,
        location: 'Pykes',
    },
    p0017: {
        name: 'Sandor',
        familyName: 'Clegane',
        gender: 'male',
        age: 38,
        location: 'Flea Bottom',
    },
    p0018: {
        name: 'Gregor',
        familyName: 'Clegane',
        gender: 'male',
        age: 42,
        location: "King's Landing",
    },
    p0019: {
        name: 'Petyr',
        familyName: 'Baelish',
        gender: 'male',
        age: 45,
        location: 'The Vale',
    },
    p0020: {
        name: 'Varys',
        familyName: '',
        gender: 'male',
        age: 50,
        location: "King's Landing",
    },
    p0021: {
        name: 'Margaery',
        familyName: 'Tyrell',
        gender: 'female',
        age: 19,
        location: "King's Landing",
    },
    p0022: {
        name: 'Olenna',
        familyName: 'Tyrell',
        gender: 'female',
        age: 80,
        location: 'Highgarden',
    },
    p0023: {
        name: 'Brienne',
        familyName: 'Tarth',
        gender: 'female',
        age: 32,
        location: 'Riverlands',
    },
    p0024: {
        name: 'Davos',
        familyName: 'Seaworth',
        gender: 'male',
        age: 50,
        location: 'Dragonstone',
    },
    p0025: {
        name: 'Melisandre',
        familyName: '',
        gender: 'female',
        age: 400,
        location: 'Dragonstone',
    },
    p0026: {
        name: 'Samwell',
        familyName: 'Tarly',
        gender: 'male',
        age: 18,
        location: 'Oldtown',
    },
    p0027: {
        name: 'Jorah',
        familyName: 'Mormont',
        gender: 'male',
        age: 45,
        location: 'Essos',
    },
};

describe('multiple conditions', () => {
    let oCharacters: Collection<CharacterType>;
    beforeEach(async () => {
        oCharacters = new Collection('soiaf_characters', {
            familyName: {
                type: INDEX_TYPES.HASH,
                caseInsensitive: true,
            },
            age: {
                type: INDEX_TYPES.NUMERIC,
                precision: 10,
            },
            gender: {
                type: INDEX_TYPES.PARTIAL,
                caseInsensitive: false,
                size: 0,
            },
            location: {
                type: INDEX_TYPES.PARTIAL,
                caseInsensitive: true,
                size: 0,
            },
        });
        const ts = new TestStorage();
        ts.latency = 8;
        oCharacters.storage = ts;
        await oCharacters.init();
        for (const [id, doc] of Object.entries(DB)) {
            await oCharacters.save(id, doc);
        }
    });
    it('should return katelyn and ned when asking people of winterfell older thant 30', async () => {
        const c = await oCharacters.find({ location: 'winterfell', age: { $gt: 30 } });
        const r = await c.fetchAll();
        expect(r.find((x) => x.name === 'Eddard')).toBeDefined();
        expect(r.find((x) => x.name === 'Catelyn')).toBeDefined();
        expect(r).toHaveLength(2);
        expect(c.keys.includes('p0001')).toBeTruthy();
    });

    it('should throw an error when mistyping "location"', async () => {
        await expect(async () => {
            const c = await oCharacters.find({ location: 24, age: { $gt: 50 } });
            const r = await c.fetchAll();
        }).rejects.toThrow(
            new TypeError('location requires that indexed value is of type string : number given')
        );
    });
    it('should throw an error when mistyping operand of $gt', async () => {
        await expect(async () => {
            const c = await oCharacters.find({ location: 'Winterfell', age: { $gt: 'abc' } });
            const r = await c.fetchAll();
        }).rejects.toThrow(
            new TypeError('age requires that indexed value is of type number : string given')
        );
    });
    it('should loads 2 documents only when querying an indexed property', async () => {
        const c = await oCharacters.find({ age: { $gt: 50 } });
        expect(oCharacters.stats.loads).toBe(2);
    });
    it('should reset stats when findings 2 queries', async () => {
        const c1 = await oCharacters.find({ age: { $gte: 18 } });
        expect(oCharacters.stats.loads).toBe(8);
        const c2 = await oCharacters.find({ age: { $gt: 50 } });
        expect(oCharacters.stats.loads).toBe(2);
    });
    it('should return male character of lannister when asking', async () => {
        const c = await oCharacters.find({ familyName: 'Lannister', gender: 'male' });
        expect(c.count).toBe(2);
        const r = await c.fetchAll();
        expect(r[0].name).toBe('Tyrion');
        expect(r[1].name).toBe('Jaime');
        expect(r[0].gender).toBe('male');
        expect(r[1].gender).toBe('male');
    });
});

describe('dealing with null', () => {
    it('should accept null values', async () => {
        const oDB = new Collection('test1', {
            dateRead: {
                type: INDEX_TYPES.NUMERIC,
                nullable: true,
            },
        });
        oDB.storage = new TestStorage();
        await oDB.init();
        await oDB.save('f1', {
            message: 'm1',
            dateRead: Date.now(),
        });
        await oDB.save('f2', {
            message: 'm2',
            dateRead: null,
        });
        // Two messages have been posted, one with date defined, one with date null
        const c1 = await oDB.find({ dateRead: null });
        expect(c1.keys).toEqual(['f2']);
        const c2 = await oDB.find({ dateRead: { $neq: null } });
        expect(c2.keys).toEqual(['f1']);
    });
});

describe('test boolean index', () => {
    const dbbool = [
        {
            userId: 'u1',
            deleted: false,
        },
    ];
    it('should not find doc1 when boolean field value is true', async () => {
        const c = new Collection<{ userId: string; deleted: boolean }>('c1', {
            userId: {
                type: INDEX_TYPES.PARTIAL,
                size: 0,
            },
            deleted: {
                type: INDEX_TYPES.BOOLEAN,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        await c.save('doc1', { userId: 'u1', deleted: true });

        const cursor = await c.find({ userId: 'u1', deleted: false });
        expect(cursor.count).toBe(0);

        const cursor2 = await c.find({ userId: 'u1', deleted: true });
        expect(cursor2.count).toBe(1);

        await c.save('doc1', { userId: 'u1', deleted: false });

        const cursor3 = await c.find({ userId: 'u1', deleted: false });
        expect(cursor3.count).toBe(1);

        const cursor4 = await c.find({ userId: 'u1', deleted: true });
        expect(cursor4.count).toBe(0);
    });
});
