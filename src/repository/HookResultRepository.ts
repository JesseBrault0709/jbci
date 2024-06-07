import { Database } from 'sqlite3'
import HookResult, { BuildHookResult, FailureHookResult, SuccessHookResult } from '../model/HookResult'
import { CreateBuildInput, CreateBuildStateInput } from './BuildRepository'
import Build from '../model/Build'
import { join } from '@prisma/client/runtime'

export type WithoutTypeNorId = Omit<HookResult, '_type' | 'id'>

export type BaseHookResultInput = Omit<WithoutTypeNorId, 'created'> & Partial<Pick<WithoutTypeNorId, 'created'>>

export interface SuccessHookResultInput extends BaseHookResultInput {}

export interface BuildHookResultInput extends BaseHookResultInput {
    build: CreateBuildInput
}

export interface FailureHookResultInput extends BaseHookResultInput {
    msg?: string
}

export interface HookResultRepository {
    createSuccess(input: SuccessHookResultInput): Promise<SuccessHookResult>
    createBuild(input: BuildHookResultInput): Promise<BuildHookResult>
    createFailure(input: FailureHookResultInput): Promise<FailureHookResult>
    deleteSuccess(id: number): Promise<void>
    deleteBuild(id: number): Promise<void>
    deleteFailure(id: number): Promise<void>
    findSuccess(id: number): Promise<SuccessHookResult>
    findBuild(id: number): Promise<BuildHookResult>
    findFailure(id: number): Promise<FailureHookResult>
    findMany(): Promise<HookResult>
}

interface DbHookResult {
    id: number
    res_status_code: number
    created: number
}

interface DbSuccessHookResult extends DbHookResult {}

interface DbBuildHookResult extends DbHookResult {
    build_id: number
}

interface DbFailureHookResult extends DbHookResult {
    msg?: string
}

const toSuccessHookResult = (row: DbSuccessHookResult): SuccessHookResult => ({
    _type: 'success',
    id: row.id,
    created: new Date(row.created),
    resStatusCode: row.res_status_code
})

const toBuildHookResult = (row: DbBuildHookResult, build: Build): BuildHookResult => ({
    _type: 'build',
    id: row.id,
    created: new Date(row.created),
    resStatusCode: row.res_status_code,
    build
})

interface DbBuild {
    id: number
    created: number
    log?: string
}

export const createHookResultTables = (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE success_hook_result(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                res_status_code INTEGER NOT NULL,
                created INTEGER NOT NULL
            ); CREATE TABLE build_hook_result(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                res_status_code INTEGER NOT NULL,
                created INTEGER NOT NULL,
                build_id INTEGER NOT NULL,
                FOREIGN KEY (build_id) REFERENCES build(id)
            ); CREATE TABLE failure_hook_result(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                res_status_code INTEGER NOT NULL,
                created INTEGER NOT NULL,
                msg TEXT
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

const getBuildColumns = (input: CreateBuildInput): string => {
    return input.log !== undefined ? 'created, log' : 'created'
}

const getBuildValues = (input: CreateBuildInput): string => {
    return input.log !== undefined ? '?, ?' : '?'
}

const getBuildParams = (input: CreateBuildInput): ReadonlyArray<any> => {
    if (input.log !== undefined) {
        return [input.created.valueOf(), input.log]
    } else {
        return [input.created.valueOf()]
    }
}

const getBuildStateColumns = (input: CreateBuildStateInput): string => {
    const columns: string[] = []
    columns.push('timestamp')
    columns.push('progress')
    if (input.completion !== undefined) {
        columns.push('completion')
    }
    columns.push('build_id')
    return columns.join(', ')
}

const getBuildStateValues = (input: CreateBuildStateInput): string => {
    return input.completion !== undefined ? '?, ?, ?, ?' : '?, ?, ?' // 4 vs. 3 columns
}

const getBuildStateParams = (input: CreateBuildStateInput, buildId: number): ReadonlyArray<any> => {
    const params: any[] = []
    params.push(input.timestamp.valueOf())
    params.push(input.progress)
    if (input.completion !== undefined) {
        params.push(input.completion)
    }
    params.push(buildId)
    return params
}

const joinErrors = (errors: Error[]): string => {
    return errors.map(error => error.message).join('; ')
}

const getHookResultRepository = (db: Database): HookResultRepository => ({
    createSuccess(input) {
        return new Promise((resolve, reject) => {
            db.get(
                `INSERT INTO success_hook_result (res_status_code, created)
                VALUES (?, ?)
                RETURNING id, res_status_code, created;`,
                [input.resStatusCode, input.created !== undefined ? input.created.valueOf() : Date.now()],
                (err, row: DbSuccessHookResult) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        resolve(toSuccessHookResult(row))
                    }
                }
            )
        })
    },
    createBuild(input) {
        return new Promise((resolve, reject) => {
            // TODO: serialize, refactor, get BuildStates
            db.get(
                `INSERT INTO build (${getBuildColumns(input.build)})
                VALUES (${getBuildValues(input.build)})
                RETURNING id;`,
                getBuildParams(input.build),
                (err, buildRow: DbBuild) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        const errors: Error[] = []
                        input.build.states.forEach(buildState => {
                            db.run(
                                `INSERT INTO build_state (${getBuildStateColumns(buildState)})
                                VALUES (${getBuildStateValues(buildState)});`,
                                getBuildStateParams(buildState, buildRow.id),
                                err => {
                                    if (err !== null) {
                                        errors.push(err)
                                    }
                                }
                            )
                        })
                        if (errors.length > 0) {
                            reject(`There was an error/were errors while inserting BuildStates: ${joinErrors(errors)}`)
                        } else {
                            db.get(
                                `INSERT INTO build_hook_result (res_status_code, created, build_id)
                                VALUES (?, ?, ?)
                                RETURNING id, res_status_code, created;`,
                                [
                                    input.resStatusCode,
                                    input.created !== undefined ? input.created.valueOf() : Date.now(),
                                    buildRow.id
                                ],
                                (err, buildHookResultRow: Omit<DbBuildHookResult, 'build_id'>) => {
                                    if (err !== null) {
                                        reject(err)
                                    } else {
                                        resolve({
                                            _type: 'build',
                                            id: buildHookResultRow.id,
                                            resStatusCode: buildHookResultRow.res_status_code,
                                            created: new Date(buildHookResultRow.created),
                                            build: {
                                                id: buildRow.id,
                                                created: new Date(buildRow.created),
                                                log: buildRow.log,
                                                states: [] // TODO
                                            }
                                        })
                                    }
                                }
                            )
                        }
                    }
                }
            )
        })
    },
    createFailure(input) {
        return new Promise((resolve, reject) => {
            // TODO
        })
    },
    deleteSuccess(id) {
        return new Promise((resolve, reject) => {
            // TODO
        })
    },
    deleteBuild(id) {
        return new Promise((resolve, reject) => {
            // TODO
        })
    },
    deleteFailure(id) {
        return new Promise((resolve, reject) => {
            // TODO
        })
    },
    findSuccess(id) {
        return new Promise((resolve, reject) => {
            // TODO
        })
    },
    findBuild(id) {
        return new Promise((resolve, reject) => {
            // TODO
        })
    },
    findFailure(id) {
        return new Promise((resolve, reject) => {
            // TODO
        })
    },
    findMany() {
        return new Promise((resolve, reject) => {
            // TODO
        })
    }
})

export default getHookResultRepository
