import { NextFunction, Response } from 'express'
import Logger from '../Logger'
import { RepositoryRequest, isGithubRepositoryRequest } from './Repository'
import { isCustomConfig } from '../config/Config'
import getGithubActionHandler from '../github/getGithubActionHandler'

const getRepositoryActionHandler = (logger: Logger) => {
    const githubActionHandler = getGithubActionHandler(logger)

    return (req: RepositoryRequest, res: Response, next: NextFunction) => {
        if (isGithubRepositoryRequest(req)) {
            githubActionHandler(req, res, next)
        } else if (req.config !== undefined && isCustomConfig(req.config)) {
            req.config.getActionHandler(logger)(req, res, next)
        } else {
            logger.error(
                `req.config is either undefined or is not a custom config: ${req.config}`
            )
            res.sendStatus(500)
            return
        }
    }
}

export default getRepositoryActionHandler
