import Build from './Build'

interface HookResult {
    _type: 'success' | 'build' | 'failure'
    id: number
    resStatusCode: number
    created: Date
}

export interface SuccessHookResult extends HookResult {
    _type: 'success'
}

export interface BuildHookResult extends HookResult {
    _type: 'build'
    build: Build
}

export interface FailureHookResult extends HookResult {
    _type: 'failure'
    msg?: string
}

export default HookResult
