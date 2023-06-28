import { Build } from './Build'

export interface HookResult {
    type: 'success' | 'build' | 'failure'
    resStatusCode: number
}

export interface EmptySuccessHookResult extends HookResult {
    type: 'success'
}

export const getEmptySuccess = (resStatusCode: number): EmptySuccessHookResult => ({
    type: 'success',
    resStatusCode
})

export const isEmptySuccess = (hr: HookResult): hr is EmptySuccessHookResult => hr.type === 'success'

export interface BuildHookResult extends HookResult {
    type: 'build'
    build: Build
}

export const getBuild = (resStatusCode: number, build: Build): BuildHookResult => ({
    type: 'build',
    resStatusCode,
    build
})

export const isBuild = (hr: HookResult): hr is BuildHookResult => hr.type === 'build'

export interface FailureHookResult extends HookResult {
    type: 'failure'
    msg?: string
    err?: unknown
}

export const getFailure = (resStatusCode: number, msg?: string, err?: any): FailureHookResult => ({
    type: 'failure',
    resStatusCode,
    msg,
    err
})

export const isFailure = (hr: HookResult): hr is FailureHookResult => hr.type === 'failure'
