import { Log } from './getLog'
import http from 'http'

const getUrlParser =
    (debugLog: Log, errorLog: Log) =>
    (
        req: http.IncomingMessage
    ): {
        repository?: string
        action?: string
    } => {
        try {
            const url = new URL(req.url ?? '', `https://${req.headers.host}`)
            debugLog(`url: ${JSON.stringify(url, undefined, 2)}`)
            const segments = url.pathname.split('/')
            // segements[0] is '' (because of starting '/'), segments[1] is repository, segments[2] is action
            segments.shift()
            const repository = segments.shift()
            const action = segments.shift()
            return {
                repository,
                action
            }
        } catch (err) {
            errorLog(err)
        }
        return {}
    }

export default getUrlParser
