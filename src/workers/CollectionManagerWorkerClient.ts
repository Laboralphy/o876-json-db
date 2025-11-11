import { Worker } from 'worker_threads';
import path from 'path';
import { Cursor } from '../Cursor';
import { JsonObject } from '../types/Json';
import { QueryObject } from '../types/QueryObject';
import { IndexCreationOptions } from '../Collection';

interface WorkerResponse {
    success: boolean;
    result?: unknown;
    error?: string;
}

export class CollectionManagerWorkerClient {
    private worker: Worker;

    constructor() {
        this.worker = new Worker(path.join(__dirname, 'collection-manager-worker-process.js'));
    }

    private async sendMessage<T>(action: string, data: any): Promise<T> {
        return new Promise((resolve, reject) => {
            const onMessage = (message: WorkerResponse) => {
                if (message.success) {
                    resolve(message.result as T);
                } else {
                    reject(new Error(message.error));
                }
                this.worker.off('message', onMessage);
            };
            this.worker.on('message', onMessage);
            this.worker.postMessage({ action, ...data });
        });
    }

    createCollection<T extends JsonObject>(
        id: string,
        sPath: string,
        oIndex: { [indexName: string]: IndexCreationOptions } = {}
    ): Promise<string> {
        return this.sendMessage<string>('createCollection', { id, sPath, oIndex });
    }

    save<T extends JsonObject>(id: string, key: string, oDocument: T): Promise<void> {
        return this.sendMessage<void>('save', { id, key, oDocument });
    }

    load<T extends JsonObject>(id: string, key: string): Promise<T | undefined> {
        return this.sendMessage<T | undefined>('load', { id, key });
    }

    delete<T extends JsonObject>(id: string, key: string): Promise<void> {
        return this.sendMessage<void>('delete', { id, key });
    }

    find<T extends JsonObject>(id: string, oQueryObject: QueryObject): Promise<Cursor<T>> {
        return this.sendMessage<Cursor<T>>('find', { id, oQueryObject });
    }

    terminate() {
        return this.worker.terminate();
    }
}
