import { Database } from 'sqlite3'
import Session, { SessionWithOptionalUser, SessionWithUser } from '../model/Session'
import User from '../model/User'
import { identity } from '../util/fn'

export type CreateSessionInput = Omit<Session, 'id'>

export interface CreateSessionWithUserInput extends CreateSessionInput {
    userId: number
}

export type UpdateSessionInput = Omit<Session, 'id'>

export interface UpdateSessionWithUserInput extends UpdateSessionInput {
    userId: number
}

export interface SessionRepository {
    create(input: CreateSessionInput): Promise<Session>
    createWithUser(input: CreateSessionWithUserInput): Promise<SessionWithUser>
    delete(id: number): Promise<void>
    deleteByUser(userId: number): Promise<void>
    find(id: number): Promise<Session | null>
    findWithUser(id: number): Promise<SessionWithOptionalUser | null>
    findMany(): Promise<Session[]>
    findManyWithUser(): Promise<SessionWithOptionalUser[]>
    findManyByUser(userId: number): Promise<SessionWithUser[]>
    update(id: number, input: Partial<UpdateSessionInput>): Promise<Session>
    updateWithUser(id: number, input: Partial<UpdateSessionWithUserInput>): Promise<SessionWithOptionalUser>
}

export const createSessionTable = (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE session(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                sid TEXT NOT NULL UNIQUE,
                created INTEGER NOT NULL,
                user_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES user(id)
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

interface DbSession {
    id: number
    sid: string
    created: number
    user_id?: number | null
}

interface DbSessionWithUser {
    id: number
    sid: string
    created: number
    user_id?: number | null
    username?: string | null
    password?: string | null
}

type DbSessionWithUserNotNullUser = {
    [P in keyof DbSessionWithUser]-?: NonNullable<DbSessionWithUser[P]>
}

const isDbFindWithUserNotNullUser = (row: DbSessionWithUser): row is DbSessionWithUserNotNullUser =>
    row.user_id !== null && row.user_id !== undefined

const toSession = ({ id, sid, created }: DbSession): Session => ({
    id,
    sid,
    created: new Date(created)
})

const toSessionWithUser = (dbSession: DbSession, user: User): SessionWithUser => ({
    ...toSession(dbSession),
    user
})

const getSessionRepository = (db: Database): SessionRepository => ({
    create(input) {
        return new Promise((resolve, reject) => {
            db.get(
                'INSERT INTO session (sid, created) VALUES (?, ?) RETURNING id, sid, created;',
                [input.sid, input.created.valueOf()],
                (err, row: DbSession) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        resolve(toSession(row))
                    }
                }
            )
        })
    },
    createWithUser(input) {
        return new Promise((resolve, reject) => {
            db.get(
                'INSERT INTO session (sid, created, user_id) VALUES (?, ?, ?) RETURNING id, sid, created, user_id;',
                [input.sid, input.created.valueOf(), input.userId],
                (err, sessionRow: DbSession) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        db.get(
                            'SELECT id, username, password FROM user WHERE id=?;',
                            [sessionRow.user_id],
                            (err, userRow) => {
                                if (err !== null) {
                                    reject(err)
                                } else {
                                    resolve(toSessionWithUser(sessionRow, userRow as User))
                                }
                            }
                        )
                    }
                }
            )
        })
    },
    delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM session WHERE id=?;', [id], err => {
                if (err !== null) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    },
    deleteByUser(userId) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM session WHERE user_id=?;', [userId], err => {
                if (err !== null) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    },
    find(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, sid, created FROM session WHERE id=?;', [id], (err, row?: DbSession) => {
                if (err !== null) {
                    reject(err)
                } else if (row !== undefined) {
                    resolve(toSession(row))
                } else {
                    resolve(null)
                }
            })
        })
    },
    findWithUser(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT session.id, session.sid, session.created, user.id AS user_id, user.username, user.password
                FROM session
                LEFT OUTER JOIN user ON session.user_id = user.id
                WHERE session.id = ?;`,
                [id],
                (err, row?: DbSessionWithUser) => {
                    if (err !== null) {
                        reject(err)
                    } else if (row !== undefined && isDbFindWithUserNotNullUser(row)) {
                        resolve({
                            id: row.id,
                            sid: row.sid,
                            created: new Date(row.created),
                            user: {
                                id: row.user_id,
                                username: row.username,
                                password: row.password
                            }
                        })
                    } else if (row !== undefined) {
                        resolve(toSession(row))
                    } else {
                        resolve(null)
                    }
                }
            )
        })
    },
    findMany() {
        return new Promise((resolve, reject) => {
            db.all('SELECT id, sid, created FROM session;', (err, rows: ReadonlyArray<DbSession>) => {
                if (err !== null) {
                    reject(err)
                } else {
                    resolve(rows.map(toSession))
                }
            })
        })
    },
    findManyWithUser() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT session.id, session.sid, session.created, user.id AS user_id, user.username, user.password 
                FROM session 
                LEFT JOIN user ON session.user_id = user.id;`,
                (err, rows: ReadonlyArray<DbSessionWithUser>) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        resolve(
                            rows.map(row => {
                                if (isDbFindWithUserNotNullUser(row)) {
                                    return toSessionWithUser(row, {
                                        id: row.user_id,
                                        username: row.username,
                                        password: row.password
                                    })
                                } else {
                                    return toSession(row)
                                }
                            })
                        )
                    }
                }
            )
        })
    },
    findManyByUser(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT session.id, session.sid, session.created, user.id AS user_id, user.username, user.password
                FROM session
                INNER JOIN user ON session.user_id = user.id
                WHERE session.user_id = ?;`,
                [userId],
                (err, rows: ReadonlyArray<DbSessionWithUserNotNullUser>) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        resolve(
                            rows.map(row =>
                                toSessionWithUser(row, {
                                    id: row.user_id,
                                    username: row.username,
                                    password: row.password
                                })
                            )
                        )
                    }
                }
            )
        })
    },
    update(id, input) {
        const keyMap: { [key: string]: string } = {
            id: 'id',
            sid: 'sid',
            created: 'created'
        }
        const valueMap: { [key: string]: (value: any) => any } = {
            id: identity,
            sid: identity,
            created: (created: Date) => created.valueOf()
        }
        const updates = Object.keys(input).map(
            key => [`${keyMap[key]} = ?`, valueMap[key]((input as { [key: string]: any })[key])] as const
        )
        const params = updates.map(update => update[0]).join(', ')
        return new Promise((resolve, reject) => {
            db.get(
                `UPDATE session SET ${params} WHERE id = ? RETURNING id, sid, created, user_id;`,
                [...updates.map(update => update[1]), id],
                (err, row: DbSession) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        resolve(toSession(row))
                    }
                }
            )
        })
    },
    updateWithUser(id, input) {
        const keyMap: { [key: string]: string } = {
            id: 'id',
            sid: 'sid',
            created: 'created',
            userId: 'user_id'
        }
        const valueMap: { [key: string]: (value: any) => any } = {
            id: identity,
            sid: identity,
            created: (created: Date) => created.valueOf(),
            userId: identity
        }
        const updates = Object.keys(input).map(
            key => [`${keyMap[key]} = ?`, valueMap[key]((input as { [key: string]: any })[key])] as const
        )
        const params = updates.map(update => update[0]).join(', ')
        return new Promise((resolve, reject) => {
            db.get(
                `UPDATE session SET ${params} WHERE id = ? RETURNING id, sid, created, user_id;`,
                [...updates.map(update => update[1]), id],
                (err, row: DbSession) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        db.get(
                            `SELECT session.id, session.sid, session.created, user.id AS user_id, user.username, user.password
                            FROM session
                            INNER JOIN user ON session.user_id = user.id
                            WHERE session.id = ?;`,
                            [row.id],
                            (err, row: DbSessionWithUser) => {
                                if (err !== null) {
                                    reject(err)
                                } else if (isDbFindWithUserNotNullUser(row)) {
                                    resolve(
                                        toSessionWithUser(row, {
                                            id: row.user_id,
                                            username: row.username,
                                            password: row.password
                                        })
                                    )
                                } else {
                                    resolve(toSession(row))
                                }
                            }
                        )
                    }
                }
            )
        })
    }
})

export default getSessionRepository
