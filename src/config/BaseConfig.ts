import { Request, Response } from 'express'
import { BodyParser } from './BodyParser'
import Config from './Config'
import * as hr from './HookResult'

abstract class BaseConfig<B> implements Config {
    constructor(readonly repository: string) {}

    handleHook(req: Request, res: Response, cb: (hr: hr.HookResult) => void): void {
        const bodyParser = this.getBodyParser()
        bodyParser.on('parsed', async (body, rawBody) => {
            try {
                if (await this.authorize(body, rawBody, req)) {
                    try {
                        cb(await this.toHookResult(body, req, res))
                    } catch (err) {
                        res.sendStatus(500)
                        cb(hr.getFailure(500, `There was an error during toHookResult: ${err}`, err))
                    }
                } else {
                    res.sendStatus(401)
                    cb(hr.getFailure(401, `Unauthorized.`))
                }
            } catch (err) {
                res.sendStatus(500)
                cb(hr.getFailure(500, `There was an error during authorize: ${err}`, err))
            }
        })
        bodyParser.on('error', err => {
            res.sendStatus(500)
            cb(hr.getFailure(500, `There was an error during body parsing: ${err}`, err))
        })
        req.pipe(bodyParser)
    }

    protected abstract getBodyParser(): BodyParser<B>

    protected abstract authorize(body: B, rawBody: string, req: Request): boolean | Promise<boolean>

    protected abstract toHookResult(body: B, req: Request, res: Response): hr.HookResult | Promise<hr.HookResult>
}

export default BaseConfig
