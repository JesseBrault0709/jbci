import crypto from 'crypto'
import http from 'http'
import { Config } from './Config'
import Logger from './Logger'
import ScriptRunner from './ScriptRunner'
import UrlParser from './UrlParser'

export type ServerSpec = {
    logger: Logger
    server: http.Server
    configs: ReadonlyArray<Config>
    scriptsDir: string
    scriptLogsDir: string
}

const getSignature = (req: http.IncomingMessage) =>
    (req.headers['x-hub-signature-256'] as string | undefined)?.slice(7)

const configureServer = (spec: ServerSpec) => {
    const { logger, server, configs, scriptsDir, scriptLogsDir } = spec

    const urlParser = new UrlParser(logger)
    const scriptRunner = new ScriptRunner(logger, scriptsDir, scriptLogsDir)

    server.on('request', (req, res) => {
        logger.info(`received req at: ${req.url}`)
        logger.debug(
            `X-Hub-Signature-256: ${req.headers['x-hub-signature-256']}`
        )

        const signature = getSignature(req)
        logger.debug(`signature: ${signature}`)

        if (signature === undefined) {
            res.statusCode = 401 // unauthorized
            res.end()
        } else {
            const { repository, action } = urlParser.parse(req)
            const config = configs.find(
                config => config.repository === repository
            )
            const onSpec = config?.on.find(onSpec => onSpec.action === action)

            if (config !== undefined && onSpec !== undefined) {
                logger.debug(
                    `signature present and found config and onSpec for ${repository}/${action}`
                )
                const hmac = crypto.createHmac('sha256', onSpec.secret)

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
                            try {
                                await scriptRunner.runOnSpec(onSpec)
                                res.statusCode = 200 // success
                                res.end()
                            } catch (err) {
                                logger.error(err)
                                res.statusCode = 500 // internal server error
                                res.end()
                            }
                        } else {
                            logger.error('digest and signature are not equal!')
                            res.statusCode = 401 // unauthorized
                            res.end()
                        }
                    } catch (err) {
                        logger.error(err)
                        res.statusCode = 401 // unauthorized
                        res.end()
                    }
                })
            } else {
                res.statusCode = 400 // bad request
                res.end()
            }
        }
    })
}

export default configureServer
