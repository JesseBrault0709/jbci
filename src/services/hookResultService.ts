import { BuildHookResult, EmptySuccessHookResult, FailureHookResult, PrismaClient } from '@prisma/client'
import Logger from '../Logger'
import * as hr from '../config/HookResult'
import { buildDbProgress } from './buildDbStatuses'

export interface HookResultService {
    clear(): Promise<void>
    getEmptySuccesses(): Promise<ReadonlyArray<EmptySuccessHookResult>>
    getBuilds(): Promise<ReadonlyArray<BuildHookResult>>
    getFailures(): Promise<ReadonlyArray<FailureHookResult>>
    saveEmptySuccess(result: hr.EmptySuccessHookResult): Promise<EmptySuccessHookResult>
    saveBuild(result: hr.BuildHookResult): Promise<BuildHookResult>
    saveFailure(result: hr.FailureHookResult): Promise<FailureHookResult>
}

const getHookResultService = (prismaClient: PrismaClient, logger: Logger): HookResultService => ({
    async clear() {
        await prismaClient.$transaction([
            prismaClient.emptySuccessHookResult.deleteMany(),
            prismaClient.buildHookResult.deleteMany(),
            prismaClient.failureHookResult.deleteMany()
        ])
    },
    async getBuilds() {
        return await prismaClient.buildHookResult.findMany()
    },
    async getEmptySuccesses() {
        return await prismaClient.emptySuccessHookResult.findMany()
    },
    async getFailures() {
        return await prismaClient.failureHookResult.findMany()
    },
    async saveEmptySuccess(result) {
        return await prismaClient.emptySuccessHookResult.create({
            data: {
                resStatusCode: result.resStatusCode
            }
        })
    },
    async saveBuild(result) {
        return await prismaClient.buildHookResult.create({
            data: {
                resStatusCode: result.resStatusCode,
                build: {
                    create: {
                        states: {
                            create: {
                                progress: buildDbProgress.IN_PROGRESS
                            }
                        }
                    }
                }
            }
        })
    },
    async saveFailure(result) {
        return await prismaClient.failureHookResult.create({
            data: {
                resStatusCode: result.resStatusCode,
                msg: result.msg
            }
        })
    }
})

export default getHookResultService
