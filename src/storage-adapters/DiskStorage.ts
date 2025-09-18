import { IStorage } from '../interfaces/IStorage';
import { FsHelper } from 'o876-fs-ts';
import path from 'node:path';
import { JsonObject } from '../types/Json';

export class DiskStorage implements IStorage {
    private readonly fs: FsHelper = new FsHelper();
    createLocation(location: string): Promise<void> {
        return this.fs.mkdir(location);
    }

    async getList(location: string): Promise<string[]> {
        const aFiles = await this.fs.ls(location);
        return aFiles.map((f: string) => path.basename(f, '.json'));
    }

    private getFilename(location: string, name: string) {
        return path.join(location, name + '.json');
    }

    async read(location: string, name: string): Promise<JsonObject | undefined> {
        try {
            const sFilename = this.getFilename(location, name);
            const sContent = await this.fs.read(sFilename, { binary: false });
            return JSON.parse(sContent.toString());
        } catch {
            return undefined;
        }
    }

    async remove(location: string, name: string): Promise<void> {
        try {
            const sFilename = this.getFilename(location, name);
            await this.fs.rm(sFilename);
        } catch {
            return;
        }
    }

    async write(location: string, name: string, data: JsonObject): Promise<void> {
        try {
            const sFilename = this.getFilename(location, name);
            await this.fs.write(sFilename, JSON.stringify(data, null, 2));
        } catch {
            return;
        }
    }
}
