import Logger from '../Logger'
import { RepositoryRequestHandler } from '../repository/Repository'
import { Config, OnSpec } from './Config'

abstract class AbstractConfig<B, O extends OnSpec> implements Config<B, O> {
    constructor(
        protected readonly logger: Logger,
        readonly repository: string,
        readonly on: ReadonlyArray<O>
    ) {}

    abstract getBodyHandler(): RepositoryRequestHandler<B, O>

    abstract getAuthHandler(): RepositoryRequestHandler<B, O>

    abstract getEventHandler(): RepositoryRequestHandler<B, O>

    abstract getOnSpecHandler(): RepositoryRequestHandler<B, O>

    abstract getFinalHandler(): RepositoryRequestHandler<B, O>
}

export default AbstractConfig
