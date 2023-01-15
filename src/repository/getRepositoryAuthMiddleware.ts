import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { Config } from '../Config'
import Logger from '../Logger'
import { RepositoryRequest } from './getRepositoryRouter'

const getRepositoryAuthMiddleware = (
    logger: Logger,
    configs: ReadonlyArray<Config>
) => {
    const getSignature = (req: Request): string | undefined => {
        const hubSignatureHeader = req.headers['x-hub-signature-256']
        logger.debug(`X-Hub-Signature-256: ${hubSignatureHeader}`)
        if (
            hubSignatureHeader != undefined &&
            typeof hubSignatureHeader == 'string'
        ) {
            return hubSignatureHeader.slice(7) // TODO: find out why it's 7
        } else {
            return undefined
        }
    }

    return (req: RepositoryRequest, res: Response, next: NextFunction) => {
        // Find the Config
        const config = configs.find(
            config => config.repository === req.params.repository
        )
        if (config === undefined) {
            res.sendStatus(404) // Not Found
            return
        }

        // Get the X-Hub-Signature 256
        const signature = getSignature(req)
        if (signature == undefined) {
            res.sendStatus(401) // Unauthorized
            return
        }

        logger.debug(
            `signature present and found config for ${config.repository}`
        )

        const hmac = crypto.createHmac('sha256', config.secret)

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
                    req.config = config
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

export default getRepositoryAuthMiddleware
