import express, { Router } from 'express'
import { Config, OnSpec } from './config/Config'
import {
    RepositoryRequest,
    RepositoryRequestHandler
} from './RepositoryRequest'

const getSetupHandler =
    <B, O extends OnSpec>(
        config: Config<B, O>
    ): RepositoryRequestHandler<B, O> =>
    (req: RepositoryRequest<B, O>, res, next) => {
        req.config = config
        next()
    }

const getRepositoryRouter = (configs: ReadonlyArray<Config>): Router => {
    const router = express.Router()
    configs.forEach(config => {
        router.post(
            '/' + config.repository,
            getSetupHandler(config),
            config.getBodyHandler(),
            config.getAuthHandler(),
            config.getEventHandler(),
            config.getOnSpecHandler(),
            config.getFinalHandler()
        )
    })
    return router
}

export default getRepositoryRouter
