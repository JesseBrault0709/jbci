import { Database } from 'sqlite3'
import User from '../model/User'

export type CreateUserInput = Omit<User, 'id'>

export interface UserRepository {
    create(input: CreateUserInput): Promise<User>
    delete(id: number): Promise<void>
    find(id: number): Promise<User | null>
    findMany(): Promise<User[]>
    update(id: number, input: Partial<User>): Promise<User>
}

export const createUserTable = (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE user (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
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

const getUserRepository = (db: Database): UserRepository => ({
    create(input) {
        return new Promise((resolve, reject) => {
            db.get(
                'INSERT INTO user (username, password) VALUES (?, ?) RETURNING id, username, password;',
                [input.username, input.password],
                (err, row) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        resolve(row as User)
                    }
                }
            )
        })
    },
    delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM user WHERE id=?;', [id], err => {
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
            db.get('SELECT id, username, password FROM user WHERE id=?;', [id], (err, row) => {
                if (err !== null) {
                    reject(err)
                } else if (row === undefined) {
                    resolve(null)
                } else {
                    resolve(row as User)
                }
            })
        })
    },
    findMany() {
        return new Promise((resolve, reject) => {
            db.all('SELECT id, username, password FROM user;', (err, rows) => {
                if (err !== null) {
                    reject(err)
                } else {
                    resolve(rows as User[])
                }
            })
        })
    },
    update(id, input) {
        const updates = Object.keys(input).map(key => [`${key}=?`, (input as { [key: string]: any })[key]] as const)
        const params = updates.map(tuple => tuple[0]).join(', ')
        return new Promise((resolve, reject) => {
            db.get(
                `UPDATE user SET ${params} WHERE id=? RETURNING id, username, password;`,
                [...updates.map(tuple => tuple[1]), id],
                (err, row) => {
                    if (err !== null) {
                        reject(err)
                    } else {
                        resolve(row as User)
                    }
                }
            )
        })
    }
})

export default getUserRepository
