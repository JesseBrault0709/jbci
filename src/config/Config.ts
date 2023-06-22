import { RepositoryRequestHandler } from '../RepositoryRequest'

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
