import { EventEmitter } from 'events'

export type BuildStatus = 'SUCCESS' | 'FAILURE' | 'TERMINATED'

export type BuildLogMessageLevel = 'OUT' | 'ERROR'

export interface BuildEvents {
    completed: (status: BuildStatus) => void
    log: (level: BuildLogMessageLevel, msg: any) => void
    terminated: (signal: NodeJS.Signals) => void
}

export interface Build extends EventEmitter {
    emit: <E extends keyof BuildEvents>(event: E, ...args: Parameters<BuildEvents[E]>) => boolean
    on: <E extends keyof BuildEvents>(event: E, listener: BuildEvents[E]) => this
}
