import { IStorage } from '../interfaces/IStorage';
import path from 'node:path';
import { JsonObject } from '../types/Json';
import fs from 'node:fs/promises';

export class DiskStorage implements IStorage {
    async createLocation(location: string): Promise<void> {
        await fs.mkdir(location, { recursive: true });
    }

    async getList(location: string): Promise<string[]> {
        const aFiles = await fs.readdir(location, { recursive: false });
        return aFiles.map((f: string) => path.basename(f, '.json'));
    }

    private getFilename(location: string, name: string) {
        return path.join(location, name + '.json');
    }

    async read(location: string, name: string): Promise<JsonObject | undefined> {
        try {
            const sFilename = this.getFilename(location, name);
            const sContent = await fs.readFile(sFilename, { encoding: 'utf8' });
            return JSON.parse(sContent.toString());
        } catch {
            return undefined;
        }
    }

    async remove(location: string, name: string): Promise<void> {
        try {
            const sFilename = this.getFilename(location, name);
            await fs.rm(sFilename, { force: true });
        } catch {
            return;
        }
    }

    async write(location: string, name: string, data: JsonObject): Promise<void> {
        try {
            const sFilename = this.getFilename(location, name);
            await fs.writeFile(sFilename, JSON.stringify(data, null, 2), { encoding: 'utf8' });
        } catch {
            return;
        }
    }
}
