import { Bench } from 'tinybench';
import { Collection } from './Collection';
import { INDEX_TYPES } from './enums';
import { TestStorage } from './storage-adapters/TestStorage';

function getRandomLetter() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

function getRandomWord(n: number) {
    let s = '';
    for (let i = 0; i < n; i++) {
        s += getRandomLetter();
    }
    return s;
}

type DocumentFormat = {
    id: string;
    author: string;
    title: string;
    dateCreation: number;
    flag95: boolean;
    flag80: boolean;
    flag50: boolean;
};

function createRandomDocument(id: number | string) {
    return {
        id: id.toString(),
        author: getRandomWord(8),
        title: getRandomWord(10) + ' ' + getRandomWord(10) + ' ' + getRandomWord(10),
        dateCreation: 1761668387470 - ((Math.random() * 31536000000) | 0),
        flag95: Math.random() > 0.95,
        flag80: Math.random() > 0.8,
        flag50: Math.random() > 0.5,
    };
}

function generateRealisticMessages(count: number) {
    const authors = [
        'Alice',
        'Bob',
        'Charlie',
        'Dave',
        'Eliza',
        'Fabrice',
        'Gwladys',
        'Henry',
        'Isabelle',
    ];
    const messages = [];
    for (let i = 0; i < count; i++) {
        const date = new Date('2025-10-31 12:00:00');
        date.setDate(date.getDate() - Math.floor(i / 4)); // 4 messages/jour
        messages.push({
            id: `msg${i}`,
            author: authors[i % authors.length],
            dateCreation: date.getTime(),
            subject: `Re: Project ${Math.floor(i / 100)}`,
            body: `Message content ${i}...`, // + signature aléatoire
            flag95: Math.random() > 0.7, // 30% non lus
        });
    }
    return messages;
}

function createBunchOfDocuments(n: number) {
    const aDocuments = [];
    for (let i = 0; i < n; ++i) {
        const d = createRandomDocument(i);
        aDocuments.push(d);
    }
    return aDocuments;
}

async function populateCollection(d: DocumentFormat[], c: Collection) {
    return Promise.all(d.map((doc) => c.save(doc.id, doc)));
}

class TestProcess1 {
    #documents: any[] = [];
    #cNonIndexed: Collection = new Collection('my_path', {});
    #cIndexed: Collection = new Collection('my_path', {
        dateCreation: {
            type: INDEX_TYPES.NUMERIC,
            precision: 1000 * 3600 * 24,
        },
        author: {
            type: INDEX_TYPES.PARTIAL,
            size: 4,
        },
    });

    async prepare(n: number, l: number): Promise<void> {
        this.#documents = generateRealisticMessages(n);
        const ts1 = new TestStorage();
        await ts1.createLocation('my_path');
        ts1.latency = l;
        const ts2 = new TestStorage();
        await ts2.createLocation('my_path');
        ts2.latency = l;
        this.#cNonIndexed.storage = ts1;
        this.#cIndexed.storage = ts2;
        await this.#cNonIndexed.init();
        await this.#cIndexed.init();
        await populateCollection(this.#documents, this.#cNonIndexed);
        await populateCollection(this.#documents, this.#cIndexed);
    }

    /**
     * find with a non indexed collection
     */
    async run1(): Promise<void> {
        const d = new Date('2025-09-29 12:00:00');
        await this.#cNonIndexed.find({ dateCreation: { $gte: d.getDate() } });
    }

    /**
     * find with an indexed collection
     */
    async run2(): Promise<void> {
        const d = new Date('2025-09-29 12:00:00');
        await this.#cIndexed.find({ dateCreation: { $gte: d.getDate() } });
    }
}

async function testOneShot() {
    const DOCUMENT_COUNT = 50000;
    const LATENCY = 8;

    const p = new TestProcess1();
    await p.prepare(DOCUMENT_COUNT, LATENCY);
    await p.run1();
}

async function main() {
    const DOCUMENT_COUNT = 10000;
    const LATENCY = 8;

    const suite = new Bench({
        name: `index vs non index for find ${DOCUMENT_COUNT} document by date with latency ${LATENCY}`,
        time: 20000,
    });
    const p = new TestProcess1();
    await p.prepare(DOCUMENT_COUNT, LATENCY);

    suite.add(`non indexed`, async () => {
        {
            await p.run1();
        }
    });
    suite.add(`indexed`, async () => {
        {
            await p.run2();
        }
    });

    await suite.run();
    console.log(suite.name);
    console.table(suite.table());
}

main().then(() => console.log('done'));
// testOneShot().then(() => console.log('done'));
