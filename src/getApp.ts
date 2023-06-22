import express from 'express'
import { Config } from './config/Config'
import getRepositoryRouter from './repository/getRepositoryRouter'
import { VERSION } from './version'

export const GREETING = `<h1>Hello from jbci ${VERSION}!</h1>`

const getApp = (configs: ReadonlyArray<Config>) => {
    const app = express()

    app.get('/', (req, res) => {
        res.send(GREETING)
    })

    app.use('/repositories', getRepositoryRouter(configs))

    return app
}

export default getApp
