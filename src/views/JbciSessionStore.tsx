import { Cookie, SessionData, Store } from 'express-session'
import sessionService from '../services/sessionService'
import userService from '../services/userService'
import { Session, User } from '@prisma/client'

declare module 'express-session' {
    interface SessionData {
        user?: User
    }
}

const getSessionCookie = (session: Session): Cookie => {
    const ttlMs = session.expires.valueOf() - session.created.valueOf()
    return {
        originalMaxAge: ttlMs,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: ttlMs
    }
}

class JbciSessionStore extends Store {
    async get(sid: string, callback: (err: any, session?: SessionData | null | undefined) => void): Promise<void> {
        console.log(`jbciSessionStore.get: ${sid}`)
        try {
            const session = await sessionService.getSession(sid)
            if (session === null) {
                callback(null, null)
            } else {
                if (session.userId === null) {
                    callback(null, {
                        cookie: getSessionCookie(session)
                    })
                } else {
                    try {
                        const user = await userService.getUserById(session.userId)
                        if (user === null) {
                        } else {
                            callback(null, {
                                cookie: getSessionCookie(session),
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
        console.log(`jbciSessionStore.set: ${sid}`)
        try {
            await sessionService.upsertSession(
                sid,
                new Date(Date.now().valueOf() + sessionData.cookie.maxAge!),
                sessionData.user?.id
            )
        } catch (err) {
            if (callback !== undefined) {
                callback(err)
            }
        }
    }

    async destroy(sid: string, callback?: ((err?: any) => void) | undefined): Promise<void> {
        console.log(`jbciSessionStore.delete: ${sid}`)
        try {
            await sessionService.deleteSession(sid)
        } catch (err) {
            if (callback !== undefined) {
                callback(err)
            }
        }
    }
}

export default JbciSessionStore
