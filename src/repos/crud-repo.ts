export interface CrudRepository<T> {
    getAll(): Promise<T[]>;
    getById(id: number): Promise<T>;
    addNew(newObject: T): Promise<T>;
    update(object: T): Promise<boolean>;
}