import { Config } from '../config/Config'
import Logger from '../Logger'
import { RepositoryRequest, RepositoryRequestHandler } from './Repository'

const getRepositoryConfigHandler =
    (
        logger: Logger,
        configs: ReadonlyArray<Config>
    ): RepositoryRequestHandler =>
    (req: RepositoryRequest, res, next) => {
        const config = configs.find(
            config => config.repository === req.params.repository
        )
        if (config === undefined) {
            logger.debug(
                `no such config for repository: ${req.params.repository}`
            )
            res.sendStatus(404)
            return
        } else {
            req.config = config
            next()
        }
    }

export default getRepositoryConfigHandler
