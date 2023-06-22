import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Config, OnSpec } from './config/Config'

export type RepositoryParams = {}

export interface RepositoryRequest<B, O extends OnSpec> extends Request<RepositoryParams, any, B> {
    config?: Config<B, O>
    event?: string
    onSpec?: O
    rawBody?: string
}

export interface RepositoryRequestHandler<B, O extends OnSpec> extends RequestHandler<RepositoryParams, any, B> {
    (req: RepositoryRequest<B, O>, res: Response, next: NextFunction): void
}
