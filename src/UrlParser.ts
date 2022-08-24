import http from 'http'
import Logger from './Logger'

export type UrlParseResult = {
    repository?: string
    action?: string
}

class UrlParser {
    constructor(private logger: Logger) {}

    parse(req: http.IncomingMessage): UrlParseResult {
        try {
            const url = new URL(req.url ?? '', `https://${req.headers.host}`)
            this.logger.debug(`url: ${JSON.stringify(url, undefined, 2)}`)
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
            this.logger.error(err)
        }
        return {}
    }
}

export default UrlParser
