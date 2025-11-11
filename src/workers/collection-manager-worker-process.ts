import { parentPort } from 'worker_threads';
import { CollectionManager } from './CollectionManager';
import { IndexCreationOptions } from '../Collection';
import { JsonObject } from '../types/Json';
import { QueryObject } from '../types/QueryObject';

const manager = new CollectionManager();

// Écoute les messages du thread principal
if (parentPort) {
    parentPort.on(
        'message',
        async (message: {
            action: string;
            id: string;
            sPath?: string;
            oIndex?: { [indexName: string]: IndexCreationOptions };
            key?: string;
            oDocument?: JsonObject;
            oQueryObject?: QueryObject;
        }) => {
            try {
                let result: unknown;
                switch (message.action) {
                    case 'createCollection': {
                        result = manager.createCollection(
                            message.id,
                            message.sPath!,
                            message.oIndex || {}
                        );
                        await manager.getCollection(message.id).init();
                        break;
                    }
                    case 'save': {
                        result = await manager.save(message.id, message.key!, message.oDocument!);
                        break;
                    }
                    case 'load': {
                        result = await manager.load(message.id, message.key!);
                        break;
                    }
                    case 'delete': {
                        result = await manager.delete(message.id, message.key!);
                        break;
                    }
                    case 'find': {
                        result = await manager.find(message.id, message.oQueryObject!);
                        break;
                    }
                    default: {
                        throw new Error(`Action "${message.action}" not supported`);
                    }
                }
                parentPort!.postMessage({ success: true, result });
            } catch (error) {
                parentPort!.postMessage({ success: false, error: (error as Error).message });
            }
        }
    );
}
