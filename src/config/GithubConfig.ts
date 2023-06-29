import { WebhookEvent } from '@octokit/webhooks-types'
import crypto from 'crypto'
import { Request, Response } from 'express'
import BaseConfig from './BaseConfig'
import { BodyParser } from './BodyParser'
import BuildScriptRunner from './BuildScriptRunner'
import GithubConfigFile, { GithubOnSpec } from './GithubConfigFile'
import * as hr from './HookResult'

class GithubConfig extends BaseConfig<WebhookEvent> {
    constructor(
        repository: string,
        private readonly secret: string,
        private readonly onSpecs: ReadonlyArray<GithubOnSpec>,
        private readonly buildScriptRunner: BuildScriptRunner
    ) {
        super(repository)
    }

    protected getBodyParser(): BodyParser<WebhookEvent> {
        return new BodyParser(rawBody => JSON.parse(rawBody))
    }

    private static getSignature(req: Request): string | undefined {
        const hubSignatureHeader = req.headers['x-hub-signature-256']
        if (hubSignatureHeader != undefined && typeof hubSignatureHeader == 'string') {
            return hubSignatureHeader.slice(7) // Starts with 'sha256='
        } else {
            return undefined
        }
    }

    protected authorize(body: WebhookEvent, rawBody: string, req: Request): boolean | Promise<boolean> {
        const signature = GithubConfig.getSignature(req)
        if (signature === undefined) {
            return false
        }

        const hmac = crypto.createHmac('sha256', this.secret)
        hmac.update(rawBody)
        const digest = hmac.digest('hex')

        try {
            if (crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
                return true
            } else {
                return false
            }
        } catch (err) {
            return Promise.reject(err)
        }
    }

    protected async toHookResult(body: WebhookEvent, req: Request, res: Response): Promise<hr.HookResult> {
        const githubEvent = req.headers['x-github-event']
        if (githubEvent === undefined || typeof githubEvent !== 'string') {
            return Promise.reject(`x-github-event is either undefined or not a string: ${githubEvent}`)
        }

        if (githubEvent === 'ping') {
            res.sendStatus(200)
            return hr.getEmptySuccess(200)
        }

        const onSpec = this.onSpecs.find(onSpec => {
            if ('ref' in body && onSpec.ref === body.ref && onSpec.event === githubEvent) {
                return true
            } else {
                return onSpec.event === githubEvent
            }
        })
        if (onSpec === undefined) {
            res.sendStatus(404)
            return hr.getFailure(404, `OnSpec not found.`)
        }

        res.sendStatus(200)
        return hr.getBuild(200, await this.buildScriptRunner.toBuild(onSpec.script))
    }
}

export const getGithubConfigFactory =
    (buildScriptRunner: BuildScriptRunner) =>
    ({ repository, on, secret }: GithubConfigFile) => {
        return new GithubConfig(repository, secret, on, buildScriptRunner)
    }

export default GithubConfig
