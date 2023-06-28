import express, { Router } from 'express'
import Logger from '../Logger'
import Config, { HookCallback } from './Config'

const getRepositoryRouter =
    (logger: Logger, cb: HookCallback) =>
    (configs: ReadonlyArray<Config>): Router => {
        const router = express.Router()
        configs.forEach(config => {
            router.post('/' + config.repository, (req, res) => {
                try {
                    config.handleHook(req, res, cb)
                } catch (err) {
                    logger.error(`Error during handler for repository: ${config.repository}`)
                    res.send(500)
                }
            })
        })
        return router
    }

export default getRepositoryRouter
