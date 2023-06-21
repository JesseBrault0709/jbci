import { isCustomConfig } from '../config/Config'
import Logger from '../Logger'
import ScriptRunner from '../ScriptRunner'
import getGithubFinalHandler from '../github/getGithubFinalHandler'
import {
    RepositoryRequest,
    RepositoryRequestHandler,
    isGithubRepositoryRequest
} from './Repository'

const getRepositoryFinalHandler = (
    logger: Logger,
    scriptRunner: ScriptRunner
): RepositoryRequestHandler => {
    const githubFinalHandler = getGithubFinalHandler(logger, scriptRunner)

    return async (req: RepositoryRequest, res, next) => {
        if (req.event === undefined) {
            logger.error('req.event is undefined')
            res.sendStatus(500)
            return
        }

        if (isGithubRepositoryRequest(req)) {
            githubFinalHandler(req, res, next)
        } else if (isCustomConfig(req.config)) {
            req.config.getFinalHandler(logger, scriptRunner)(req, res, next)
        } else {
            logger.error(
                `req.config is undefined or not a proper config type: ${req.config}`
            )
            res.sendStatus(500)
            return
        }
    }
}

export default getRepositoryFinalHandler
