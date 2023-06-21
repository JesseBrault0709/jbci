import { WebhookEvent } from '@octokit/webhooks-types'
import { Request, RequestHandler } from 'express'
import { Config, GithubConfig } from '../config/Config'

export type RepositoryParams = {
    repository: string
}

export interface RepositoryRequest<B = any>
    extends Request<RepositoryParams, any, B> {
    config?: Config
    event?: string
    rawReqBody?: string
}

export interface RepositoryRequestHandler<B = any>
    extends RequestHandler<RepositoryParams, any, B> {}

export interface GithubRequest extends RepositoryRequest<WebhookEvent> {
    config?: GithubConfig
}

export const isGithubRepositoryRequest = (
    req: RepositoryRequest
): req is GithubRequest => req.config?.type == 'github'
