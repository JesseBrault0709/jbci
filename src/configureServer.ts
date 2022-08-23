import http from 'http'
import { Config } from './Config'
import { Log } from './getLog'
import getUrlParser from './getUrlParser'
import crypto from 'crypto'
import getScriptRunner from './getScriptRunner'

const configureServer =
    (debugLog: Log, infoLog: Log, errorLog: Log) =>
    (server: http.Server, configs: ReadonlyArray<Config>) => {
        const urlParser = getUrlParser(debugLog, errorLog)
        const scriptRunner = getScriptRunner(infoLog, errorLog)

        server.on('request', (req, res) => {
            infoLog(`received req at: ${req.url}`)
            debugLog(
                `X-Hub-Signature-256: ${req.headers['x-hub-signature-256']}`
            )

            const signature = (
                req.headers['x-hub-signature-256'] as string | undefined
            )?.slice(7)
            debugLog(`signature: ${signature}`)

            const { repository, action } = urlParser(req)
            const config = configs.find(
                config => config.repository === repository
            )
            const onSpec = config?.on.find(onSpec => onSpec.action === action)

            if (
                signature !== undefined &&
                config !== undefined &&
                onSpec !== undefined
            ) {
                debugLog(
                    `signature present and found config and onSpec for ${repository}/${action}`
                )
                const hmac = crypto.createHmac('sha256', onSpec.secret, {
                    encoding: 'hex'
                })
                req.pipe(hmac)
                let digest = ''

                hmac.on('readable', () => {
                    digest += hmac.read()
                })

                req.on('end', () => {
                    debugLog(`digest: ${digest}`)
                    try {
                        if (
                            crypto.timingSafeEqual(
                                Buffer.from(digest),
                                Buffer.from(signature)
                            )
                        ) {
                            scriptRunner(config, onSpec)
                        } else {
                            errorLog('digest and signature are not equal!')
                        }
                    } catch (err) {
                        errorLog(err)
                    }
                })
            }

            res.end('thank you')
        })
    }

export default configureServer
