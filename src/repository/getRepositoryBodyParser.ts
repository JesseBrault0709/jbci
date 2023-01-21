import { NextFunction, Response } from 'express'
import Logger from '../Logger'
import { RepositoryRequest } from './getRepositoryRouter'

const getRepositoryBodyParser =
    (logger: Logger) =>
    (req: RepositoryRequest, res: Response, next: NextFunction) => {
        if (req.rawReqBody !== undefined) {
            try {
                req.body = JSON.parse(req.rawReqBody)
                next()
            } catch (error) {
                logger.error(error)
                res.sendStatus(400) // Bad request
            }
        } else {
            logger.error('req.rawReqBody is undefined')
            res.sendStatus(500) // Internal Server Error
        }
    }

export default getRepositoryBodyParser
