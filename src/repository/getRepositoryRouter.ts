import { WebhookEvent } from '@octokit/webhooks-types'
import express, { Request, Router } from 'express'
import { Config } from '../Config'
import Logger from '../Logger'
import ScriptRunner from '../ScriptRunner'
import getRepositoryAuthMiddleware from './getRepositoryAuthMiddleware'
import getRepositoryBodyParser from './getRepositoryBodyParser'
import getRepositoryFinalHandler from './getRepositoryFinalHandler'

export type RepositoryPathParams = {
    repository: string
}

export interface RepositoryRequest
    extends Request<RepositoryPathParams, any, WebhookEvent> {
    config?: Config
    rawReqBody?: string
}

const getRepositoryRouter = (
    logger: Logger,
    configs: ReadonlyArray<Config>,
    scriptRunner: ScriptRunner
): Router => {
    const router = express.Router()
    router.post(
        '/:repository',
        getRepositoryAuthMiddleware(logger, configs),
        getRepositoryBodyParser(logger),
        getRepositoryFinalHandler(logger, scriptRunner)
    )
    return router
}

export default getRepositoryRouter
