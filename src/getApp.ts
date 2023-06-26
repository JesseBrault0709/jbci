import express from 'express'
import { Config } from './config/Config'
import getRepositoryRouter from './getRepositoryRouter'
import { VERSION } from './version'
import getViewsRouter from './views/getViewsRouter'
import getApiRouter from './api/getApiRouter'
import Logger from './Logger'

export const GREETING = `<h1>Hello from jbci ${VERSION}!</h1>`

const getApp = (logger: Logger, configs: ReadonlyArray<Config>) => {
    const app = express()

    // app.get('/', (req, res) => {
    //     res.send(GREETING)
    // })

    app.use('/', getViewsRouter())

    app.use('/api', getApiRouter(logger))

    app.use('/repositories', getRepositoryRouter(configs))

    return app
}

export default getApp
