import { Response } from 'express'
import {
    RepositoryRequest,
    RepositoryRequestHandler
} from '../repository/Repository'
import AbstractConfig from './AbstractConfig'
import { OnSpec } from './Config'

abstract class BaseConfig<B, O extends OnSpec> extends AbstractConfig<B, O> {
    protected abstract parseBody(
        rawBody: string,
        req: RepositoryRequest<B, O>
    ): Promise<B>

    getBodyHandler(): RepositoryRequestHandler<B, O> {
        return (req: RepositoryRequest<B, O>, res, next) => {
            let rawBody = ''
            req.on('data', chunk => {
                rawBody += chunk
            })
            req.on('end', async () => {
                this.logger.debug(`rawBody: ${rawBody}`)
                req.rawBody = rawBody
                try {
                    req.body = await this.parseBody(rawBody, req)
                    next()
                } catch (err) {
                    this.logger.error(`Error while parsing body: ${err}`)
                    res.sendStatus(500)
                }
            })
        }
    }

    protected abstract parseAuth(req: RepositoryRequest<B, O>): Promise<boolean>

    getAuthHandler(): RepositoryRequestHandler<B, O> {
        return async (req: RepositoryRequest<B, O>, res, next) => {
            try {
                if (await this.parseAuth(req)) {
                    next()
                } else {
                    res.sendStatus(401) // Unauthorized
                }
            } catch (err) {
                this.logger.error(`Error while parsing auth: ${err}`)
                res.sendStatus(500)
            }
        }
    }

    protected abstract parseEvent(
        body: B,
        req: RepositoryRequest<B, O>
    ): Promise<string>

    getEventHandler(): RepositoryRequestHandler<B, O> {
        return async (req: RepositoryRequest<B, O>, res, next) => {
            try {
                req.event = await this.parseEvent(req.body, req)
                next()
            } catch (err) {
                this.logger.error(`Error while parsing event: ${err}`)
                res.sendStatus(500)
            }
        }
    }

    getOnSpecHandler(): RepositoryRequestHandler<B, O> {
        return (req: RepositoryRequest<B, O>, res, next) => {
            if (req.event === undefined) {
                this.logger.error('req.event is undefined')
                res.sendStatus(500)
            } else {
                const onSpec = this.on.find(
                    onSpec => onSpec.event === req.event
                )
                if (onSpec === undefined) {
                    this.logger.error(
                        `Could not find an onSpec for event: ${req.event}`
                    )
                    res.sendStatus(404)
                } else {
                    req.onSpec = onSpec
                    next()
                }
            }
        }
    }

    protected abstract doAction(
        req: RepositoryRequest<B, O>,
        res: Response
    ): void

    getFinalHandler(): RepositoryRequestHandler<B, O> {
        return (req: RepositoryRequest<B, O>, res, next) => {
            this.doAction(req, res)
            next()
        }
    }
}

export default BaseConfig
