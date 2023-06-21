import Logger from '../Logger'
import {
    RepositoryRequest,
    RepositoryRequestHandler
} from '../repository/Repository'

const getJsonBodyParser =
    (logger: Logger): RepositoryRequestHandler =>
    (req: RepositoryRequest, res, next) => {
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

export default getJsonBodyParser
