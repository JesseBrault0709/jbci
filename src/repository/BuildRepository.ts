import { Database } from 'sqlite3'
import Build from '../model/Build'
import { Subscription } from './Subscription'
import BuildState from '../model/BuildState'

export type CreateBuildInput = Omit<Build, 'id' | 'states'> & {
    states: ReadonlyArray<CreateBuildStateInput>
}

export type CreateBuildStateInput = Omit<BuildState, 'id'>

export interface BuildRepository {
    appendLog(id: number, chunk: string): Promise<Build>
    appendState(buildId: number, state: CreateBuildStateInput): Promise<Build>
    create(input: CreateBuildInput): Promise<Build>
    delete(id: number): Promise<void>
    find(id: number): Promise<Build>
    findMany(): Promise<Build[]>
    subscribe(id: number): Subscription<Build>
}

export const createBuildTables = (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE build(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                created INTEGER NOT NULL,
                log TEXT
            ); CREATE TABLE build_state(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                progress TEXT NOT NULL,
                completion TEXT,
                build_id INTEGER NOT NULL UNIQUE,
                FOREIGN KEY (build_id) REFERENCES build(id)
            );`,
            err => {
                if (err !== null) {
                    reject(err)
                } else {
                    resolve()
                }
            }
        )
    })
}
