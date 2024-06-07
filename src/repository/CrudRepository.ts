interface CrudRepository<T, C = T, U = C> {
    create(input: C): Promise<T>
    delete(id: number): Promise<void>
    find(id: number): Promise<T | null>
    findMany(): Promise<T[]>
    update(id: number, input: Partial<U>): Promise<T>
}

export default CrudRepository
