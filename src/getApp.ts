import express from 'express'
import getRepositoryRouter from './repository/getRepositoryRouter'
import Logger from './Logger'
import { Config } from './Config'
import ScriptRunner from './ScriptRunner'
import { VERSION } from './version'

export const GREETING = `<h1>Hello from jbci ${VERSION}!</h1>`

const getApp = (
    logger: Logger,
    configs: ReadonlyArray<Config>,
    scriptRunner: ScriptRunner
) => {
    const app = express()

    app.get('/', (req, res) => {
        res.send(GREETING)
    })

    app.use('/', getRepositoryRouter(logger, configs, scriptRunner))

    return app
}

export default getApp
