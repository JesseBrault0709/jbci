import express from 'express'
import Logger from './Logger'
import Config, { HookCallback } from './config/Config'
import getRepositoryRouter from './config/getRepositoryRouter'
import Services from './services/Services'
import getViewsRouter from './views/getViewsRouter'

const getApp = (services: Services, logger: Logger, configs: ReadonlyArray<Config>, cb: HookCallback) => {
    const app = express()
    app.use('/', getViewsRouter(services, logger))
    app.use('/repositories', getRepositoryRouter(logger, cb)(configs))
    return app
}

export default getApp
