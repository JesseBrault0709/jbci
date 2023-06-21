import express, { Router } from 'express'
import { Config } from '../config/Config'
import Logger from '../Logger'
import ScriptRunner from '../ScriptRunner'
import getRepositoryActionHandler from './getRepositoryActionHandler'
import getRepositoryAuthMiddleware from './getRepositoryAuthMiddleware'
import getRepositoryBodyParser from './getRepositoryBodyParser'
import getRepositoryFinalHandler from './getRepositoryFinalHandler'
import getRepositoryConfigHandler from './getRepositoryConfigHandler'

const getRepositoryRouter = (
    logger: Logger,
    configs: ReadonlyArray<Config>,
    scriptRunner: ScriptRunner
): Router => {
    const router = express.Router()
    router.post(
        '/:repository',
        getRepositoryConfigHandler(logger, configs),
        getRepositoryAuthMiddleware(logger),
        getRepositoryBodyParser(logger),
        getRepositoryActionHandler(logger),
        getRepositoryFinalHandler(logger, scriptRunner)
    )
    return router
}

export default getRepositoryRouter
