import Logger from '../Logger'
import {
    RepositoryRequest,
    RepositoryRequestHandler
} from '../repository/Repository'

const getGithubActionHandler =
    (logger: Logger): RepositoryRequestHandler =>
    (req: RepositoryRequest, res, next) => {
        const githubEvent = req.headers['x-github-event']
        if (githubEvent == undefined) {
            logger.warn('x-github-event header is undefined')
        } else if (typeof githubEvent == 'string') {
            req.event = githubEvent
        } else {
            logger.warn(
                `x-github-event header is not a string, given ${githubEvent}`
            )
        }
        next()
    }

export default getGithubActionHandler
