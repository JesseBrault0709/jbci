import { EventEmitter } from 'events'
import { Database } from 'sqlite3'

export interface SubscriptionEvents<T> {
    update: (updated: T) => void
    delete: () => void
}

export interface Subscription<T> {
    emit: <E extends keyof SubscriptionEvents<T>>(event: E, ...args: Parameters<SubscriptionEvents<T>[E]>) => boolean
    on: <E extends keyof SubscriptionEvents<T>>(event: E, listener: SubscriptionEvents<T>[E]) => this
}

export class Subscription<T> extends EventEmitter {
    private readonly dbListener: (type: string, database: string, table: string, rowid: number) => void

    constructor(
        private readonly db: Database,
        subscribedTable: string,
        subscribedRowId: number,
        getUpdatedModel: (id: number) => T
    ) {
        super()
        this.dbListener = (type, database, table, rowid) => {
            if (type === 'update' && table === subscribedTable && rowid === subscribedRowId) {
                this.emit('update', getUpdatedModel(rowid))
            } else if (type === 'delete' && table === subscribedTable && rowid === subscribedRowId) {
                this.emit('delete')
            }
        }
        db.on('change', this.dbListener)
    }

    unsubscribe() {
        this.db.removeListener('change', this.dbListener)
    }
}
