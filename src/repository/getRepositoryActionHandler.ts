import { NextFunction, Response } from 'express'
import Logger from '../Logger'
import { RepositoryRequest } from './getRepositoryRouter'

const getRepositoryActionHandler =
    (logger: Logger) =>
    (req: RepositoryRequest, res: Response, next: NextFunction) => {
        const action = req.headers['x-github-action']
        if (action == undefined) {
            logger.warn('x-github-action header is undefined')
        } else if (typeof action == 'string') {
            req.action = action
        } else {
            logger.warn(
                `x-github-action header is not a string, given ${action}`
            )
        }
        next()
    }

export default getRepositoryActionHandler
