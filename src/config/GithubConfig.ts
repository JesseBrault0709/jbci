import { WebhookEvent } from '@octokit/webhooks-types'
import crypto from 'crypto'
import { Response } from 'express'
import Logger from '../Logger'
import { RepositoryRequest, RepositoryRequestHandler } from '../RepositoryRequest'
import ScriptRunner from '../ScriptRunner'
import BaseConfig from './BaseConfig'
import { ConfigFile, OnSpec } from './Config'

export interface GithubOnSpec extends OnSpec {
    ref?: string
}

class GithubConfig extends BaseConfig<WebhookEvent, GithubOnSpec> {
    constructor(
        logger: Logger,
        repository: string,
        onSpecs: ReadonlyArray<GithubOnSpec>,
        private secret: string,
        private scriptRunner: ScriptRunner
    ) {
        super(logger, repository, onSpecs)
    }

    private getSignature(req: RepositoryRequest<WebhookEvent, GithubOnSpec>): string | undefined {
        const hubSignatureHeader = req.headers['x-hub-signature-256']
        this.logger.debug(`X-Hub-Signature-256: ${hubSignatureHeader}`)
        if (hubSignatureHeader != undefined && typeof hubSignatureHeader == 'string') {
            return hubSignatureHeader.slice(7) // Starts with 'sha256='
        } else {
            return undefined
        }
    }

    protected parseAuth(req: RepositoryRequest<WebhookEvent, GithubOnSpec>): Promise<boolean> {
        const signature = this.getSignature(req)
        if (signature === undefined) {
            return Promise.resolve(false)
        }

        if (req.rawBody === undefined) {
            throw new Error('req.rawBody is undefined')
        }
        const { rawBody } = req

        const hmac = crypto.createHmac('sha256', this.secret)
        hmac.update(rawBody)
        const digest = hmac.digest('hex')
        this.logger.debug(`digest: ${digest}`)

        try {
            if (crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
                return Promise.resolve(true)
            } else {
                return Promise.resolve(false)
            }
        } catch (err) {
            return Promise.reject(err)
        }
    }

    protected parseBody(rawBody: string): Promise<WebhookEvent> {
        return Promise.resolve(JSON.parse(rawBody))
    }

    protected parseEvent(body: WebhookEvent, req: RepositoryRequest<WebhookEvent, GithubOnSpec>): Promise<string> {
        const githubEvent = req.headers['x-github-event']
        if (githubEvent !== undefined && typeof githubEvent === 'string') {
            return Promise.resolve(githubEvent)
        } else {
            return Promise.reject(`githubEvent is undefined or not a string: ${githubEvent}`)
        }
    }

    getOnSpecHandler(): RepositoryRequestHandler<WebhookEvent, GithubOnSpec> {
        return (req: RepositoryRequest<WebhookEvent, GithubOnSpec>, res, next) => {
            if (req.event === undefined) {
                this.logger.error('req.event is undefined')
                res.sendStatus(500)
            } else if (req.event === 'ping') {
                next()
            } else {
                super.getOnSpecHandler()(req, res, next)
            }
        }
    }

    private runScript(onSpec: OnSpec) {
        try {
            this.scriptRunner.runOnSpec(onSpec)
        } catch (err) {
            this.logger.error(err)
        }
    }

    protected doAction({ body, event, onSpec }: RepositoryRequest<WebhookEvent, GithubOnSpec>, res: Response): void {
        if (event === 'ping') {
            this.logger.info(`received successful github ping for repository ${this.repository}`)
            res.sendStatus(200)
        } else if (onSpec !== undefined) {
            if ('ref' in body && onSpec.ref !== undefined) {
                if (body.ref === onSpec.ref) {
                    res.sendStatus(200)
                    this.runScript(onSpec)
                } else if (onSpec.ref !== undefined) {
                    this.logger.error(
                        `onSpec.ref !== undefined && body.ref !== onSpec.ref: body.ref: ${body.ref}, onSpec.ref: ${onSpec.ref}`
                    )
                    res.sendStatus(404)
                }
            } else {
                res.sendStatus(200)
                this.runScript(onSpec)
            }
        } else {
            this.logger.error('onSpec is undefined')
            res.sendStatus(500)
        }
    }
}

export interface GithubConfigFile extends ConfigFile<GithubOnSpec> {
    type: 'github'
    secret: string
}

export const isGithubConfigFile = (configFile: ConfigFile): configFile is GithubConfigFile =>
    configFile.type === 'github'

export const getGithubConfig =
    (logger: Logger, scriptRunner: ScriptRunner) =>
    ({ repository, on, secret }: GithubConfigFile) => {
        return new GithubConfig(logger, repository, on, secret, scriptRunner)
    }

export default GithubConfig
