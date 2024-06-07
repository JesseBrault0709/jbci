import User from './User'

interface Session {
    id: number
    sid: string
    created: Date
}

export interface SessionWithOptionalUser extends Session {
    user?: User
}

export type SessionWithUser = Required<SessionWithOptionalUser>

export default Session
