import { Request, Response } from 'express'
import Logger from '../Logger'
import BuildScriptRunner from './BuildScriptRunner'
import { HookResult } from './HookResult'

export type HookCallback = (hr: HookResult) => void

interface Config {
    readonly repository: string
    handleHook(req: Request, res: Response, cb: HookCallback): void
}

export type ConfigSupplier = (logger: Logger, buildScriptRunner: BuildScriptRunner) => Config

export default Config
