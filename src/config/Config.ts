import Logger from '../Logger'
import { RepositoryRequestHandler } from '../RepositoryRequest'
import ScriptRunner from '../ScriptRunner'

export interface Config<B = any, O extends OnSpec = OnSpec> {
    readonly repository: string
    readonly on: ReadonlyArray<O>
    getBodyHandler(): RepositoryRequestHandler<B, O>
    getAuthHandler(): RepositoryRequestHandler<B, O>
    getEventHandler(): RepositoryRequestHandler<B, O>
    getOnSpecHandler(): RepositoryRequestHandler<B, O>
    getFinalHandler(): RepositoryRequestHandler<B, O>
}

export interface OnSpec {
    event: string
    script: string
}

export interface ConfigFile<O extends OnSpec = OnSpec> {
    type: 'github' | 'custom'
    repository: string
    on: ReadonlyArray<O>
}

export type ConfigSupplier = (
    logger: Logger,
    scriptRunner: ScriptRunner
) => Config

/**
 * TODO: more robust. Perhaps pull in io-ts?
 */
export const isConfig = (u: unknown): u is Config => {
    if (u === null || u === undefined) {
        return false
    }
    if (typeof u !== 'object') {
        return false
    }
    if (
        'repository' in u &&
        typeof u.repository === 'string' &&
        'on' in u &&
        typeof u.on === 'object'
    ) {
        return true
    }
    return false
}
