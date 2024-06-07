import { Database } from 'sqlite3'
import { createUserTable } from './UserRepository'
import { createSessionTable } from './SessionRepository'

const initDatabase = (db: Database): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run('PRAGMA foreign_keys = ON;', async err => {
            if (err !== null) {
                reject(err)
            } else {
                try {
                    await createUserTable(db)
                    await createSessionTable(db)
                    resolve()
                } catch (err) {
                    reject(err)
                }
            }
        })
    })
}

export default initDatabase
