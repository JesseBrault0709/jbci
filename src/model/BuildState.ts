import Build from './Build'

interface BuildState {
    id: number
    timestamp: Date
    progress: 'IN_PROGRESS' | 'COMPLETED'
    completion?: 'SUCCESS' | 'FAILURE' | 'TERMINATED'
}

export interface BuildStateWithBuild extends BuildState {
    build: Build
}

export default BuildState
