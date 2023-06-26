import { Session } from '@prisma/client'
import prismaClient from '../prismaClient'

export interface SessionService {
    deleteSession(sid: string): Promise<void>
    getSession(sid: string): Promise<Session | null>
    upsertSession(sid: string, expires: Date, userId?: number): Promise<Session>
}

const sessionService: SessionService = {
    async deleteSession(sid) {
        console.log(`deleteSession: ${sid}`)
        await prismaClient.session.delete({
            where: {
                sid
            }
        })
    },
    async getSession(sid) {
        console.log(`getSession: ${sid}`)
        return await prismaClient.session.findUnique({
            where: {
                sid
            }
        })
    },
    async upsertSession(sid, expires, userId) {
        console.log(`upsertSession: ${sid}, ${expires}, ${userId}`)
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
}

export default sessionService
