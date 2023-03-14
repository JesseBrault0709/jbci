import { NextFunction, Response } from 'express'
import Logger from '../Logger'
import { RepositoryRequest } from './getRepositoryRouter'

const getRepositoryActionHandler =
    (logger: Logger) =>
    (req: RepositoryRequest, res: Response, next: NextFunction) => {
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

export default getRepositoryActionHandler
