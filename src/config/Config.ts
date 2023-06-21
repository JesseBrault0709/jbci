import { NextFunction, Response } from 'express'
import Logger from '../Logger'
import { RepositoryRequest } from '../repository/Repository'
import ScriptRunner from '../ScriptRunner'

export interface Config<O extends OnSpec = OnSpec> {
    type: 'github' | 'custom'
    repository: string
    on: ReadonlyArray<O>
}

export interface GithubConfig extends Config<GithubOnSpec> {
    type: 'github'
    secret: string
}

export interface CustomConfig<B = any> extends Config {
    type: 'custom'
    getAuthMiddleware: (
        logger: Logger
    ) => (req: RepositoryRequest, res: Response, next: NextFunction) => void
    getBodyParser: (
        logger: Logger
    ) => (req: RepositoryRequest, res: Response, next: NextFunction) => void
    getActionHandler: (
        logger: Logger
    ) => (req: RepositoryRequest<B>, res: Response, next: NextFunction) => void
    getFinalHandler: (
        logger: Logger,
        scriptRunner: ScriptRunner
    ) => (req: RepositoryRequest<B>, res: Response, next: NextFunction) => void
}

export interface OnSpec {
    event: string
    script: string
}

export interface GithubOnSpec extends OnSpec {
    ref?: string
}

export const isGithubConfig = (config?: Config): config is GithubConfig =>
    config?.type === 'github'

export const isCustomConfig = (config?: Config): config is CustomConfig =>
    config?.type === 'custom'
