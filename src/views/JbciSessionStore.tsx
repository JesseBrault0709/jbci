import { Session } from '@prisma/client'
import { Cookie, SessionData, Store } from 'express-session'
import Logger from '../Logger'
import { SessionService } from '../services/sessionService'
import { UserService } from '../services/userService'

class JbciSessionStore extends Store {
    constructor(
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
        private readonly sessionToCookie: (session: Session) => Cookie,
        private readonly logger: Logger
    ) {
        super()
    }

    async get(sid: string, callback: (err: any, session?: SessionData | null | undefined) => void): Promise<void> {
        try {
            const session = await this.sessionService.getSession(sid)
            if (session === null) {
                callback(null, null)
            } else {
                if (session.userId === null) {
                    callback(null, {
                        cookie: this.sessionToCookie(session)
                    })
                } else {
                    try {
                        const user = await this.userService.getUserById(session.userId)
                        if (user === null) {
                        } else {
                            callback(null, {
                                cookie: this.sessionToCookie(session),
                                user
                            })
                        }
                    } catch (userServiceError) {
                        callback(userServiceError)
                    }
                }
            }
        } catch (sessionServiceErr) {
            callback(sessionServiceErr)
        }
    }

    async set(sid: string, sessionData: SessionData, callback?: ((err?: any) => void) | undefined): Promise<void> {
        try {
            await this.sessionService.upsertSession(
                sid,
                new Date(Date.now().valueOf() + sessionData.cookie.maxAge!),
                sessionData.user?.id
            )
            if (callback !== undefined) {
                callback()
            }
        } catch (err) {
            if (callback !== undefined) {
                callback(err)
            }
        }
    }

    async destroy(sid: string, callback?: ((err?: any) => void) | undefined): Promise<void> {
        try {
            await this.sessionService.deleteSessions([sid])
            if (callback !== undefined) {
                callback()
            }
        } catch (err) {
            if (callback !== undefined) {
                callback(err)
            }
        }
    }
}

export default JbciSessionStore
