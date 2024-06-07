import Session from './Session'

interface User {
    id: number
    username: string
    password: string
}

export interface UserWithSessions extends User {
    sessions: ReadonlyArray<Session>
}

export default User
