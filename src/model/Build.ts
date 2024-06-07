import BuildState from './BuildState'
import { BuildHookResult } from './HookResult'

interface Build {
    id: number
    created: Date
    log?: String
    states: ReadonlyArray<BuildState>
}

export interface BuildWithBuildHookResult extends Build {
    buildHookResult?: BuildHookResult
}

export default Build
