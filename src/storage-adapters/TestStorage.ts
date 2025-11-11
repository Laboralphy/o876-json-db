import { IStorage } from '../interfaces/IStorage';
import { JsonObject } from '../types/Json';

export class TestStorage implements IStorage {
    #latency: number = 0;
    public data: Map<string, Map<string, JsonObject>> = new Map<string, Map<string, JsonObject>>();

    set latency(value: number) {
        this.#latency = value;
    }

    get latency() {
        return this.#latency;
    }

    async randomPause() {
        if (Math.random() > 0.95) {
            return new Promise((resolve) => {
                setTimeout(resolve, this.#latency);
            });
        }
    }

    async createLocation(location: string): Promise<void> {
        this.data.set(location, new Map<string, JsonObject>());
    }

    async getLocation(location: string): Promise<Map<string, JsonObject>> {
        const r = this.data.get(location);
        if (r) {
            return r;
        } else {
            throw new Error(`location ${location} not found`);
        }
    }

    async getList(location: string): Promise<string[]> {
        const l = await this.getLocation(location);
        await this.randomPause();
        return Array.from(l.keys());
    }

    async read(location: string, name: string): Promise<JsonObject | undefined> {
        const l = await this.getLocation(location);
        await this.randomPause();
        const document = l.get(name);
        return document !== undefined ? { ...document } : undefined;
    }

    async remove(location: string, name: string): Promise<void> {
        const l = await this.getLocation(location);
        await this.randomPause();
        l.delete(name);
    }

    async write(location: string, name: string, data: JsonObject): Promise<void> {
        const l = await this.getLocation(location);
        await this.randomPause();
        l.set(name, data);
    }
}
