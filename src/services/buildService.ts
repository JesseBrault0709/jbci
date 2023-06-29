import { Build, PrismaClient } from '@prisma/client'
import Logger from '../Logger'
import { CompletionStatus, Progress } from '../config/Build'

export interface BuildService {
    appendLog(id: number, msg: string): Promise<Build>
    getBuild(id: number): Promise<Build | null>
    pushState(id: number, progress: Progress, completionStatus: CompletionStatus): Promise<Build>
}

const getBuildService = (prismaClient: PrismaClient, logger: Logger): BuildService => ({
    async appendLog(id, msg) {
        const oldLog = await prismaClient.build.findUnique({
            where: {
                id
            },
            select: {
                log: true
            }
        })
        if (oldLog === null) {
            throw new Error(`no such Build with id in db: ${id}`)
        }
        return await prismaClient.build.update({
            where: {
                id
            },
            data: {
                log: (oldLog.log ?? '') + msg
            }
        })
    },
    async getBuild(id) {
        return await prismaClient.build.findUnique({
            where: {
                id
            }
        })
    },
    async pushState(id, progress, completionStatus) {
        return await prismaClient.build.update({
            where: {
                id
            },
            data: {
                states: {
                    create: {
                        progress,
                        completionStatus
                    }
                }
            }
        })
    }
})

export default getBuildService
