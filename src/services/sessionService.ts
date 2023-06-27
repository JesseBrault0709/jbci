import { PrismaClient, Session } from '@prisma/client'
import Logger from '../Logger'

export interface SessionService {
    deleteSession(sid: string): Promise<void>
    deleteSessions(sids: string[]): Promise<void>
    getSession(sid: string): Promise<Session | null>
    upsertSession(sid: string, expires: Date, userId?: number): Promise<Session>
}

const getSessionService = (prismaClient: PrismaClient, logger: Logger): SessionService => ({
    async deleteSession(sid) {
        logger.debug('deleting session...')
        await prismaClient.session.delete({
            where: {
                sid
            }
        })
    },
    async deleteSessions(sids) {
        logger.debug('deleting sesssions...')
        await prismaClient.session.deleteMany({
            where: {
                sid: {
                    in: sids
                }
            }
        })
    },
    async getSession(sid) {
        logger.debug('deleting sessions...')
        return await prismaClient.session.findUnique({
            where: {
                sid
            }
        })
    },
    async upsertSession(sid, expires, userId) {
        logger.debug(`upserting session (userId: ${userId})...`)
        return await prismaClient.session.upsert({
            create: {
                sid,
                expires,
                userId
            },
            where: {
                sid
            },
            update: {
                expires,
                userId
            }
        })
    }
})

export default getSessionService
