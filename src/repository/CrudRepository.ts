interface CrudRepository<T> {
    create(t: T): Promise<T>
    delete(id: number): Promise<void>
    find(id: number): Promise<T | null>
    findMany(): Promise<T[]>
    update(input: Partial<T>): Promise<T>
}

export default CrudRepository
