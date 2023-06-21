import { isCustomConfig, isGithubConfig } from '../config/Config'
import Logger from '../Logger'
import getJsonBodyParser from '../middleware/getJsonBodyParser'
import { RepositoryRequest, RepositoryRequestHandler } from './Repository'

const getRepositoryBodyParser = (logger: Logger): RepositoryRequestHandler => {
    const jsonBodyParser = getJsonBodyParser(logger)

    return (req: RepositoryRequest, res, next) => {
        if (isGithubConfig(req.config)) {
            jsonBodyParser(req, res, next)
        } else if (isCustomConfig(req.config)) {
            req.config.getBodyParser(logger)(req, res, next)
        } else {
            logger.error(
                `req.config is either undefined or an invalid type: ${req.config}`
            )
            res.sendStatus(500)
            return
        }
    }
}

export default getRepositoryBodyParser
