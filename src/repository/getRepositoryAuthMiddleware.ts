import { isCustomConfig, isGithubConfig } from '../config/Config'
import Logger from '../Logger'
import getGithubAuthMiddleware from '../github/getGithubAuthMiddleware'
import { RepositoryRequest, RepositoryRequestHandler } from './Repository'

const getRepositoryAuthMiddleware = (
    logger: Logger
): RepositoryRequestHandler => {
    const githubAuth = getGithubAuthMiddleware(logger)

    return (req: RepositoryRequest, res, next) => {
        if (isGithubConfig(req.config)) {
            githubAuth(req, res, next)
        } else if (isCustomConfig(req.config)) {
            req.config.getAuthMiddleware(logger)(req, res, next)
        } else {
            logger.error(
                `req.config is either undefined or not a valid config type: ${req.config}`
            )
            res.sendStatus(500)
            return
        }
    }
}

export default getRepositoryAuthMiddleware
