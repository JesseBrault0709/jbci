import { Build, Prisma, PrismaClient } from '@prisma/client'
import Logger from '../Logger'

export interface BuildService {
    getBuild(id: number): Promise<Build | null>
    updateBuild(id: number, input: Prisma.BuildUpdateInput): Promise<Build>
}

const getBuildService = (prismaClient: PrismaClient, logger: Logger): BuildService => ({
    async getBuild(id) {
        return await prismaClient.build.findUnique({
            where: {
                id
            }
        })
    },
    async updateBuild(id, input) {
        return await prismaClient.build.update({
            where: {
                id
            },
            data: input
        })
    }
})

export default getBuildService
