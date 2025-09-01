import { JsonObject } from '../types/Json';

export interface IStorage {
    /**
     * Returns a list of identifiers
     * These are the identifies of all objects present in the specified location
     * @param location location from where to list objects
     */
    getList(location: string): Promise<string[]>;

    /**
     * Create a new namespace for objects to be stored
     * @param location
     */
    createLocation(location: string): Promise<void>;

    /**
     * Read an item from the specified location
     * @param location
     * @param name
     */
    read(location: string, name: string): Promise<JsonObject | undefined>;

    write(location: string, name: string, data: JsonObject): Promise<void>;

    remove(location: string, name: string): Promise<void>;
}
