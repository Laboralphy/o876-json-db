import { Bench } from 'tinybench';
import { Collection } from './Collection';
import { INDEX_TYPES } from './enums';
import { TestStorage } from './storage-adapters/TestStorage';

interface MyTestProcess {
    prepare(): Promise<void>;
    run(n: number): Promise<void>;
}

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

class TestProcess1 implements MyTestProcess {
    #documents: DocumentFormat[] = [];
    #cNonIndexed: Collection = new Collection('my_path', {});
    #cIndexed: Collection = new Collection('my_path', {
        dateCreation: {
            type: INDEX_TYPES.NUMERIC,
            precision: 1000 * 3600 * 24,
        },
    });

    async prepare(): Promise<void> {
        this.#documents = createBunchOfDocuments(200);
        const ts1 = new TestStorage();
        await ts1.createLocation('my_path');
        ts1.latency = 8;
        const ts2 = new TestStorage();
        await ts2.createLocation('my_path');
        ts2.latency = 8;
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
        await this.#cNonIndexed.find({ dateCreation: { $gte: 1761668387470 - 2592000000 } });
    }

    /**
     * find with an indexed collection
     */
    async run2(): Promise<void> {
        await this.#cIndexed.find({ dateCreation: { $gte: 1761668387470 - 2592000000 } });
    }

    async run(n: 1 | 2): Promise<void> {
        switch (n) {
            case 1: {
                return this.run1();
            }
            case 2: {
                return this.run2();
            }
            default: {
                break;
            }
        }
    }
}

async function main() {
    const suite = new Bench({
        name: 'index vs non index for find 2000 document by date',
        time: 1000,
    });
    const p = new TestProcess1();
    await p.prepare();

    suite.add('non indexed 2000 docs', async () => {
        {
            await p.run(1);
        }
    });
    suite.add('indexed 2000 docs', async () => {
        {
            await p.run(2);
        }
    });

    await suite.run();
    console.log(suite.name);
    console.table(suite.table());
}

main().then(() => console.log('done'));
