import Logger from '../Logger'
import { RepositoryRequestHandler } from '../repository/Repository'

export const getCustomAuthMiddleware = (
    logger: Logger
): RepositoryRequestHandler => {
    return (req, res, next) => {
        // TODO
    }
}
