import crypto from 'crypto'
import Logger from '../Logger'
import {
    RepositoryRequest,
    RepositoryRequestHandler
} from '../repository/Repository'
import { isGithubConfig } from '../config/Config'

const getGithubAuthMiddleware = (logger: Logger): RepositoryRequestHandler => {
    const getSignature = (req: RepositoryRequest): string | undefined => {
        const hubSignatureHeader = req.headers['x-hub-signature-256']
        logger.debug(`X-Hub-Signature-256: ${hubSignatureHeader}`)
        if (
            hubSignatureHeader != undefined &&
            typeof hubSignatureHeader == 'string'
        ) {
            return hubSignatureHeader.slice(7) // Starts with 'sha256='
        } else {
            return undefined
        }
    }

    return (req: RepositoryRequest, res, next) => {
        // Get the X-Hub-Signature 256
        const signature = getSignature(req)
        if (signature == undefined) {
            res.sendStatus(401) // Unauthorized
            return
        }

        if (req.config === undefined || !isGithubConfig(req.config)) {
            logger.error(
                `req.config is undefined or is not a GithubConfig: ${req.config}`
            )
            res.sendStatus(500) // internal server error
            return
        }

        logger.debug(
            `signature present and found config for ${req.config.repository}`
        )

        const hmac = crypto.createHmac('sha256', req.config.secret)

        let reqBody = ''
        req.on('data', chunk => {
            reqBody += chunk
            hmac.update(chunk)
        })

        req.on('end', async () => {
            logger.debug(`reqBody: ${reqBody}`)
            const digest = hmac.digest('hex')
            logger.debug(`digest: ${digest}`)
            try {
                if (
                    crypto.timingSafeEqual(
                        Buffer.from(digest),
                        Buffer.from(signature)
                    )
                ) {
                    req.rawReqBody = reqBody
                    next()
                } else {
                    logger.error('digest and signature are not equal!')
                    res.sendStatus(401) // Unauthorized
                }
            } catch (error) {
                logger.error(error)
                res.sendStatus(400) // Bad Request
            }
        })
    }
}

export default getGithubAuthMiddleware
