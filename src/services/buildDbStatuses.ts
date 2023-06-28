import { CompletionStatus, Progress } from '../repository/Build'

export const buildDbProgress: { [S in Progress]: S } = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
}

export const buildDbCompletionStatuses: {
    [S in CompletionStatus]: S
} = {
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    TERMINATED: 'TERMINATED'
}
