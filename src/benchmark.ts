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
    dateCreation: number;
    subject: string;
    body: string;
    read: boolean;
};

const AUTHORS = [
    'Alice',
    'Bob',
    'Charlie',
    'Dave',
    'Eliza',
    'Fabrice',
    'Gwendolyn',
    'Henry',
    'Isabelle',
    'Johanna',
];

function generateRealisticMessages(count: number) {
    const authors = AUTHORS;
    const messages = [];
    const dateNow = new Date('2025-10-31 12:00:00');
    for (let i = 0; i < count; i++) {
        const date = new Date(dateNow.getTime());
        date.setDate(date.getDate() - Math.floor(i / 4)); // 4 messages/jour

        messages.push({
            id: `msg${i}`,
            author: authors[i % authors.length],
            dateCreation: date.getTime(),
            subject: `Re: Project ${Math.floor(i / 100)}`,
            body: `Message content ${i}...`, // + signature aléatoire
            read: Math.random() > 0.7, // 70% non lus
        });
    }
    return messages;
}

async function populateCollection(d: DocumentFormat[], c: Collection<DocumentFormat>) {
    return Promise.all(d.map((doc) => c.save(doc.id, doc)));
}

class TestProcess1 {
    #documents: any[] = [];
    #cNonIndexed: Collection<DocumentFormat> = new Collection('my_path', {});
    #cIndexed: Collection<DocumentFormat> = new Collection('my_path', {
        dateCreation: {
            type: INDEX_TYPES.NUMERIC,
            precision: 1000 * 3600 * 24,
        },
        author: {
            type: INDEX_TYPES.PARTIAL,
            size: 0,
            caseInsensitive: true,
        },
        read: {
            type: INDEX_TYPES.BOOLEAN,
        },
    });

    get collections() {
        return {
            indexed: this.#cIndexed,
            nonIndexed: this.#cNonIndexed,
        };
    }

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
    async qGetMessageFrom09_29_NonIndex(): Promise<void> {
        const d = new Date('2025-09-29 12:00:00');
        await this.#cNonIndexed.find({ dateCreation: { $gte: d.getDate() } });
    }

    /**
     * find with an indexed collection
     */
    async qGetMessageFrom09_29_Index(): Promise<void> {
        const d = new Date('2025-09-29 12:00:00');
        await this.#cIndexed.find({ dateCreation: { $gte: d.getDate() } });
    }

    async qGetMessageMultiUser_last30days_NonIndex(): Promise<void> {
        const d = new Date('2025-09-29 12:00:00');
        await this.#cNonIndexed.find({
            author: 'Eliza',
            dateCreation: { $gte: d.getDate() },
            read: false,
        });
    }

    async qGetMessageMultiUser_last30days_Index(): Promise<void> {
        const d = new Date('2025-09-29 12:00:00');
        await this.#cIndexed.find({
            author: 'Eliza',
            dateCreation: { $gte: d.getDate() },
            read: false,
        });
    }
}

async function main() {
    const DOCUMENT_COUNT = 7000;
    const LATENCY = 8;

    const suite = new Bench({
        name: `find ${DOCUMENT_COUNT} document by date with latency ${LATENCY}`,
        time: 10000,
    });
    const p = new TestProcess1();
    await p.prepare(DOCUMENT_COUNT, LATENCY);

    suite.add(`one numeric search opt`, async () => {
        {
            await p.qGetMessageFrom09_29_Index();
        }
    });
    suite.add(`3 search opt, date, name, read`, async () => {
        {
            await p.qGetMessageMultiUser_last30days_Index();
        }
    });

    await suite.run();
    console.log(suite.name);
    console.table(suite.table());
}

main().then(() => console.log('done'));
